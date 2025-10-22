import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { generateTradingSignal } from "./services/openaiService";
import { apiLogger } from "./utils/apiLogger";
import { isMarketOpen } from "./services/marketService";
import { insertSignalSchema, insertNewsSchema } from "@shared/schema";
import { getSignalStatus } from "./signalLifecycle";
import { notificationService } from "./services/notificationService";
import { forexFactoryService } from "./services/forexFactoryService";
import { tradingViewService } from "./services/tradingViewService";
import { verificationService } from "./services/verificationService";
import { rateLimitService } from "./services/rateLimitService";
import { sharingDetectionService } from "./services/sharingDetectionService";
import { authService } from "./services/authService";
import { passwordResetService } from "./services/passwordResetService";
import { sanitizeUser } from "./utils/userSanitizer";
import { z } from "zod";

// Independent authentication middleware
const isAuthenticated = async (req: any, res: any, next: any) => {
  try {
    const user = (req.session as any)?.user;
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if account is active  
    if (!user.isActive) {
      return res.status(401).json({ message: "Account is disabled" });
    }

    // Check if account is locked
    if (user.accountLocked) {
      return res.status(401).json({ message: "Account is locked" });
    }

    // Set up user for downstream middleware (sharing detection, etc.)
    req.user = {
      claims: { sub: user.id },
      normalizedUser: user
    };

    // Check if email is verified (required for all authenticated actions)
    // Skip this check for verification, onboarding endpoints, and user profile fetch
    const skipVerificationPaths = [
      '/api/auth/user',
      '/api/auth/send-email-verification',
      '/api/auth/send-phone-verification',
      '/api/auth/verify-email',
      '/api/auth/verify-phone',
      '/api/onboarding/select-plan',
      '/api/onboarding/save-responses'
    ];
    
    if (!skipVerificationPaths.some(path => req.path.includes(path))) {
      if (user.email && !user.emailVerified) {
        return res.status(403).json({ 
          message: "Email verification required",
          code: "EMAIL_VERIFICATION_REQUIRED",
          email: user.email
        });
      }
    }
    
    return next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

// Global sharing detection middleware
const sharingDetectionMiddleware = async (req: any, res: any, next: any) => {
  try {
    // Skip middleware for certain endpoints to prevent infinite loops and verification flows
    const skipPaths = [
      '/api/security/sharing-check', 
      '/api/auth/logout',
      '/api/auth/send-email-verification',
      '/api/auth/send-phone-verification',
      '/api/auth/verify-email',
      '/api/auth/verify-phone',
      '/api/onboarding/' // Skip all onboarding routes
    ];
    if (skipPaths.some(path => req.path.includes(path))) {
      return next();
    }

    const userId = req.user?.claims?.sub;
    if (!userId) {
      return next(); // No user, let other middleware handle
    }

    // Skip sharing detection for users still in onboarding or admin users
    const user = await storage.getUser(userId);
    if (user && (!user.emailVerified || !user.onboardingCompleted || user.subscriptionTier === 'admin')) {
      return next(); // User is still onboarding or is admin, skip sharing detection
    }

    const deviceId = req.headers['x-device-id'] || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || '';

    // Perform sharing detection with enforcement
    const detectionResult = await sharingDetectionService.detectAndEnforce(
      userId, 
      deviceId, 
      ipAddress, 
      userAgent, 
      storage
    );

    // If blocked due to high confidence sharing, deny the request
    if (detectionResult.enforcement?.blocked) {
      console.log(`[SHARING-BLOCK] Blocking request for user ${userId} due to sharing detection`);
      return res.status(403).json({ 
        message: 'Access denied due to account sharing policy violation.',
        reason: detectionResult.reason,
        confidence: detectionResult.confidence,
        enforcement: detectionResult.enforcement
      });
    }

    // Add detection result to request for route handlers to use if needed
    req.sharingDetection = detectionResult;
    
    next();
  } catch (error) {
    console.error('Error in sharing detection middleware:', error);
    // Fail open - allow request to continue if middleware fails
    next();
  }
};

const generateSignalRequestSchema = z.object({
  timeframe: z.enum(['5M', '15M', '30M', '1H', '4H', '1D', '1W']),
});

const verificationTokenSchema = z.object({
  token: z.string().length(6, "Verification code must be 6 digits").regex(/^\d{6}$/, "Verification code must contain only digits")
});

// Helper function to apply lifecycle status to signals
function applyLifecycleStatus(signals: any[]) {
  return signals.map(signal => {
    const currentStatus = getSignalStatus(signal.createdAt, signal.timeframe);
    return {
      ...signal,
      status: currentStatus
    };
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - setup Replit auth if enabled
  try {
    await setupAuth(app);
  } catch (error) {
    console.log("Replit auth setup failed, using independent auth only:", error);
  }

  // Unified authentication middleware for /api/auth/user
  const unifyUserIdentity = async (req: any, res: any, next: any) => {
    try {
      let userId: string | undefined;
      let user: any;

      // Try independent authentication first
      if ((req.session as any)?.user) {
        user = (req.session as any).user;
        userId = user.id;
      } 
      // Fall back to Replit authentication
      else if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
        if (userId) {
          user = await storage.getUser(userId);
        }
      }

      if (!userId || !user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if account is active  
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      // Check if account is locked
      if (user.accountLocked) {
        return res.status(401).json({ message: "Account is locked" });
      }

      // Normalize user identity for downstream middleware (sharing detection)
      req.user = {
        ...req.user,
        claims: { sub: userId },
        normalizedUser: user
      };

      return next();
    } catch (error) {
      console.error("User identity unification error:", error);
      return res.status(500).json({ message: "Authentication error" });
    }
  };

  // Auth routes - Support both Replit and Independent authentication
  app.get('/api/auth/user', unifyUserIdentity, sharingDetectionMiddleware, async (req: any, res) => {
    try {
      let user = req.user.normalizedUser;
      const userId = user.id;
      
      // Check and perform daily reset if needed
      const currentTime = new Date();
      const casablancaTime = new Date(currentTime.toLocaleString("en-US", {timeZone: "Africa/Casablanca"}));
      const lastReset = new Date(user.lastCreditReset || 0);
      const lastResetCasablanca = new Date(lastReset.toLocaleString("en-US", {timeZone: "Africa/Casablanca"}));
      
      const needsReset = casablancaTime.getDate() !== lastResetCasablanca.getDate() || 
                        casablancaTime.getMonth() !== lastResetCasablanca.getMonth() ||
                        casablancaTime.getFullYear() !== lastResetCasablanca.getFullYear();
      
      if (needsReset) {
        console.log(`[AUTH] Daily reset needed for user ${userId}`);
        await storage.resetDailyCredits(userId);
        // Fetch updated user data after reset
        user = await storage.getUser(userId);
        console.log(`[AUTH] Daily credits reset for user ${userId}, new daily credits: ${user?.dailyCredits}`);
      }
      
      // Sanitize user data before sending to client (remove password hash, tokens)
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile update endpoint
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, alias } = req.body;

      if (!firstName || typeof firstName !== 'string') {
        return res.status(400).json({ message: "First name is required" });
      }

      // Update user profile
      await storage.updateUser(userId, {
        firstName: firstName.trim(),
        lastName: lastName?.trim() || null,
        alias: alias?.trim() || null,
      });

      const updatedUser = await storage.getUser(userId);
      res.json({ success: true, user: sanitizeUser(updatedUser) });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Update user avatar
  app.patch('/api/user/avatar', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { profileImageUrl } = req.body;

      if (!profileImageUrl || typeof profileImageUrl !== 'string') {
        return res.status(400).json({ message: "Avatar ID is required" });
      }

      // Update user avatar
      await storage.updateUser(userId, {
        profileImageUrl: profileImageUrl.trim()
      });

      const updatedUser = await storage.getUser(userId);
      res.json({ success: true, user: sanitizeUser(updatedUser) });
    } catch (error) {
      console.error("Error updating avatar:", error);
      res.status(500).json({ message: "Failed to update avatar" });
    }
  });

  // User plan update endpoint
  app.put('/api/user/plan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { plan } = req.body;

      const validPlans = ['free', 'starter_trader', 'pro_trader'];
      if (!plan || !validPlans.includes(plan)) {
        return res.status(400).json({ message: "Invalid plan selected" });
      }

      // Set credit limits based on plan
      const planLimits = {
        free: { maxDaily: 2, maxMonthly: 10 },
        starter_trader: { maxDaily: 10, maxMonthly: 60 },
        pro_trader: { maxDaily: 999999, maxMonthly: 999999 } // Effectively unlimited
      };
      
      const limits = planLimits[plan as keyof typeof planLimits];

      // Update subscription tier and credit limits
      await storage.updateUser(userId, {
        subscriptionTier: plan,
        maxDailyCredits: limits.maxDaily,
        maxMonthlyCredits: limits.maxMonthly
      });

      // Reset credits based on new plan
      const user = await storage.getUser(userId);
      if (user) {
        await storage.resetDailyCredits(userId);
      }

      const updatedUser = await storage.getUser(userId);
      res.json({ success: true, user: sanitizeUser(updatedUser) });
    } catch (error) {
      console.error("Error updating plan:", error);
      res.status(500).json({ message: "Failed to update plan" });
    }
  });

  // Verification endpoints
  app.post('/api/auth/send-email-verification', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check rate limit first
      const rateLimit = rateLimitService.checkSendLimit(req, userId);
      if (!rateLimit.allowed) {
        const resetInMinutes = Math.ceil((rateLimit.resetTime! - Date.now()) / (1000 * 60));
        return res.status(429).json({ 
          message: `Too many verification requests. Please try again in ${resetInMinutes} minute${resetInMinutes !== 1 ? 's' : ''}.`,
          resetTime: rateLimit.resetTime,
          remainingAttempts: 0
        });
      }

      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.email) {
        return res.status(400).json({ message: "No email address found for user" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      // Generate OTP and send email
      const token = verificationService.generateOTP();
      const expiresAt = verificationService.getExpiryTime();
      
      const emailResult = await verificationService.sendEmailVerification({
        to: user.email,
        firstName: user.firstName || undefined,
        token
      });

      if (!emailResult.success) {
        return res.status(500).json({ message: emailResult.error || "Failed to send verification email" });
      }

      // Store verification token
      await storage.setEmailVerificationToken(userId, token, expiresAt);

      // Log session for abuse detection
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || '';
      await storage.logUserSession(userId, ipAddress, userAgent);

      res.json({ 
        success: true, 
        message: "Verification code sent to your email",
        expiresIn: 10 // minutes
      });
    } catch (error) {
      console.error("Error sending email verification:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  app.post('/api/auth/send-phone-verification', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check rate limit first
      const rateLimit = rateLimitService.checkSendLimit(req, userId);
      if (!rateLimit.allowed) {
        const resetInMinutes = Math.ceil((rateLimit.resetTime! - Date.now()) / (1000 * 60));
        return res.status(429).json({ 
          message: `Too many verification requests. Please try again in ${resetInMinutes} minute${resetInMinutes !== 1 ? 's' : ''}.`,
          resetTime: rateLimit.resetTime,
          remainingAttempts: 0
        });
      }

      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get phone number from request body or existing user phone
      const phoneNumber = req.body.phoneNumber || user.phoneNumber;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      // If user doesn't have a phone number yet, update their profile
      if (!user.phoneNumber && req.body.phoneNumber) {
        await storage.upsertUser({ 
          id: userId, 
          phoneNumber: req.body.phoneNumber,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        });
      }

      if (user.phoneVerified) {
        return res.status(400).json({ message: "Phone number is already verified" });
      }

      // Generate OTP and send SMS
      const token = verificationService.generateOTP();
      const expiresAt = verificationService.getExpiryTime();
      
      const smsResult = await verificationService.sendSMSVerification({
        phoneNumber: phoneNumber,
        token
      });

      if (!smsResult.success) {
        return res.status(500).json({ message: smsResult.error || "Failed to send verification SMS" });
      }

      // Store verification token
      await storage.setPhoneVerificationToken(userId, token, expiresAt);

      // Log session for abuse detection
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || '';
      await storage.logUserSession(userId, ipAddress, userAgent);

      res.json({ 
        success: true, 
        message: "Verification code sent to your phone",
        expiresIn: 10 // minutes
      });
    } catch (error) {
      console.error("Error sending phone verification:", error);
      res.status(500).json({ message: "Failed to send verification SMS" });
    }
  });

  app.post('/api/auth/verify-email', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check rate limit first
      const rateLimit = rateLimitService.checkVerifyLimit(req, userId);
      if (!rateLimit.allowed) {
        const resetInMinutes = Math.ceil((rateLimit.resetTime! - Date.now()) / (1000 * 60));
        return res.status(429).json({ 
          message: `Too many verification attempts. Please try again in ${resetInMinutes} minute${resetInMinutes !== 1 ? 's' : ''}.`,
          resetTime: rateLimit.resetTime,
          remainingAttempts: 0
        });
      }

      // Validate input
      const validation = verificationTokenSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid verification code format",
          errors: validation.error.errors
        });
      }

      const { token } = validation.data;

      const verification = await storage.verifyEmailToken(userId, token);

      if (!verification.success) {
        if (verification.expired) {
          return res.status(400).json({ message: "Verification code has expired" });
        }
        return res.status(400).json({ message: "Invalid verification code" });
      }

      // Mark email as verified
      await storage.markEmailVerified(userId);

      // Check if user has completed onboarding questions, if so mark onboarding as complete
      const user = await storage.getUser(userId);
      if (user && user.heardFrom && user.tradingExperience && user.selectedPlan) {
        await storage.upsertUser({
          id: userId,
          onboardingCompleted: true
        });
      }

      const updatedUser = await storage.getUser(userId);
      if (updatedUser) {
        const { password: _, ...userWithoutPassword } = updatedUser;
        (req.session as any).user = userWithoutPassword;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      res.json({ 
        success: true, 
        message: "Email verified successfully" 
      });
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  app.post('/api/auth/verify-phone', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check rate limit first
      const rateLimit = rateLimitService.checkVerifyLimit(req, userId);
      if (!rateLimit.allowed) {
        const resetInMinutes = Math.ceil((rateLimit.resetTime! - Date.now()) / (1000 * 60));
        return res.status(429).json({ 
          message: `Too many verification attempts. Please try again in ${resetInMinutes} minute${resetInMinutes !== 1 ? 's' : ''}.`,
          resetTime: rateLimit.resetTime,
          remainingAttempts: 0
        });
      }

      // Validate input
      const validation = verificationTokenSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid verification code format",
          errors: validation.error.errors
        });
      }

      const { token } = validation.data;

      const verification = await storage.verifyPhoneToken(userId, token);

      if (!verification.success) {
        if (verification.expired) {
          return res.status(400).json({ message: "Verification code has expired" });
        }
        return res.status(400).json({ message: "Invalid verification code" });
      }

      // Mark phone as verified
      await storage.markPhoneVerified(userId);

      res.json({ 
        success: true, 
        message: "Phone number verified successfully" 
      });
    } catch (error) {
      console.error("Error verifying phone:", error);
      res.status(500).json({ message: "Failed to verify phone number" });
    }
  });

  // Independent authentication routes
  const registrationSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
  });

  const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  });

  // Registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      // Validate input
      const validation = registrationSchema.safeParse(req.body);
      if (!validation.success) {
        // Format validation errors into user-friendly messages
        const errorMessages = validation.error.errors.map(err => {
          const field = err.path.join('.');
          return `${field}: ${err.message}`;
        });
        return res.status(400).json({
          message: errorMessages.join(', '),
          errors: validation.error.errors
        });
      }

      const { email, password, firstName, lastName } = validation.data;

      // Additional password validation
      const passwordValidation = authService.validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          message: passwordValidation.errors.join('. '),
          errors: passwordValidation.errors
        });
      }

      // Register user
      const result = await authService.register(email, password, firstName, lastName);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      // Set user in session (without password) - regenerate to prevent session fixation
      const { password: _, ...userWithoutPassword } = result.user!;
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.status(500).json({ message: 'Session error' });
        }
        (req.session as any).user = userWithoutPassword;
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return res.status(500).json({ message: 'Session error' });
          }
          res.json({
            success: true,
            message: 'Registration successful',
            user: sanitizeUser(result.user!)
          });
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
  });

  // Onboarding endpoints
  app.post('/api/onboarding/select-plan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { selectedPlan } = req.body;

      if (!selectedPlan || !['free', 'starter', 'pro'].includes(selectedPlan)) {
        return res.status(400).json({ message: 'Invalid plan selection' });
      }

      // Set credit limits based on plan
      const planLimits = {
        free: { maxDaily: 2, maxMonthly: 10 },
        starter: { maxDaily: 10, maxMonthly: 60 },
        pro: { maxDaily: 999999, maxMonthly: 999999 } // Effectively unlimited
      };
      
      const limits = planLimits[selectedPlan as keyof typeof planLimits];

      await storage.upsertUser({ 
        id: userId,
        selectedPlan,
        subscriptionTier: selectedPlan,
        maxDailyCredits: limits.maxDaily,
        maxMonthlyCredits: limits.maxMonthly
      });

      const updatedUser = await storage.getUser(userId);
      if (updatedUser) {
        const { password: _, ...userWithoutPassword } = updatedUser;
        (req.session as any).user = userWithoutPassword;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      res.json({ 
        success: true, 
        message: 'Plan selected successfully' 
      });
    } catch (error) {
      console.error('Error saving plan selection:', error);
      res.status(500).json({ message: 'Failed to save plan selection' });
    }
  });

  app.post('/api/onboarding/save-responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { heardFrom, tradingExperience, tradingGoals, currentOccupation } = req.body;

      if (!heardFrom || !tradingExperience) {
        return res.status(400).json({ message: 'Required fields missing' });
      }

      await storage.upsertUser({
        id: userId,
        heardFrom,
        tradingExperience,
        tradingGoals: tradingGoals || null,
        currentOccupation: currentOccupation || null
        // Don't set onboardingCompleted here - it should be set after email verification
      });

      const updatedUser = await storage.getUser(userId);
      if (updatedUser) {
        const { password: _, ...userWithoutPassword } = updatedUser;
        (req.session as any).user = userWithoutPassword;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      res.json({ 
        success: true, 
        message: 'Onboarding completed successfully' 
      });
    } catch (error) {
      console.error('Error saving onboarding responses:', error);
      res.status(500).json({ message: 'Failed to save responses' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      // Validate input
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: 'Invalid input',
          errors: validation.error.errors
        });
      }

      const { email, password } = validation.data;

      // Check rate limit
      const rateLimitCheck = rateLimitService.checkSendLimit(req, email);
      if (!rateLimitCheck.allowed) {
        const resetInMinutes = Math.ceil((rateLimitCheck.resetTime! - Date.now()) / (1000 * 60));
        return res.status(429).json({ 
          message: `Too many login attempts. Please try again in ${resetInMinutes} minute${resetInMinutes !== 1 ? 's' : ''}.`,
          resetTime: rateLimitCheck.resetTime,
          remainingAttempts: 0
        });
      }

      // Login user
      const result = await authService.login(email, password);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      // Set user in session (without password) - regenerate to prevent session fixation
      const { password: _, ...userWithoutPassword } = result.user!;
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.status(500).json({ message: 'Session error' });
        }
        (req.session as any).user = userWithoutPassword;
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return res.status(500).json({ message: 'Session error' });
          }
          res.json({
            success: true,
            message: 'Login successful',
            user: sanitizeUser(result.user!)
          });
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed. Please try again.' });
    }
  });

  // Independent logout endpoint
  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  // Password Reset Routes
  
  // Request password reset
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'Email is required' });
      }

      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const result = await passwordResetService.requestPasswordReset(email, ipAddress);

      if (!result.success) {
        return res.status(429).json({ message: result.message });
      }

      res.json({ success: true, message: result.message });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Failed to process password reset request' });
    }
  });

  // Validate reset token
  app.get('/api/auth/validate-reset-token', async (req, res) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ valid: false, message: 'Token is required' });
      }

      const validation = await passwordResetService.validateResetToken(token);
      res.json(validation);
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(500).json({ valid: false, message: 'Failed to validate token' });
    }
  });

  // Reset password with token
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ success: false, message: 'Token is required' });
      }

      if (!newPassword || typeof newPassword !== 'string') {
        return res.status(400).json({ success: false, message: 'New password is required' });
      }

      // Password strength validation
      if (newPassword.length < 8) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password must be at least 8 characters long' 
        });
      }

      const result = await passwordResetService.resetPassword(token, newPassword);

      if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
      }

      res.json({ success: true, message: result.message });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
  });

  // Sharing detection endpoint
  app.get('/api/security/sharing-check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deviceId = req.headers['x-device-id'] || 'unknown';
      
      const detectionResult = await sharingDetectionService.detectSharing(userId, deviceId, storage);
      const policyResult = await sharingDetectionService.enforcePolicy(userId, detectionResult, storage);
      
      res.json({
        ...detectionResult,
        policy: policyResult
      });
    } catch (error) {
      console.error("Error checking account sharing:", error);
      res.status(500).json({ message: "Failed to check account sharing" });
    }
  });

  // Device tracking endpoint
  app.post('/api/tracking/device-action', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const {
        action,
        timestamp,
        deviceId,
        browser,
        os,
        screenResolution,
        timezone,
        language,
        canvasFingerprint,
        webglFingerprint,
        hardwareConcurrency,
        platform,
        ...additionalData
      } = req.body;

      if (!action || !deviceId) {
        return res.status(400).json({ message: "Action and deviceId are required" });
      }

      // Build comprehensive device fingerprint
      const deviceFingerprint = {
        deviceId,
        browser,
        os,
        screenResolution,
        timezone,
        language,
        canvasFingerprint,
        webglFingerprint,
        hardwareConcurrency,
        platform,
        action,
        timestamp: timestamp || new Date().toISOString(),
        ...additionalData
      };

      // Store device action in session logs for abuse detection
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || '';
      
      // Use the new updateSessionActivity method which properly handles device fingerprints
      await storage.updateSessionActivity(userId, deviceId, ipAddress, userAgent, deviceFingerprint);

      // Perform sharing detection with the updated session data
      const detectionResult = await sharingDetectionService.detectAndEnforce(
        userId, 
        deviceId, 
        ipAddress, 
        userAgent, 
        storage
      );
      
      res.json({ 
        success: true,
        sharingDetection: {
          isSharing: detectionResult.isSharing,
          confidence: detectionResult.confidence,
          reason: detectionResult.reason,
          activeSessions: detectionResult.activeSessions,
          enforcement: detectionResult.enforcement
        }
      });
    } catch (error) {
      console.error("Error tracking device action:", error);
      res.status(500).json({ message: "Failed to track device action" });
    }
  });

  // Abuse detection middleware for all routes
  app.use((req: any, res, next) => {
    // Skip abuse detection for non-authenticated routes
    if (!req.user) {
      return next();
    }

    const userId = req.user.claims.sub;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Check for suspicious activity
    storage.checkSuspiciousActivity(userId, ipAddress)
      .then(result => {
        if (result.suspicious) {
          console.log(`Suspicious activity detected for user ${userId}: ${result.reason}`);
          // For now, just log - could block in the future
          // return res.status(429).json({ message: "Suspicious activity detected" });
        }
        next();
      })
      .catch(error => {
        console.error("Error checking suspicious activity:", error);
        next(); // Continue even if abuse detection fails
      });
  });

  // Market status endpoint
  app.get('/api/v1/market-status', async (req, res) => {
    try {
      const marketOpen = isMarketOpen();
      res.json({ 
        isOpen: marketOpen,
        timezone: 'Africa/Casablanca',
        message: marketOpen ? 'Market is currently open' : 'Market is currently closed'
      });
    } catch (error) {
      console.error("Error checking market status:", error);
      res.status(500).json({ message: "Failed to check market status" });
    }
  });

  // Health check endpoint
  app.get('/api/v1/health', (req, res) => {
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // Generate trading signal
  app.post('/api/v1/generate-signal', isAuthenticated, sharingDetectionMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Validate request body
      const { timeframe } = generateSignalRequestSchema.parse(req.body);

      // Check market hours
      if (!isMarketOpen()) {
        return res.status(400).json({ 
          message: "Market is currently closed. Trading signals are only available during market hours.",
          marketStatus: "closed"
        });
      }

      // Define daily limits and cooldowns based on subscription tier
      const tierLimits = {
        free: { dailyLimit: 2, cooldownMinutes: 90 },
        starter_trader: { dailyLimit: 10, cooldownMinutes: 30 },
        pro_trader: { dailyLimit: 999999, cooldownMinutes: 15 }, // Pro gets unlimited with 15min cooldown
        admin: { dailyLimit: 999999, cooldownMinutes: 0 } // Admin gets unlimited with no cooldown
      };
      
      const userTierLimits = tierLimits[user.subscriptionTier as keyof typeof tierLimits] || tierLimits.free;
      console.log(`[GENERATION] User ${user.email} tier: ${user.subscriptionTier}, limits:`, userTierLimits);
      
      // Store original values for potential rollback if generation fails
      const originalDailyCredits = user.dailyCredits;
      const originalLastGenerationTime = user.lastGenerationTime;

      // Check and perform daily reset before any other operations (add to POST as well)
      const currentTime = new Date();
      const casablancaTime = new Date(currentTime.toLocaleString("en-US", {timeZone: "Africa/Casablanca"}));
      const lastReset = new Date(user.lastCreditReset || 0);
      const lastResetCasablanca = new Date(lastReset.toLocaleString("en-US", {timeZone: "Africa/Casablanca"}));
      
      const needsReset = casablancaTime.getDate() !== lastResetCasablanca.getDate() || 
                        casablancaTime.getMonth() !== lastResetCasablanca.getMonth() ||
                        casablancaTime.getFullYear() !== lastResetCasablanca.getFullYear();
      
      if (needsReset) {
        console.log(`[GENERATION] Daily reset needed for user ${userId}`);
        await storage.resetDailyCredits(userId);
        // Update our local user object to reflect the reset
        user.dailyCredits = 0;
        user.lastCreditReset = currentTime;
        user.lastGenerationTime = null; // Clear cooldown
      }

      // Atomic check and update - prevent race conditions
      const cooldownEndTime = user.lastGenerationTime 
        ? new Date(new Date(user.lastGenerationTime).getTime() + (userTierLimits.cooldownMinutes * 60 * 1000))
        : null;
        
      // Check if user can generate (daily limit and cooldown)
      const canGenerate = user.dailyCredits < userTierLimits.dailyLimit && 
                         (!cooldownEndTime || currentTime >= cooldownEndTime);
      
      if (!canGenerate) {
        // Return appropriate error message
        if (user.dailyCredits >= userTierLimits.dailyLimit) {
          const upgradeMessages = {
            free: "Daily limit reached. Free users get 2 signals per day. Upgrade to Starter for 10 signals per day.",
            starter_trader: "Daily limit reached. Starter users get 10 signals per day. Upgrade to Pro for 20 signals per day.",
            pro_trader: "Daily limit reached. Pro users get 20 signals per day.",
            admin: "Daily limit reached (this should not happen for admin users)."
          };
          
          return res.status(429).json({ 
            message: upgradeMessages[user.subscriptionTier as keyof typeof upgradeMessages] || upgradeMessages.free,
            creditsRemaining: 0,
            dailyLimitReached: true
          });
        }
        
        if (cooldownEndTime && currentTime < cooldownEndTime) {
          const remainingTime = Math.ceil((cooldownEndTime.getTime() - currentTime.getTime()) / (1000 * 60));
          return res.status(429).json({
            message: `Please wait ${remainingTime} minute${remainingTime !== 1 ? 's' : ''} before generating another signal.`,
            cooldownRemaining: remainingTime,
            nextGenerationTime: cooldownEndTime.toISOString()
          });
        }
      }
      
      // Try atomic update - let the database be the source of truth for conditions
      const updateResult = await storage.atomicGenerationUpdate(
        userId, 
        userTierLimits.dailyLimit,
        userTierLimits.cooldownMinutes,
        currentTime
      );
      
      if (!updateResult.success) {
        // Another request beat us to it, recalculate and return error
        const updatedUser = await storage.getUser(userId);
        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }
        
        if (updatedUser.dailyCredits >= userTierLimits.dailyLimit) {
          return res.status(429).json({ 
            message: "Daily limit reached. Another request was processed first.",
            creditsRemaining: 0,
            dailyLimitReached: true
          });
        }
        
        const newCooldownEndTime = updatedUser.lastGenerationTime 
          ? new Date(new Date(updatedUser.lastGenerationTime).getTime() + (userTierLimits.cooldownMinutes * 60 * 1000))
          : null;
          
        if (newCooldownEndTime && currentTime < newCooldownEndTime) {
          const remainingTime = Math.ceil((newCooldownEndTime.getTime() - currentTime.getTime()) / (1000 * 60));
          return res.status(429).json({
            message: `Cooldown active. Another request was processed first.`,
            cooldownRemaining: remainingTime,
            nextGenerationTime: newCooldownEndTime.toISOString()
          });
        }
        
        return res.status(500).json({ message: "Failed to process request. Please try again." });
      }

      // Generate signal using OpenAI - if this fails, we need to revert credits
      let signalData;
      try {
        signalData = await generateTradingSignal(timeframe, user.subscriptionTier, userId);
      } catch (error) {
        console.error(`[GENERATION] OpenAI generation failed for user ${userId}:`, error);
        // Revert the credit update since generation failed
        await storage.revertGenerationUpdate(userId, originalDailyCredits, originalLastGenerationTime);
        return res.status(500).json({ 
          message: "Signal generation failed. Please try again.",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }

      // Create signal record
      const signal = await storage.createSignal({
        userId,
        pair: "XAUUSD",
        direction: signalData.action,
        timeframe,
        entryPrice: signalData.entry.toString(),
        stopLoss: signalData.stop_loss.toString(),
        takeProfit: signalData.take_profit.toString(),
        takeProfits: signalData.take_profits || [], // Store takeProfits in database
        confidence: signalData.confidence,
        analysis: `${signalData.ai_analysis.brief} ${signalData.ai_analysis.detailed}`
          .replace(/\[.*?\]/g, '') // Remove [text]
          .replace(/\(.*?\.com.*?\)/g, '') // Remove (website.com links)
          .replace(/\([^)]*https?[^)]*\)/g, '') // Remove any (links with http)
          .replace(/\([^)]*www\.[^)]*\)/g, '') // Remove any (www.links)
          .trim(),
        status: "fresh",
      });

      // Credits and generation time already updated atomically above

      res.json({
        signal,
        creditsUsed: user.subscriptionTier === 'pro' ? 0 : 1,
        creditsRemaining: userTierLimits.dailyLimit - (user.dailyCredits + 1),
        cooldownMinutes: userTierLimits.cooldownMinutes,
        nextGenerationTime: new Date(Date.now() + (userTierLimits.cooldownMinutes * 60 * 1000)).toISOString()
      });

    } catch (error) {
      console.error("Error generating signal:", error);
      res.status(500).json({ message: "Failed to generate trading signal" });
    }
  });

  // Get user signals
  app.get('/api/v1/signals', isAuthenticated, sharingDetectionMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Free tier users can't access signal history
      if (user.subscriptionTier === 'free') {
        return res.status(403).json({ 
          message: "Signal history is available for Starter and Pro members only.",
          upgrade: true
        });
      }

      const signals = await storage.getUserSignals(userId, 50);
      const signalsWithLifecycle = applyLifecycleStatus(signals);
      res.json(signalsWithLifecycle);

    } catch (error) {
      console.error("Error fetching signals:", error);
      res.status(500).json({ message: "Failed to fetch signals" });
    }
  });

  // Get latest signal
  app.get('/api/v1/signals/latest', isAuthenticated, sharingDetectionMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Free tier users can't access latest signals
      if (user.subscriptionTier === 'free') {
        return res.status(403).json({ 
          message: "Latest signals are available for Starter and Pro members only.",
          upgrade: true
        });
      }

      const signals = await storage.getUserSignals(userId, 1);
      const latestSignal = signals[0] || null;
      
      if (latestSignal) {
        const signalWithLifecycle = applyLifecycleStatus([latestSignal])[0];
        res.json(signalWithLifecycle);
      } else {
        res.json(null);
      }

    } catch (error) {
      console.error("Error fetching latest signal:", error);
      res.status(500).json({ message: "Failed to fetch latest signal" });
    }
  });

  // Notification routes
  
  // Get pending signal reviews for user notification
  app.get('/api/v1/notifications/pending-reviews', isAuthenticated, sharingDetectionMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pendingData = await notificationService.checkPendingSignalReviews(userId);
      res.json(pendingData);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      res.status(500).json({ message: "Failed to fetch pending reviews" });
    }
  });

  // Update signal user action
  app.patch('/api/v1/signals/:signalId/action', isAuthenticated, async (req: any, res) => {
    try {
      const { signalId } = req.params;
      const { action } = req.body;
      
      if (!['successful', 'unsuccessful', 'didnt_take'].includes(action)) {
        return res.status(400).json({ message: "Invalid action. Must be 'successful', 'unsuccessful', or 'didnt_take'" });
      }

      await storage.updateSignalUserAction(signalId, action);
      
      // Mark notification as sent for this user
      const userId = req.user.claims.sub;
      await notificationService.markNotificationSent(userId);
      
      res.json({ message: "Signal action updated successfully" });
    } catch (error) {
      console.error("Error updating signal action:", error);
      res.status(500).json({ message: "Failed to update signal action" });
    }
  });

  // Get notification count for badge
  app.get('/api/v1/notifications/count', isAuthenticated, sharingDetectionMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notificationData = await notificationService.getNotificationCount(userId);
      res.json(notificationData);
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });

  // Get monthly completion status
  app.get('/api/v1/notifications/monthly-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const monthlyData = await notificationService.checkMonthlyCompletion(userId);
      res.json(monthlyData);
    } catch (error) {
      console.error("Error fetching monthly status:", error);
      res.status(500).json({ message: "Failed to fetch monthly status" });
    }
  });

  // Claim discount code
  app.post('/api/v1/notifications/claim-discount', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.pendingDiscountCode) {
        return res.status(404).json({ message: "No discount code available" });
      }

      // Clear the discount code (user has claimed it)
      await storage.updateUserDiscountCode(userId, '');
      
      res.json({ 
        message: "Discount code claimed successfully",
        discountCode: user.pendingDiscountCode
      });
    } catch (error) {
      console.error("Error claiming discount:", error);
      res.status(500).json({ message: "Failed to claim discount code" });
    }
  });

  // View API logs (authenticated users only)
  app.get('/api/v1/logs', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(403).json({ message: "Authentication required" });
      }

      const { date } = req.query;
      
      if (date) {
        // Get logs for specific date
        const logs = await apiLogger.getLogsByDate(date);
        res.json({ date, logs });
      } else {
        // Get all log files
        const logFiles = await apiLogger.getAllLogFiles();
        res.json({ logFiles });
      }

    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Debug GPT-5 connectivity
  app.get('/api/v1/debug-gpt5', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user || user.claims?.email !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Test basic OpenAI connectivity
      const testSignal = await generateTradingSignal('1H', 'pro', user.claims.sub);
      
      res.json({
        status: 'connected',
        model: 'gpt-5-mini',
        timestamp: new Date().toISOString(),
        testSignal
      });

    } catch (error) {
      console.error("GPT-5 debug error:", error);
      res.status(500).json({ 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // News endpoints - Now powered by TradingView Economic Calendar
  app.get('/api/v1/news/recent', async (req, res) => {
    try {
      const { limit = '10' } = req.query;
      
      const news = await tradingViewService.getRecentNews(
        parseInt(limit as string)
      );
      
      // Add logging for debugging
      console.log(`[TradingView] Fetched ${news.length} recent news items`);
      
      res.json(news);
    } catch (error) {
      console.error("Error fetching recent news from TradingView:", error);
      res.status(500).json({ message: "Failed to fetch recent news" });
    }
  });

  app.get('/api/v1/news/upcoming', async (req, res) => {
    try {
      const { limit = '10' } = req.query;
      
      const news = await tradingViewService.getUpcomingNews(
        parseInt(limit as string)
      );
      
      // Add logging for debugging
      console.log(`[TradingView] Fetched ${news.length} upcoming news items`);
      
      res.json(news);
    } catch (error) {
      console.error("Error fetching upcoming news from TradingView:", error);
      res.status(500).json({ message: "Failed to fetch upcoming news" });
    }
  });

  // TradingView cache management endpoint (admin only)
  app.post('/api/v1/news/refresh-cache', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user || user.claims?.email !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Clear TradingView cache to force refresh
      tradingViewService.clearCache();
      
      res.json({ 
        message: "TradingView cache cleared successfully",
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Error clearing TradingView cache:", error);
      res.status(500).json({ message: "Failed to clear cache" });
    }
  });

  app.post('/api/v1/news', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.subscriptionTier === 'free') {
        return res.status(403).json({ 
          message: "News management requires a paid subscription" 
        });
      }

      // Validate request body
      const newsData = insertNewsSchema.parse(req.body);
      
      const news = await storage.createNews(newsData);
      res.status(201).json(news);
      
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ message: "Failed to create news item" });
    }
  });

  // Admin endpoints
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Only admin users can access this endpoint
      if (!user || user.subscriptionTier !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get all users (without passwords)
      const allUsers = await storage.getAllUsers();
      const sanitizedUsers = allUsers.map(u => sanitizeUser(u));
      
      res.json({ users: sanitizedUsers });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:userId/plan', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminId);
      
      // Only admin users can access this endpoint
      if (!adminUser || adminUser.subscriptionTier !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId } = req.params;
      const { plan } = req.body;

      const validPlans = ['free', 'starter_trader', 'pro_trader', 'admin'];
      if (!plan || !validPlans.includes(plan)) {
        return res.status(400).json({ message: "Invalid plan selected" });
      }

      // Set credit limits based on plan
      const planLimits = {
        free: { maxDaily: 2, maxMonthly: 10 },
        starter_trader: { maxDaily: 10, maxMonthly: 60 },
        pro_trader: { maxDaily: 999999, maxMonthly: 999999 },
        admin: { maxDaily: 999999, maxMonthly: 999999 }
      };
      
      const limits = planLimits[plan as keyof typeof planLimits];

      // Update user's subscription tier and credit limits
      await storage.updateUser(userId, {
        subscriptionTier: plan,
        maxDailyCredits: limits.maxDaily,
        maxMonthlyCredits: limits.maxMonthly
      });

      // Reset credits
      await storage.resetDailyCredits(userId);

      const updatedUser = await storage.getUser(userId);
      res.json({ success: true, user: sanitizeUser(updatedUser) });
    } catch (error) {
      console.error("Error updating user plan:", error);
      res.status(500).json({ message: "Failed to update user plan" });
    }
  });

  app.put('/api/admin/users/:userId/status', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminId);
      
      // Only admin users can access this endpoint
      if (!adminUser || adminUser.subscriptionTier !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "Invalid status value" });
      }

      // Update user's active status
      await storage.updateUser(userId, {
        isActive
      });

      const updatedUser = await storage.getUser(userId);
      res.json({ success: true, user: sanitizeUser(updatedUser) });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Contact form submission endpoint
  app.post('/api/v1/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      if (!name || !email || !message) {
        return res.status(400).json({ 
          message: "Name, email, and message are required" 
        });
      }

      // Here you would typically send an email to your support team
      // For now, we'll just log it and return success
      console.log("Contact form submission:", {
        name,
        email,
        subject: subject || "No subject",
        message,
        timestamp: new Date().toISOString()
      });

      // TODO: Integrate with email service (e.g., SendGrid, Nodemailer)
      // await sendEmailToSupport({ name, email, subject, message });

      res.status(200).json({ 
        message: "Contact form submitted successfully",
        success: true 
      });
      
    } catch (error) {
      console.error("Error submitting contact form:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // ==================== Payment Request Endpoints ====================

  // Create a payment request (user initiates upgrade)
  app.post('/api/v1/payment-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { plan, period, whatsappNumber } = req.body;

      // Validate inputs
      if (!plan || !['starter_trader', 'pro_trader'].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan. Must be starter_trader or pro_trader" });
      }

      if (!period || ![1, 3, 12].includes(period)) {
        return res.status(400).json({ message: "Invalid period. Must be 1, 3, or 12 months" });
      }

      // Calculate pricing
      const { calculateSubscriptionPrice, generateReferenceCode } = await import('./services/paymentService');
      const pricing = calculateSubscriptionPrice(plan, period, user.isFirstTimeSubscriber || false);
      const referenceCode = generateReferenceCode();

      // Create payment request
      const paymentRequest = await storage.createPaymentRequest({
        userId: user.id!,
        userEmail: user.email!,
        requestedPlan: plan,
        subscriptionPeriod: period,
        referenceCode,
        amount: pricing.finalAmount.toString(),
        originalAmount: pricing.originalAmount.toString(),
        discountPercentage: pricing.discountPercentage,
        whatsappNumber: whatsappNumber || undefined
      });

      console.log(`[PAYMENT] Created payment request ${referenceCode} for user ${user.email}`);

      res.json({
        success: true,
        paymentRequest,
        pricing
      });
      
    } catch (error) {
      console.error("Error creating payment request:", error);
      res.status(500).json({ message: "Failed to create payment request" });
    }
  });

  // Get user's own payment requests
  app.get('/api/v1/payment-requests/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getUserPaymentRequests(userId);
      res.json({ paymentRequests: requests });
    } catch (error) {
      console.error("Error fetching payment requests:", error);
      res.status(500).json({ message: "Failed to fetch payment requests" });
    }
  });

  // Get WhatsApp link for payment (after creating request)
  app.post('/api/v1/payment-requests/:id/whatsapp-link', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const paymentRequest = await storage.getPaymentRequest(id);
      
      if (!paymentRequest) {
        return res.status(404).json({ message: "Payment request not found" });
      }

      if (paymentRequest.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Generate WhatsApp link
      const { generateWhatsAppMessage, getWhatsAppUrl, getPlanDisplayName, getPeriodDisplayText } = await import('./services/paymentService');
      
      const message = generateWhatsAppMessage(
        paymentRequest.userEmail,
        paymentRequest.requestedPlan,
        paymentRequest.subscriptionPeriod,
        parseFloat(paymentRequest.amount),
        paymentRequest.referenceCode
      );

      // Use your business WhatsApp number (you'll need to add this to environment)
      const whatsappNumber = process.env.WHATSAPP_SUPPORT_NUMBER || '1234567890';
      const whatsappUrl = getWhatsAppUrl(whatsappNumber, message);

      res.json({
        success: true,
        whatsappUrl,
        message,
        paymentDetails: {
          plan: getPlanDisplayName(paymentRequest.requestedPlan),
          period: getPeriodDisplayText(paymentRequest.subscriptionPeriod),
          amount: paymentRequest.amount,
          referenceCode: paymentRequest.referenceCode
        }
      });
      
    } catch (error) {
      console.error("Error generating WhatsApp link:", error);
      res.status(500).json({ message: "Failed to generate WhatsApp link" });
    }
  });

  // Admin: Get all payment requests
  app.get('/api/admin/payment-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.subscriptionTier !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.query;
      
      let requests;
      if (status === 'pending') {
        requests = await storage.getAllPendingPaymentRequests();
      } else {
        requests = await storage.getAllPaymentRequests();
      }

      res.json({ paymentRequests: requests });
    } catch (error) {
      console.error("Error fetching payment requests:", error);
      res.status(500).json({ message: "Failed to fetch payment requests" });
    }
  });

  // Admin: Confirm payment and upgrade user
  app.post('/api/admin/payment-requests/:id/confirm', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminId);
      
      if (!adminUser || adminUser.subscriptionTier !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { notes } = req.body;
      
      const paymentRequest = await storage.getPaymentRequest(id);
      
      if (!paymentRequest) {
        return res.status(404).json({ message: "Payment request not found" });
      }

      if (paymentRequest.status !== 'pending') {
        return res.status(400).json({ message: "Payment request is not pending" });
      }

      // Calculate subscription dates
      const { calculateSubscriptionEndDate, calculateGracePeriodEndDate } = await import('./services/paymentService');
      const now = new Date();
      const endDate = calculateSubscriptionEndDate(now, paymentRequest.subscriptionPeriod);
      const graceEndDate = calculateGracePeriodEndDate(endDate);

      // Get credit limits for the plan
      const planLimits = {
        starter_trader: { maxDaily: 10, maxMonthly: 60 },
        pro_trader: { maxDaily: 999999, maxMonthly: 999999 }
      };
      const limits = planLimits[paymentRequest.requestedPlan as keyof typeof planLimits];

      // Update user subscription
      await storage.updateUser(paymentRequest.userId, {
        subscriptionTier: paymentRequest.requestedPlan,
        subscriptionStartDate: now,
        subscriptionEndDate: endDate,
        subscriptionPeriod: paymentRequest.subscriptionPeriod,
        gracePeriodEndDate: graceEndDate,
        isFirstTimeSubscriber: false, // Mark as no longer first-time after first payment
        maxDailyCredits: limits.maxDaily,
        maxMonthlyCredits: limits.maxMonthly
      });

      // Reset credits
      await storage.resetDailyCredits(paymentRequest.userId);

      // Confirm payment request
      await storage.confirmPaymentRequest(id, adminId);
      
      // Update notes if provided
      if (notes) {
        await storage.updatePaymentRequestNotes(id, notes);
      }

      const updatedUser = await storage.getUser(paymentRequest.userId);
      
      console.log(`[PAYMENT] Admin ${adminUser.email} confirmed payment ${paymentRequest.referenceCode} for user ${paymentRequest.userEmail}`);

      res.json({
        success: true,
        message: "Payment confirmed and user upgraded successfully",
        user: sanitizeUser(updatedUser)
      });
      
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Admin: Cancel payment request
  app.post('/api/admin/payment-requests/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminId);
      
      if (!adminUser || adminUser.subscriptionTier !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const { notes } = req.body;
      
      await storage.cancelPaymentRequest(id);
      
      if (notes) {
        await storage.updatePaymentRequestNotes(id, notes);
      }

      res.json({
        success: true,
        message: "Payment request cancelled"
      });
      
    } catch (error) {
      console.error("Error cancelling payment request:", error);
      res.status(500).json({ message: "Failed to cancel payment request" });
    }
  });

  // Contact Us form endpoint
  app.post('/api/contact', async (req, res) => {
    try {
      const { email, type, subject, message } = req.body;

      if (!email || !type || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Map type to readable format for email subject
      const typeLabels = {
        support_ticket: "[SUPPORT TICKET]",
        general_question: "[GENERAL QUESTION]"
      };

      const emailSubject = `${typeLabels[type as keyof typeof typeLabels] || "[CONTACT]"} ${subject}`;

      // Send email using Brevo
      const emailSent = await notificationService.sendEmail(
        "support@nextradinglabs.com",
        emailSubject,
        `
          <h2>New Contact Form Submission</h2>
          <p><strong>Type:</strong> ${type === 'support_ticket' ? 'Support Ticket' : 'General Question'}</p>
          <p><strong>From:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <br>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <br>
          <hr>
          <p style="color: #666; font-size: 12px;">This email was sent from the NTL Trading Platform contact form.</p>
        `
      );

      if (!emailSent) {
        console.error("[CONTACT] Failed to send contact email");
        return res.status(500).json({ message: "Failed to send message. Please try again later." });
      }

      console.log(`[CONTACT] Message sent from ${email} - Type: ${type}`);

      res.json({
        success: true,
        message: "Your message has been sent successfully"
      });

    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
