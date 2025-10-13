import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { passwordResetTokens, users } from '@shared/schema';
import { eq, and, gt, lt } from 'drizzle-orm';
import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';

class PasswordResetService {
  private readonly TOKEN_EXPIRY_HOURS = 1; // Reset tokens expire in 1 hour
  private readonly MAX_REQUESTS_PER_HOUR = 3; // Prevent abuse
  private brevoClient: TransactionalEmailsApi | null = null;

  constructor() {
    // Initialize Brevo client if API key is available
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      this.brevoClient = new TransactionalEmailsApi();
      this.brevoClient.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);
    }
  }

  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash a token for secure storage
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Check if user has exceeded reset request rate limit
   */
  private async checkRateLimit(userId: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentRequests = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, userId),
          gt(passwordResetTokens.createdAt, oneHourAgo)
        )
      );

    return recentRequests.length >= this.MAX_REQUESTS_PER_HOUR;
  }

  /**
   * Send password reset email via Brevo
   */
  private async sendResetEmail(email: string, resetToken: string): Promise<void> {
    if (!this.brevoClient) {
      console.warn('Brevo client not initialized. Skipping email send.');
      console.log(`[DEV MODE] Password reset token for ${email}: ${resetToken}`);
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const emailData = {
      to: [{ email }],
      subject: 'Reset Your Password - Next Trading Labs',
      sender: { 
        email: 'support@nextradinglabs.com', 
        name: 'Next Trading Labs' 
      },
      htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #e4e4e7;">
        <div style="max-width: 600px; margin: 40px auto; background: linear-gradient(to bottom, #18181b, #09090b); border: 1px solid #27272a; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Reset Your Password</h1>
            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Next Trading Labs</p>
          </div>

          <!-- Content -->
          <div style="padding: 32px 24px;">
            <p style="margin: 0 0 24px; color: #e4e4e7; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>

            <!-- Reset Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>

            <!-- Alternative Link -->
            <p style="margin: 24px 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <div style="background: #18181b; border: 1px solid #27272a; border-radius: 6px; padding: 12px; word-break: break-all;">
              <a href="${resetUrl}" style="color: #6366f1; text-decoration: none; font-size: 14px;">
                ${resetUrl}
              </a>
            </div>

            <!-- Security Notice -->
            <div style="margin-top: 32px; padding: 16px; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 6px;">
              <p style="margin: 0; color: #fbbf24; font-size: 14px; font-weight: 600;">
                ⚠️ Security Notice
              </p>
              <p style="margin: 8px 0 0; color: #e4e4e7; font-size: 14px; line-height: 1.6;">
                This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #09090b; padding: 24px; text-align: center; border-top: 1px solid #27272a;">
            <p style="margin: 0; color: #71717a; font-size: 12px;">
              © ${new Date().getFullYear()} Next Trading Labs. All rights reserved.
            </p>
            <p style="margin: 8px 0 0; color: #52525b; font-size: 12px;">
              AI-Powered Trading Signals
            </p>
          </div>
        </div>
      </body>
      </html>
    `
    };

    try {
      await this.brevoClient.sendTransacEmail(emailData);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Request a password reset
   */
  async requestPasswordReset(email: string, ipAddress: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      // Always return success to prevent email enumeration
      if (!user) {
        console.log(`Password reset requested for non-existent email: ${email}`);
        return {
          success: true,
          message: 'If an account exists with this email, you will receive a password reset link.'
        };
      }

      // Check if user has a password (some might only use Replit auth)
      if (!user.password) {
        console.log(`Password reset requested for user without password: ${email}`);
        return {
          success: true,
          message: 'If an account exists with this email, you will receive a password reset link.'
        };
      }

      // Check rate limit
      const rateLimited = await this.checkRateLimit(user.id);
      if (rateLimited) {
        console.warn(`Rate limit exceeded for password reset: ${email}`);
        return {
          success: false,
          message: 'Too many reset requests. Please try again later.'
        };
      }

      // Generate token
      const resetToken = this.generateToken();
      const hashedToken = this.hashToken(resetToken);
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      // Store hashed token in database
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token: hashedToken,
        expiresAt,
        ipAddress,
        used: false
      });

      // Send reset email with raw token (not hashed)
      await this.sendResetEmail(email, resetToken);

      return {
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw new Error('Failed to process password reset request');
    }
  }

  /**
   * Validate a reset token
   */
  async validateResetToken(token: string): Promise<{ valid: boolean; userId?: string; message?: string }> {
    try {
      const hashedToken = this.hashToken(token);

      const [resetToken] = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, hashedToken),
            eq(passwordResetTokens.used, false),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!resetToken) {
        return {
          valid: false,
          message: 'Invalid or expired reset token'
        };
      }

      return {
        valid: true,
        userId: resetToken.userId
      };
    } catch (error) {
      console.error('Error validating reset token:', error);
      return {
        valid: false,
        message: 'Failed to validate reset token'
      };
    }
  }

  /**
   * Reset password using a valid token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate token
      const validation = await this.validateResetToken(token);
      if (!validation.valid || !validation.userId) {
        return {
          success: false,
          message: validation.message || 'Invalid or expired reset token'
        };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      await db
        .update(users)
        .set({ 
          password: hashedPassword,
          accountLocked: false, // Unlock account if it was locked
          loginAttempts: 0 // Reset login attempts
        })
        .where(eq(users.id, validation.userId));

      // Mark token as used
      const hashedToken = this.hashToken(token);
      await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.token, hashedToken));

      console.log(`Password successfully reset for user: ${validation.userId}`);

      return {
        success: true,
        message: 'Password successfully reset'
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new Error('Failed to reset password');
    }
  }

  /**
   * Clean up expired tokens (can be run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await db
        .delete(passwordResetTokens)
        .where(lt(passwordResetTokens.expiresAt, new Date()));

      console.log(`Cleaned up expired password reset tokens`);
      return 0; // Drizzle doesn't return affected rows count easily
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }
}

export const passwordResetService = new PasswordResetService();
