var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/services/paymentService.ts
var paymentService_exports = {};
__export(paymentService_exports, {
  SUBSCRIPTION_PRICING: () => SUBSCRIPTION_PRICING,
  calculateGracePeriodEndDate: () => calculateGracePeriodEndDate,
  calculateSubscriptionEndDate: () => calculateSubscriptionEndDate,
  calculateSubscriptionPrice: () => calculateSubscriptionPrice,
  generateReferenceCode: () => generateReferenceCode,
  generateWhatsAppMessage: () => generateWhatsAppMessage,
  getPeriodDisplayText: () => getPeriodDisplayText,
  getPlanDisplayName: () => getPlanDisplayName,
  getWhatsAppUrl: () => getWhatsAppUrl
});
import crypto3 from "crypto";
function calculateSubscriptionPrice(plan, period, isFirstTime) {
  const pricing = SUBSCRIPTION_PRICING[plan][period];
  const basePrice = pricing.price;
  const periodDiscount = pricing.discount;
  let finalAmount = basePrice;
  let totalDiscount = periodDiscount;
  if (isFirstTime) {
    const firstTimeReduction = basePrice * FIRST_TIME_DISCOUNT / 100;
    finalAmount = basePrice - firstTimeReduction;
    totalDiscount = periodDiscount + FIRST_TIME_DISCOUNT;
  }
  return {
    originalAmount: basePrice,
    finalAmount: Math.round(finalAmount * 100) / 100,
    // Round to 2 decimal places
    discountPercentage: totalDiscount,
    periodDiscount,
    firstTimeDiscount: isFirstTime ? FIRST_TIME_DISCOUNT : 0
  };
}
function generateReferenceCode() {
  const randomCode = crypto3.randomBytes(3).toString("hex").toUpperCase();
  return `PAY-${randomCode}`;
}
function generateWhatsAppMessage(userEmail, plan, period, amount, referenceCode) {
  const planName = plan === "starter_trader" ? "Starter Trader" : "Pro Trader";
  const periodText = period === 1 ? "1 Month" : period === 3 ? "3 Months" : "1 Year";
  return `Hi! I want to upgrade my NTL Trading Platform subscription.

\u{1F4E7} Email: ${userEmail}
\u{1F4E6} Plan: ${planName}
\u23F1\uFE0F Period: ${periodText}
\u{1F4B5} Amount: $${amount}
\u{1F516} Reference: ${referenceCode}

Please guide me through the payment process.`;
}
function getWhatsAppUrl(phoneNumber, message) {
  const encodedMessage = encodeURIComponent(message);
  const cleanNumber = phoneNumber.replace(/[+-\s]/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}
function calculateSubscriptionEndDate(startDate, periodMonths) {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + periodMonths);
  return endDate;
}
function calculateGracePeriodEndDate(subscriptionEndDate) {
  const graceEndDate = new Date(subscriptionEndDate);
  graceEndDate.setHours(graceEndDate.getHours() + 48);
  return graceEndDate;
}
function getPlanDisplayName(plan) {
  switch (plan) {
    case "starter_trader":
      return "Starter Trader";
    case "pro_trader":
      return "Pro Trader";
    case "admin":
      return "Admin";
    default:
      return "Free";
  }
}
function getPeriodDisplayText(period) {
  if (period === 1) return "1 Month";
  if (period === 3) return "3 Months";
  if (period === 12) return "1 Year";
  return `${period} Months`;
}
var SUBSCRIPTION_PRICING, FIRST_TIME_DISCOUNT;
var init_paymentService = __esm({
  "server/services/paymentService.ts"() {
    "use strict";
    SUBSCRIPTION_PRICING = {
      starter_trader: {
        1: { price: 49, discount: 0 },
        // 1 month - $49
        3: { price: 117, discount: 20 },
        // 3 months - $117 (20% off)
        12: { price: 319, discount: 45 }
        // 1 year - $319 (45% off)
      },
      pro_trader: {
        1: { price: 99, discount: 0 },
        // 1 month - $99
        3: { price: 237, discount: 20 },
        // 3 months - $237 (20% off)
        12: { price: 700, discount: 45 }
        // 1 year - $700 (45% off)
      }
    };
    FIRST_TIME_DISCOUNT = 10;
  }
});

// server/index.ts
import express2 from "express";
import cors from "cors";
import helmet from "helmet";
import session2 from "express-session";
import connectPg2 from "connect-pg-simple";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  economicNews: () => economicNews,
  insertNewsSchema: () => insertNewsSchema,
  insertSignalSchema: () => insertSignalSchema,
  insertUserSchema: () => insertUserSchema,
  newsCurrencyEnum: () => newsCurrencyEnum,
  newsImpactEnum: () => newsImpactEnum,
  passwordResetTokens: () => passwordResetTokens,
  paymentRequests: () => paymentRequests,
  paymentStatusEnum: () => paymentStatusEnum,
  securityEvents: () => securityEvents,
  sessions: () => sessions,
  signalDirectionEnum: () => signalDirectionEnum,
  signalStatusEnum: () => signalStatusEnum,
  signalsRelations: () => signalsRelations,
  timeframeEnum: () => timeframeEnum,
  tradingSignals: () => tradingSignals,
  userActionEnum: () => userActionEnum,
  userSessions: () => userSessions,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
  decimal,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var signalDirectionEnum = pgEnum("signal_direction", ["BUY", "SELL"]);
var signalStatusEnum = pgEnum("signal_status", ["fresh", "active", "closed", "stopped"]);
var userActionEnum = pgEnum("user_action", ["pending", "successful", "unsuccessful", "didnt_take"]);
var timeframeEnum = pgEnum("timeframe", ["5M", "15M", "30M", "1H", "4H", "1D", "1W"]);
var newsImpactEnum = pgEnum("news_impact", ["low", "medium", "high"]);
var newsCurrencyEnum = pgEnum("news_currency", ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"]);
var paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "cancelled", "expired"]);
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  phoneNumber: varchar("phone_number"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  alias: varchar("alias"),
  profileImageUrl: varchar("profile_image_url"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  emailVerificationToken: varchar("email_verification_token"),
  phoneVerificationToken: varchar("phone_verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  password: varchar("password"),
  // For independent auth (bcrypt hashed)
  isActive: boolean("is_active").default(true).notNull(),
  accountLocked: boolean("account_locked").default(false).notNull(),
  loginAttempts: integer("login_attempts").default(0).notNull(),
  lastLoginAttempt: timestamp("last_login_attempt"),
  subscriptionTier: varchar("subscription_tier").default("free").notNull().$type(),
  subscriptionStartDate: timestamp("subscription_start_date").defaultNow(),
  // When user started current billing cycle
  subscriptionEndDate: timestamp("subscription_end_date"),
  // When subscription expires
  subscriptionPeriod: integer("subscription_period"),
  // Duration in months: 1, 3, or 12
  isFirstTimeSubscriber: boolean("is_first_time_subscriber").default(true).notNull(),
  // For 10% first-time discount
  gracePeriodEndDate: timestamp("grace_period_end_date"),
  // 48h grace period after expiry
  dailyCredits: integer("daily_credits").default(0).notNull(),
  monthlyCredits: integer("monthly_credits").default(0).notNull(),
  maxDailyCredits: integer("max_daily_credits").default(2).notNull(),
  maxMonthlyCredits: integer("max_monthly_credits").default(10).notNull(),
  lastCreditReset: timestamp("last_credit_reset").defaultNow(),
  lastGenerationTime: timestamp("last_generation_time"),
  monthlyCompletionStreak: integer("monthly_completion_streak").default(0).notNull(),
  lastNotificationDate: timestamp("last_notification_date"),
  pendingDiscountCode: varchar("pending_discount_code"),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  selectedPlan: varchar("selected_plan"),
  heardFrom: varchar("heard_from"),
  tradingExperience: varchar("trading_experience"),
  tradingGoals: text("trading_goals"),
  currentOccupation: varchar("current_occupation"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var tradingSignals = pgTable("trading_signals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  pair: varchar("pair").default("XAUUSD").notNull(),
  direction: signalDirectionEnum("direction").notNull(),
  timeframe: timeframeEnum("timeframe").notNull(),
  entryPrice: decimal("entry_price", { precision: 10, scale: 2 }).notNull(),
  stopLoss: decimal("stop_loss", { precision: 10, scale: 2 }).notNull(),
  takeProfit: decimal("take_profit", { precision: 10, scale: 2 }).notNull(),
  takeProfits: jsonb("take_profits"),
  // Store take profit levels as JSON
  confidence: integer("confidence").notNull(),
  // 1-100
  analysis: text("analysis"),
  status: signalStatusEnum("status").default("fresh").notNull(),
  userAction: userActionEnum("user_action").default("pending").notNull(),
  pips: decimal("pips", { precision: 10, scale: 2 }),
  lastNotified: timestamp("last_notified"),
  createdAt: timestamp("created_at").defaultNow(),
  closedAt: timestamp("closed_at")
});
var economicNews = pgTable("economic_news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  currency: newsCurrencyEnum("currency").notNull(),
  impact: newsImpactEnum("impact").notNull(),
  eventTime: timestamp("event_time").notNull(),
  actualValue: varchar("actual_value"),
  forecastValue: varchar("forecast_value"),
  previousValue: varchar("previous_value"),
  source: varchar("source").default("manual").notNull(),
  sourceUrl: varchar("source_url"),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  ipAddress: varchar("ip_address").notNull(),
  userAgent: text("user_agent"),
  deviceFingerprint: varchar("device_fingerprint"),
  isActive: boolean("is_active").default(true).notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var securityEvents = pgTable("security_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  eventType: varchar("event_type").notNull(),
  // login_attempt, suspicious_activity, multiple_sessions, etc
  ipAddress: varchar("ip_address").notNull(),
  details: text("details"),
  severity: varchar("severity").default("low").notNull(),
  // low, medium, high, critical
  blocked: boolean("blocked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  // Hashed token
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  ipAddress: varchar("ip_address").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var paymentRequests = pgTable("payment_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  userEmail: varchar("user_email").notNull(),
  requestedPlan: varchar("requested_plan").notNull().$type(),
  subscriptionPeriod: integer("subscription_period").notNull(),
  // 1, 3, or 12 months
  referenceCode: varchar("reference_code").notNull().unique(),
  // e.g., PAY-ABC123
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  // Final amount after discount
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(),
  // Before discount
  discountPercentage: integer("discount_percentage").default(0).notNull(),
  // 10% first-time, 20%, or 45%
  status: paymentStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  // For support to add comments
  whatsappNumber: varchar("whatsapp_number"),
  // User's WhatsApp if provided
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  completedByAdminId: varchar("completed_by_admin_id").references(() => users.id)
});
var usersRelations = relations(users, ({ many }) => ({
  signals: many(tradingSignals),
  paymentRequests: many(paymentRequests)
}));
var signalsRelations = relations(tradingSignals, ({ one }) => ({
  user: one(users, {
    fields: [tradingSignals.userId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).pick({
  email: true,
  phoneNumber: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true
});
var insertSignalSchema = createInsertSchema(tradingSignals).omit({
  id: true,
  createdAt: true,
  closedAt: true
});
var insertNewsSchema = createInsertSchema(economicNews).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, desc, and, gte, or, sql as sql2, count } from "drizzle-orm";

// server/services/verificationService.ts
import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys, TransactionalSMSApi, TransactionalSMSApiApiKeys } from "@getbrevo/brevo";
import crypto from "crypto";
var emailApi = null;
var smsApi = null;
try {
  if (process.env.BREVO_API_KEY) {
    emailApi = new TransactionalEmailsApi();
    emailApi.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
    smsApi = new TransactionalSMSApi();
    smsApi.setApiKey(TransactionalSMSApiApiKeys.apiKey, process.env.BREVO_API_KEY);
  } else {
    console.warn("BREVO_API_KEY not found - verification services will be limited");
  }
} catch (error) {
  console.error("Failed to initialize Brevo services:", error);
}
var VerificationService = class {
  // Generate cryptographically secure 6-digit OTP
  generateOTP() {
    return crypto.randomInt(1e5, 1e6).toString();
  }
  // Generate secure verification token
  generateToken() {
    return crypto.randomBytes(32).toString("hex");
  }
  // Hash token using SHA-256 for secure storage
  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
  // Verify plaintext token against hashed version
  verifyToken(plainToken, hashedToken) {
    try {
      if (!plainToken || !hashedToken || typeof plainToken !== "string" || typeof hashedToken !== "string") {
        return false;
      }
      const hashedPlain = this.hashToken(plainToken);
      if (hashedPlain.length !== hashedToken.length || !/^[0-9a-fA-F]+$/.test(hashedPlain) || !/^[0-9a-fA-F]+$/.test(hashedToken)) {
        return false;
      }
      return crypto.timingSafeEqual(Buffer.from(hashedPlain, "hex"), Buffer.from(hashedToken, "hex"));
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  }
  // Calculate expiry time (10 minutes from now)
  getExpiryTime() {
    return new Date(Date.now() + 10 * 60 * 1e3);
  }
  // Send email verification
  async sendEmailVerification(params) {
    if (!emailApi) {
      return {
        success: false,
        error: "Email service not available - BREVO_API_KEY not configured"
      };
    }
    try {
      const emailData = {
        to: [{ email: params.to, name: params.firstName || "User" }],
        subject: "Verify your Next Trading Labs account",
        htmlContent: `
          <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">Next Trading Labs</h1>
              <p style="color: #9ca3af; margin: 5px 0 0 0;">AI-Powered Trading Platform</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f1419 100%); padding: 30px; border-radius: 12px; border: 1px solid #334155;">
              <h2 style="color: #e2e8f0; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email Address</h2>
              
              <p style="color: #cbd5e1; line-height: 1.6; margin-bottom: 30px;">
                ${params.firstName ? `Hi ${params.firstName},` : "Hello,"}<br><br>
                Welcome to Next Trading Labs! To complete your registration and start accessing our AI-powered trading signals, please verify your email address.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: #3b82f6; color: white; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px; display: inline-block; font-family: 'Courier New', monospace;">
                  ${params.token}
                </div>
                <p style="color: #64748b; font-size: 14px; margin-top: 15px;">
                  This verification code expires in 10 minutes
                </p>
              </div>
              
              <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #f1f5f9; margin: 0 0 10px 0; font-size: 16px;">Security Notice:</h3>
                <ul style="color: #94a3b8; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li>Never share this code with anyone</li>
                  <li>Our team will never ask for verification codes</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>
              
              <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
                Need help? Contact our support team at support@nextradinglabs.com
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
              <p>Next Trading Labs - Professional AI Trading Platform</p>
              <p>This email was sent to ${params.to}</p>
            </div>
          </div>
        `,
        textContent: `
Next Trading Labs - Email Verification

${params.firstName ? `Hi ${params.firstName},` : "Hello,"}

Welcome to Next Trading Labs! Please use this verification code to complete your registration:

VERIFICATION CODE: ${params.token}

This code expires in 10 minutes.

Security Notice:
- Never share this code with anyone
- Our team will never ask for verification codes
- If you didn't request this, please ignore this email

Need help? Contact support@nextradinglabs.com

Next Trading Labs - Professional AI Trading Platform
        `,
        sender: {
          email: "support@nextradinglabs.com",
          name: "Next Trading Labs"
        }
      };
      await emailApi.sendTransacEmail(emailData);
      return {
        success: true,
        token: this.hashToken(params.token),
        // Return hashed token for storage
        expiresAt: this.getExpiryTime()
      };
    } catch (error) {
      console.error("Brevo email verification error:", error);
      return {
        success: false,
        error: "Failed to send verification email"
      };
    }
  }
  // Send SMS verification using Brevo SMS API
  async sendSMSVerification(params) {
    if (!smsApi) {
      if (process.env.NODE_ENV !== "production") {
        console.log(`[FALLBACK] SMS Verification Code for ${params.phoneNumber}: ${params.token}`);
      }
      console.warn("Brevo SMS API not available - using fallback logging");
      return {
        success: true,
        token: this.hashToken(params.token),
        // Return hashed token for storage
        expiresAt: this.getExpiryTime()
      };
    }
    try {
      let formattedPhone = params.phoneNumber;
      if (!formattedPhone.startsWith("+")) {
        formattedPhone = `+212${formattedPhone.replace(/^0/, "")}`;
      }
      const smsData = {
        sender: "NextTrading",
        recipient: formattedPhone,
        content: `Your Next Trading Labs verification code is: ${params.token}. This code expires in 10 minutes. Never share this code with anyone.`
      };
      await smsApi.sendTransacSms(smsData);
      return {
        success: true,
        token: this.hashToken(params.token),
        // Return hashed token for storage
        expiresAt: this.getExpiryTime()
      };
    } catch (error) {
      console.error("Brevo SMS verification error:", error);
      if (process.env.NODE_ENV !== "production") {
        console.log(`[FALLBACK] SMS Verification Code for ${params.phoneNumber}: ${params.token}`);
      }
      console.warn("SMS sending failed - using fallback logging");
      return {
        success: true,
        // Still return success since we have fallback
        token: this.hashToken(params.token),
        // Return hashed token for storage
        expiresAt: this.getExpiryTime()
      };
    }
  }
  // Verify token format (6 digits for OTP)
  isValidOTPFormat(token) {
    return /^\d{6}$/.test(token);
  }
  // Check if token is expired
  isTokenExpired(expiresAt) {
    return /* @__PURE__ */ new Date() > expiresAt;
  }
  // Send account blocked notification email
  async sendAccountBlockedEmail(email, firstName, reason) {
    if (!emailApi) {
      return {
        success: false,
        error: "Email service not available"
      };
    }
    try {
      const emailData = {
        to: [{ email, name: firstName || "User" }],
        subject: "Account Access Temporarily Blocked - Next Trading Labs",
        htmlContent: `
          <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">Next Trading Labs</h1>
              <p style="color: #9ca3af; margin: 5px 0 0 0;">AI-Powered Trading Platform</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f1419 100%); padding: 30px; border-radius: 12px; border: 1px solid #334155;">
              <h2 style="color: #ef4444; margin: 0 0 20px 0; font-size: 24px;">Account Access Temporarily Blocked</h2>
              
              <p style="color: #cbd5e1; line-height: 1.6; margin-bottom: 20px;">
                Hi ${firstName},<br><br>
                We've detected unusual activity on your Next Trading Labs account and have temporarily blocked access to protect the security of our platform.
              </p>
              
              <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <h3 style="color: #f1f5f9; margin: 0 0 10px 0; font-size: 16px;">Reason:</h3>
                <p style="color: #cbd5e1; margin: 0; line-height: 1.6;">
                  ${reason}
                </p>
              </div>
              
              <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #f1f5f9; margin: 0 0 10px 0; font-size: 16px;">What you can do:</h3>
                <ul style="color: #94a3b8; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li>Please ensure you're using your account on only one device at a time</li>
                  <li>If you have multiple free accounts, consider upgrading to a paid plan</li>
                  <li>Contact our support team if you believe this was done in error</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:support@nextradinglabs.com" style="background: #3b82f6; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold;">
                  Contact Support
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
                Our support team is here to help: support@nextradinglabs.com
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
              <p>Next Trading Labs - Professional AI Trading Platform</p>
              <p>This email was sent to ${email}</p>
            </div>
          </div>
        `,
        textContent: `
Next Trading Labs - Account Access Blocked

Hi ${firstName},

We've detected unusual activity on your Next Trading Labs account and have temporarily blocked access to protect the security of our platform.

Reason: ${reason}

What you can do:
- Please ensure you're using your account on only one device at a time
- If you have multiple free accounts, consider upgrading to a paid plan
- Contact our support team if you believe this was done in error

Contact Support: support@nextradinglabs.com

Next Trading Labs - Professional AI Trading Platform
        `,
        sender: {
          email: "support@nextradinglabs.com",
          name: "Next Trading Labs Security"
        }
      };
      await emailApi.sendTransacEmail(emailData);
      return { success: true };
    } catch (error) {
      console.error("Failed to send account blocked email:", error);
      return {
        success: false,
        error: "Failed to send notification email"
      };
    }
  }
};
var verificationService = new VerificationService();

// server/storage.ts
var DatabaseStorage = class {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async getAllUsers() {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return allUsers;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async updateUser(userId, updates) {
    const [user] = await db.update(users).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return user;
  }
  async updateUserLoginAttempts(userId, attempts, lockAccount) {
    await db.update(users).set({
      loginAttempts: attempts,
      accountLocked: lockAccount,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  async updateUserCredits(userId, dailyCredits, monthlyCredits) {
    await db.update(users).set({
      dailyCredits,
      monthlyCredits,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  async resetDailyCredits(userId) {
    await db.update(users).set({
      dailyCredits: 0,
      // Reset to 0 (meaning "used 0 credits today")
      lastGenerationTime: null,
      // Clear cooldown - fresh start for the day
      lastCreditReset: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  async updateUserLastGenerationTime(userId, timestamp2) {
    await db.update(users).set({
      lastGenerationTime: timestamp2,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  async atomicGenerationUpdate(userId, dailyLimit, cooldownMinutes, now) {
    const cutoff = new Date(now.getTime() - cooldownMinutes * 60 * 1e3);
    const result = await db.update(users).set({
      dailyCredits: sql2`${users.dailyCredits} + 1`,
      monthlyCredits: sql2`${users.monthlyCredits} + 1`,
      lastGenerationTime: now,
      updatedAt: now
    }).where(
      and(
        eq(users.id, userId),
        // Only update if daily credits haven't reached limit (DB state)
        sql2`${users.dailyCredits} < ${dailyLimit}`,
        // Only update if cooldown has expired or no previous generation (DB state)
        sql2`(${users.lastGenerationTime} IS NULL OR ${users.lastGenerationTime} <= ${cutoff})`
      )
    );
    const rowsAffected = result.rowCount ?? result.changes ?? 0;
    return { success: rowsAffected > 0 };
  }
  async revertGenerationUpdate(userId, previousDailyCredits, previousLastGenerationTime) {
    await db.update(users).set({
      dailyCredits: previousDailyCredits,
      monthlyCredits: sql2`${users.monthlyCredits} - 1`,
      lastGenerationTime: previousLastGenerationTime,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  async createSignal(signal) {
    const [newSignal] = await db.insert(tradingSignals).values(signal).returning();
    return newSignal;
  }
  async getUserSignals(userId, limit = 20) {
    return await db.select().from(tradingSignals).where(eq(tradingSignals.userId, userId)).orderBy(desc(tradingSignals.createdAt)).limit(limit);
  }
  async getRecentSignals(userId, hours = 24) {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1e3);
    return await db.select().from(tradingSignals).where(
      and(
        eq(tradingSignals.userId, userId),
        gte(tradingSignals.createdAt, cutoffTime)
      )
    ).orderBy(desc(tradingSignals.createdAt));
  }
  async updateSignalStatus(signalId, status, pips) {
    const updateData = {
      status,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (status === "closed" || status === "stopped") {
      updateData.closedAt = /* @__PURE__ */ new Date();
    }
    if (pips !== void 0) {
      updateData.pips = pips.toString();
    }
    await db.update(tradingSignals).set(updateData).where(eq(tradingSignals.id, signalId));
  }
  async getLatestSignal(userId) {
    const [signal] = await db.select().from(tradingSignals).where(eq(tradingSignals.userId, userId)).orderBy(desc(tradingSignals.createdAt)).limit(1);
    return signal;
  }
  async getAllActiveSignals() {
    return await db.select().from(tradingSignals).where(
      or(
        eq(tradingSignals.status, "fresh"),
        eq(tradingSignals.status, "active")
      )
    ).orderBy(desc(tradingSignals.createdAt));
  }
  async updateSignalUserAction(signalId, userAction) {
    await db.update(tradingSignals).set({
      userAction
    }).where(eq(tradingSignals.id, signalId));
  }
  async updateUserNotificationDate(userId) {
    await db.update(users).set({
      lastNotificationDate: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  async updateUserDiscountCode(userId, discountCode) {
    await db.update(users).set({
      pendingDiscountCode: discountCode,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  // News operations
  async createNews(news) {
    const [newsItem] = await db.insert(economicNews).values(news).returning();
    return newsItem;
  }
  async getRecentNews(limit = 10, currency, impact) {
    let query = db.select().from(economicNews).where(
      and(
        eq(economicNews.isArchived, false),
        gte(economicNews.eventTime, new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3))
        // Last 7 days
      )
    ).orderBy(desc(economicNews.eventTime)).limit(limit);
    return query;
  }
  async getUpcomingNews(limit = 10, currency, impact) {
    let query = db.select().from(economicNews).where(
      and(
        eq(economicNews.isArchived, false),
        gte(economicNews.eventTime, /* @__PURE__ */ new Date())
        // Future events only
      )
    ).orderBy(economicNews.eventTime).limit(limit);
    return query;
  }
  async archiveOldNews(daysOld = 30) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1e3);
    await db.update(economicNews).set({
      isArchived: true,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(
      and(
        eq(economicNews.isArchived, false),
        gte(economicNews.eventTime, cutoffDate)
      )
    );
  }
  // Verification operations
  async setEmailVerificationToken(userId, token, expiresAt) {
    const hashedToken = verificationService.hashToken(token);
    await db.update(users).set({
      emailVerificationToken: hashedToken,
      verificationTokenExpiry: expiresAt,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  async setPhoneVerificationToken(userId, token, expiresAt) {
    const hashedToken = verificationService.hashToken(token);
    await db.update(users).set({
      phoneVerificationToken: hashedToken,
      verificationTokenExpiry: expiresAt,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  async verifyEmailToken(userId, token) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || !user.emailVerificationToken) {
      return { success: false };
    }
    if (user.verificationTokenExpiry && /* @__PURE__ */ new Date() > user.verificationTokenExpiry) {
      return { success: false, expired: true };
    }
    const isValidToken = verificationService.verifyToken(token, user.emailVerificationToken);
    if (!isValidToken) {
      return { success: false };
    }
    await db.update(users).set({
      emailVerificationToken: null,
      verificationTokenExpiry: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
    return { success: true };
  }
  async verifyPhoneToken(userId, token) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || !user.phoneVerificationToken) {
      return { success: false };
    }
    if (user.verificationTokenExpiry && /* @__PURE__ */ new Date() > user.verificationTokenExpiry) {
      return { success: false, expired: true };
    }
    const isValidToken = verificationService.verifyToken(token, user.phoneVerificationToken);
    if (!isValidToken) {
      return { success: false };
    }
    await db.update(users).set({
      phoneVerificationToken: null,
      verificationTokenExpiry: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
    return { success: true };
  }
  async markEmailVerified(userId) {
    await db.update(users).set({
      emailVerified: true,
      emailVerificationToken: null,
      verificationTokenExpiry: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  async markPhoneVerified(userId) {
    await db.update(users).set({
      phoneVerified: true,
      phoneVerificationToken: null,
      verificationTokenExpiry: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  // Abuse detection operations
  async logUserSession(userId, ipAddress, userAgent, deviceFingerprint) {
    const activeSessions = await db.select().from(userSessions).where(and(eq(userSessions.userId, userId), eq(userSessions.isActive, true))).orderBy(desc(userSessions.lastActivity)).limit(10);
    if (activeSessions.length >= 5) {
      const sessionsToDeactivate = activeSessions.slice(4);
      for (const session3 of sessionsToDeactivate) {
        await db.update(userSessions).set({ isActive: false }).where(eq(userSessions.id, session3.id));
      }
    }
    await db.insert(userSessions).values({
      userId,
      ipAddress,
      userAgent,
      deviceFingerprint,
      isActive: true,
      lastActivity: /* @__PURE__ */ new Date()
    });
  }
  async getUserSessions(userId, sinceDate) {
    const cutoffDate = sinceDate || new Date(Date.now() - 24 * 60 * 60 * 1e3);
    const sessions2 = await db.select().from(userSessions).where(
      and(
        eq(userSessions.userId, userId),
        gte(userSessions.lastActivity, cutoffDate)
      )
    ).orderBy(desc(userSessions.lastActivity));
    return sessions2.map((session3) => {
      let parsedFingerprint = null;
      if (session3.deviceFingerprint) {
        try {
          parsedFingerprint = JSON.parse(session3.deviceFingerprint);
        } catch (e) {
          parsedFingerprint = { deviceId: session3.deviceFingerprint };
        }
      }
      return {
        userId: session3.userId,
        deviceId: parsedFingerprint?.deviceId || session3.deviceFingerprint || "unknown",
        ipAddress: session3.ipAddress,
        userAgent: session3.userAgent,
        lastActive: session3.lastActivity,
        deviceFingerprint: parsedFingerprint
      };
    });
  }
  async getDeviceSessions(deviceId, sinceDate) {
    const cutoffDate = sinceDate || new Date(Date.now() - 24 * 60 * 60 * 1e3);
    const sessions2 = await db.select().from(userSessions).where(gte(userSessions.lastActivity, cutoffDate)).orderBy(desc(userSessions.lastActivity));
    const matchingSessions = sessions2.filter((session3) => {
      let parsedFingerprint = null;
      if (session3.deviceFingerprint) {
        try {
          parsedFingerprint = JSON.parse(session3.deviceFingerprint);
        } catch (e) {
          parsedFingerprint = { deviceId: session3.deviceFingerprint };
        }
      }
      const sessionDeviceId = parsedFingerprint?.deviceId || session3.deviceFingerprint || "unknown";
      return sessionDeviceId === deviceId;
    });
    return matchingSessions.map((session3) => {
      let parsedFingerprint = null;
      if (session3.deviceFingerprint) {
        try {
          parsedFingerprint = JSON.parse(session3.deviceFingerprint);
        } catch (e) {
          parsedFingerprint = { deviceId: session3.deviceFingerprint };
        }
      }
      return {
        userId: session3.userId,
        deviceId: parsedFingerprint?.deviceId || session3.deviceFingerprint || "unknown",
        ipAddress: session3.ipAddress,
        userAgent: session3.userAgent,
        lastActive: session3.lastActivity,
        deviceFingerprint: parsedFingerprint
      };
    });
  }
  async checkSuspiciousActivity(userId, ipAddress) {
    const now = /* @__PURE__ */ new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1e3);
    const recentSessions = await db.select().from(userSessions).where(
      and(
        eq(userSessions.userId, userId),
        gte(userSessions.lastActivity, oneHourAgo)
      )
    );
    const uniqueIPs = new Set(recentSessions.map((s) => s.ipAddress));
    if (uniqueIPs.size > 3) {
      await this.logSecurityEvent(userId, "multiple_ips", ipAddress, "Multiple IP addresses in 1 hour", "medium");
      return { suspicious: true, reason: "Multiple IP addresses detected" };
    }
    const activeSessions = await this.getActiveSessionsForUser(userId);
    if (activeSessions > 5) {
      await this.logSecurityEvent(userId, "multiple_sessions", ipAddress, "Too many concurrent sessions", "high");
      return { suspicious: true, reason: "Too many concurrent sessions" };
    }
    const ipUsers = await this.getActiveSessionsForIP(ipAddress);
    if (ipUsers > 10) {
      await this.logSecurityEvent(userId, "shared_ip", ipAddress, "IP used by many users", "medium");
      return { suspicious: true, reason: "Shared IP address detected" };
    }
    return { suspicious: false };
  }
  async getActiveSessionsForUser(userId) {
    const result = await db.select({ count: count() }).from(userSessions).where(
      and(
        eq(userSessions.userId, userId),
        eq(userSessions.isActive, true)
      )
    );
    return result[0]?.count || 0;
  }
  async getActiveSessionsForIP(ipAddress) {
    const result = await db.select({ count: count() }).from(userSessions).where(
      and(
        eq(userSessions.ipAddress, ipAddress),
        eq(userSessions.isActive, true),
        gte(userSessions.lastActivity, new Date(Date.now() - 24 * 60 * 60 * 1e3))
        // Last 24 hours
      )
    );
    return result[0]?.count || 0;
  }
  async logSuspiciousActivity(userId, activityType, metadata) {
    const details = metadata ? JSON.stringify(metadata) : "No additional details";
    await this.logSecurityEvent(userId, activityType, "system", details, "medium");
  }
  // Session management operations
  async terminateUserSession(sessionId) {
    await db.update(userSessions).set({ isActive: false }).where(eq(userSessions.id, sessionId));
  }
  async terminateOldestUserSessions(userId, maxSessions) {
    const activeSessions = await db.select().from(userSessions).where(and(eq(userSessions.userId, userId), eq(userSessions.isActive, true))).orderBy(userSessions.lastActivity);
    if (activeSessions.length > maxSessions) {
      const sessionsToTerminate = activeSessions.slice(0, activeSessions.length - maxSessions);
      for (const session3 of sessionsToTerminate) {
        await this.terminateUserSession(session3.id);
      }
      await this.logSecurityEvent(
        userId,
        "session_limit_enforced",
        "system",
        `Terminated ${sessionsToTerminate.length} oldest sessions (limit: ${maxSessions})`,
        "medium"
      );
    }
  }
  async updateSessionActivity(userId, deviceId, ipAddress, userAgent, deviceFingerprint) {
    const existingSessions = await db.select().from(userSessions).where(
      and(
        eq(userSessions.userId, userId),
        eq(userSessions.ipAddress, ipAddress),
        eq(userSessions.isActive, true)
      )
    ).orderBy(desc(userSessions.lastActivity)).limit(1);
    const deviceFingerprintStr = deviceFingerprint ? JSON.stringify(deviceFingerprint) : deviceId;
    if (existingSessions.length > 0) {
      await db.update(userSessions).set({
        lastActivity: /* @__PURE__ */ new Date(),
        userAgent,
        deviceFingerprint: deviceFingerprintStr
      }).where(eq(userSessions.id, existingSessions[0].id));
    } else {
      await db.insert(userSessions).values({
        userId,
        ipAddress,
        userAgent,
        deviceFingerprint: deviceFingerprintStr,
        isActive: true,
        lastActivity: /* @__PURE__ */ new Date()
      });
    }
    await this.terminateOldestUserSessions(userId, 2);
  }
  async terminateAllUserSessions(userId) {
    await db.update(userSessions).set({ isActive: false }).where(and(eq(userSessions.userId, userId), eq(userSessions.isActive, true)));
    await this.logSecurityEvent(
      userId,
      "all_sessions_terminated",
      "system",
      "All user sessions terminated due to security policy",
      "high"
    );
  }
  // Helper method for logging security events
  async logSecurityEvent(userId, eventType, ipAddress, details, severity) {
    await db.insert(securityEvents).values({
      userId,
      eventType,
      ipAddress,
      details,
      severity
    });
  }
  // ==================== Payment Request Methods ====================
  async createPaymentRequest(data) {
    const [paymentRequest] = await db.insert(paymentRequests).values(data).returning();
    return paymentRequest;
  }
  async getPaymentRequest(id) {
    const [request] = await db.select().from(paymentRequests).where(eq(paymentRequests.id, id));
    return request;
  }
  async getPaymentRequestByReference(referenceCode) {
    const [request] = await db.select().from(paymentRequests).where(eq(paymentRequests.referenceCode, referenceCode));
    return request;
  }
  async getUserPaymentRequests(userId) {
    return await db.select().from(paymentRequests).where(eq(paymentRequests.userId, userId)).orderBy(desc(paymentRequests.createdAt));
  }
  async getAllPendingPaymentRequests() {
    return await db.select().from(paymentRequests).where(eq(paymentRequests.status, "pending")).orderBy(desc(paymentRequests.createdAt));
  }
  async getAllPaymentRequests() {
    return await db.select().from(paymentRequests).orderBy(desc(paymentRequests.createdAt));
  }
  async confirmPaymentRequest(requestId, adminId) {
    const [updatedRequest] = await db.update(paymentRequests).set({
      status: "completed",
      completedAt: /* @__PURE__ */ new Date(),
      completedByAdminId: adminId
    }).where(eq(paymentRequests.id, requestId)).returning();
    return updatedRequest;
  }
  async cancelPaymentRequest(requestId) {
    const [updatedRequest] = await db.update(paymentRequests).set({ status: "cancelled" }).where(eq(paymentRequests.id, requestId)).returning();
    return updatedRequest;
  }
  async updatePaymentRequestNotes(requestId, notes) {
    const [updatedRequest] = await db.update(paymentRequests).set({ notes }).where(eq(paymentRequests.id, requestId)).returning();
    return updatedRequest;
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
var isReplitAuthEnabled = !!process.env.REPLIT_DOMAINS;
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl2 = 7 * 24 * 60 * 60 * 1e3;
  if (process.env.DATABASE_URL) {
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      // Allow table creation
      ttl: sessionTtl2,
      tableName: "sessions"
    });
    return session({
      secret: process.env.SESSION_SECRET,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl2,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
      }
    });
  }
  return session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl2,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  if (!isReplitAuthEnabled) {
    console.log("Replit auth disabled - using independent authentication only");
    return;
  }
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}

// server/services/openaiService.ts
import OpenAI from "openai";

// server/utils/apiLogger.ts
import fs from "fs";
import path from "path";
var APILogger = class {
  logsDir = path.join(process.cwd(), "logs");
  constructor() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }
  async logSignalGeneration(entry) {
    try {
      const date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const filename = `signal-generation-${date}.json`;
      const filepath = path.join(this.logsDir, filename);
      let existingLogs = [];
      if (fs.existsSync(filepath)) {
        const fileContent = fs.readFileSync(filepath, "utf8");
        try {
          existingLogs = JSON.parse(fileContent);
        } catch (parseError) {
          console.error("Error parsing existing log file:", parseError);
          existingLogs = [];
        }
      }
      existingLogs.push(entry);
      fs.writeFileSync(filepath, JSON.stringify(existingLogs, null, 2));
      console.log(`API call logged to: ${filename}`);
    } catch (error) {
      console.error("Error logging API call:", error);
    }
  }
  async getLogsByDate(date) {
    try {
      const filename = `signal-generation-${date}.json`;
      const filepath = path.join(this.logsDir, filename);
      if (!fs.existsSync(filepath)) {
        return [];
      }
      const fileContent = fs.readFileSync(filepath, "utf8");
      return JSON.parse(fileContent);
    } catch (error) {
      console.error("Error reading logs:", error);
      return [];
    }
  }
  async getAllLogFiles() {
    try {
      const files = fs.readdirSync(this.logsDir);
      return files.filter((file) => file.startsWith("signal-generation-") && file.endsWith(".json"));
    } catch (error) {
      console.error("Error reading log directory:", error);
      return [];
    }
  }
};
var apiLogger = new APILogger();

// server/services/openaiService.ts
var openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  } else {
    console.warn("OPENAI_API_KEY not found - trading signal generation will be limited");
  }
} catch (error) {
  console.error("Failed to initialize OpenAI service:", error);
}
async function generateTradingSignal(timeframe, subscriptionTier, userId) {
  const startTime = Date.now();
  let logEntry;
  if (!openai) {
    console.warn("OpenAI not available - returning mock trading signal for development");
    return generateMockSignal(timeframe, subscriptionTier, userId);
  }
  try {
    const symbol = "XAUUSD";
    const prompt = `You are a professional XAUUSD trading analyst. Please analyze the current XAUUSD market on the ${timeframe} timeframe and provide a trading signal.

Search for current XAUUSD price and recent market data. Perform comprehensive technical analysis including current price, support/resistance levels, RSI, MACD, moving averages, Bollinger Bands, market sentiment, and volume analysis.

Based on your analysis, determine BUY or SELL action and calculate entry, stop loss, and ${subscriptionTier === "pro_trader" || subscriptionTier === "admin" ? "3 take profit levels" : "take profit levels"}. Provide confidence score 60-100.

CRITICAL REQUIREMENT: Your analysis must contain ZERO website links, URLs, citations, or references to external sources. DO NOT include any text in brackets like [website.com] or (website.com). Provide pure technical analysis text ONLY. No sources, no links, no references whatsoever.

Return analysis in exact JSON format:
{
    "action": "BUY or SELL",
    "entry": current_market_price_number,
    "stop_loss": calculated_stop_loss_number,
    "take_profit": primary_take_profit_number,
    "confidence": confidence_score_60_to_100,
    "take_profits": [
        {"level": 1, "price": first_tp_level, "risk_reward_ratio": 1.5}${subscriptionTier === "pro_trader" || subscriptionTier === "admin" ? ',\n        {"level": 2, "price": second_tp_level, "risk_reward_ratio": 2.0},\n        {"level": 3, "price": third_tp_level, "risk_reward_ratio": 3.0}' : ""}
    ],
    "ai_analysis": {
        "brief": "${subscriptionTier === "starter_trader" ? "One sentence pure technical analysis with NO website links, citations, or brackets" : "Brief technical analysis with NO website links, citations, or brackets"}",
        "detailed": "${subscriptionTier === "pro_trader" || subscriptionTier === "admin" ? "Detailed 3-sentence pure technical analysis - NO links, NO citations, NO brackets, NO references" : subscriptionTier === "starter_trader" ? "2 sentences pure technical analysis - NO links, NO citations, NO brackets" : "Pure technical analysis with NO links, NO citations, NO brackets"}",
        "market_sentiment": "BULLISH, BEARISH, or NEUTRAL",
        "trend_direction": "UPWARD, DOWNWARD, or SIDEWAYS", 
        "key_indicators": ["List of technical indicators used in analysis"]
    },
    "future_positions": [],
    "historical_positions": [
        {"symbol": "XAUUSD", "entry_price": realistic_recent_price, "current_status": "ACTIVE", "days_active": 2, "unrealized_pnl": calculated_pnl}
    ],
    "has_notifications": true
}`;
    const response = await openai.responses.create({
      model: "gpt-5-mini",
      tools: [
        { type: "web_search" }
      ],
      input: prompt
    });
    const result = JSON.parse(response.output_text || "{}");
    const entryPrice = parseFloat(result.entry);
    const stopLoss = parseFloat(result.stop_loss);
    const takeProfit = parseFloat(result.take_profit);
    if (!entryPrice || !stopLoss || !takeProfit || entryPrice <= 0 || stopLoss <= 0 || takeProfit <= 0) {
      throw new Error("Invalid market prices received. AI may not have access to current market data. Please retry.");
    }
    if (entryPrice < 1e3 || entryPrice > 5e3) {
      throw new Error("Unrealistic gold price received. AI may not have access to current market data. Please retry.");
    }
    const finalResult = {
      action: result.action === "SELL" ? "SELL" : "BUY",
      entry: entryPrice,
      stop_loss: stopLoss,
      take_profit: takeProfit,
      confidence: Math.max(1, Math.min(100, parseInt(result.confidence) || 75)),
      take_profits: result.take_profits || [],
      ai_analysis: result.ai_analysis || {
        brief: "Market analysis completed.",
        detailed: "Technical analysis based on current conditions.",
        market_sentiment: "NEUTRAL",
        trend_direction: "SIDEWAYS",
        key_indicators: ["Technical Analysis"]
      },
      future_positions: result.future_positions || [],
      historical_positions: result.historical_positions || [],
      has_notifications: result.has_notifications !== false
    };
    const executionTime = Date.now() - startTime;
    logEntry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      userId: userId || "unknown",
      timeframe,
      subscriptionTier,
      request: {
        symbol,
        timeframe,
        userTier: subscriptionTier
      },
      response: finalResult,
      executionTime,
      success: true
    };
    await apiLogger.logSignalGeneration(logEntry);
    return finalResult;
  } catch (error) {
    console.error("OpenAI API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const executionTime = Date.now() - startTime;
    logEntry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      userId: userId || "unknown",
      timeframe,
      subscriptionTier,
      request: {
        symbol: "XAUUSD",
        timeframe,
        userTier: subscriptionTier
      },
      response: null,
      executionTime,
      success: false,
      error: errorMessage
    };
    await apiLogger.logSignalGeneration(logEntry);
    throw new Error(`Failed to generate trading signal: ${errorMessage}`);
  }
}
function generateMockSignal(timeframe, subscriptionTier, userId) {
  const mockPrice = 2650.5;
  const isBuy = Math.random() > 0.5;
  const stopDistance = 15;
  const tpDistance = 25;
  return {
    action: isBuy ? "BUY" : "SELL",
    entry: mockPrice,
    stop_loss: isBuy ? mockPrice - stopDistance : mockPrice + stopDistance,
    take_profit: isBuy ? mockPrice + tpDistance : mockPrice - tpDistance,
    confidence: 75,
    take_profits: [
      { level: 1, price: isBuy ? mockPrice + tpDistance : mockPrice - tpDistance, risk_reward_ratio: 1.5 }
    ],
    ai_analysis: {
      brief: "Mock signal for development testing - OpenAI service not available",
      detailed: "This is a mock trading signal generated for development purposes. Configure OPENAI_API_KEY for real AI analysis.",
      market_sentiment: "NEUTRAL",
      trend_direction: "SIDEWAYS",
      key_indicators: ["Mock Analysis"]
    },
    future_positions: [],
    historical_positions: [
      { symbol: "XAUUSD", entry_price: mockPrice - 10, current_status: "ACTIVE", days_active: 2, unrealized_pnl: 50 }
    ],
    has_notifications: true
  };
}

// server/services/marketService.ts
function isMarketOpen() {
  try {
    const now = /* @__PURE__ */ new Date();
    const casablancaTime = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Casablanca" }));
    const dayOfWeek = casablancaTime.getDay();
    const hour = casablancaTime.getHours();
    const minute = casablancaTime.getMinutes();
    if (dayOfWeek === 6) {
      return false;
    }
    if (dayOfWeek === 0) {
      return hour >= 22;
    }
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      return true;
    }
    if (dayOfWeek === 5) {
      return hour < 21 || hour === 21 && minute === 0;
    }
    return false;
  } catch (error) {
    console.error("Error checking market hours:", error);
    return false;
  }
}

// server/signalLifecycle.ts
var TIMEFRAME_DURATIONS = {
  // Fresh period - all signals start as fresh for 15 minutes
  FRESH_DURATION: 15 * 60 * 1e3,
  // 15 minutes
  // Running periods by timeframe
  "5M": 2 * 60 * 60 * 1e3,
  // 2 hours
  "15M": 2 * 60 * 60 * 1e3,
  // 2 hours  
  "30M": 24 * 60 * 60 * 1e3,
  // 1 day
  "1H": 24 * 60 * 60 * 1e3,
  // 1 day
  "4H": 2 * 24 * 60 * 60 * 1e3,
  // 2 days
  "1D": 7 * 24 * 60 * 60 * 1e3,
  // 1 week
  "1W": 60 * 24 * 60 * 60 * 1e3
  // 2 months (60 days)
};
function getSignalStatus(createdAt, timeframe) {
  const now = /* @__PURE__ */ new Date();
  const age = now.getTime() - createdAt.getTime();
  if (age < TIMEFRAME_DURATIONS.FRESH_DURATION) {
    return "fresh";
  }
  const runningDuration = TIMEFRAME_DURATIONS[timeframe];
  if (runningDuration && age > runningDuration) {
    return "closed";
  }
  return "active";
}
async function updateSignalStatuses() {
  try {
    const signals = await storage.getAllActiveSignals();
    for (const signal of signals) {
      const currentStatus = getSignalStatus(signal.createdAt, signal.timeframe);
      if (signal.status !== currentStatus) {
        await storage.updateSignalStatus(signal.id, currentStatus);
        console.log(`Updated signal ${signal.id} from ${signal.status} to ${currentStatus}`);
      }
    }
  } catch (error) {
    console.error("Error updating signal statuses:", error);
  }
}
function startSignalLifecycleService() {
  console.log("Starting signal lifecycle service...");
  updateSignalStatuses();
  setInterval(updateSignalStatuses, 5 * 60 * 1e3);
}

// server/services/notificationService.ts
import { differenceInDays, isToday, addMonths, differenceInCalendarDays } from "date-fns";
var NotificationService = class {
  // Check for signals that need user review (closed for >24 hours without user action)
  async checkPendingSignalReviews(userId) {
    const user = await storage.getUser(userId);
    if (!user) return { pendingSignals: [], shouldNotify: false };
    const signals = await storage.getUserSignals(userId);
    const pendingSignals = signals.filter(
      (signal) => signal.status === "closed" && signal.userAction === "pending" && signal.closedAt
    );
    const pendingWithDetails = pendingSignals.map((signal) => ({
      id: signal.id,
      pair: signal.pair,
      direction: signal.direction,
      entryPrice: signal.entryPrice,
      timeframe: signal.timeframe,
      closedAt: signal.closedAt,
      daysSinceClose: differenceInDays(/* @__PURE__ */ new Date(), signal.closedAt)
    }));
    const shouldNotify = pendingSignals.length > 0 && (!user.lastNotificationDate || !isToday(user.lastNotificationDate));
    return {
      pendingSignals: pendingWithDetails,
      shouldNotify
    };
  }
  // Generate discount code for monthly completion
  generateDiscountCode(userId, month, year) {
    const prefix = "TRADER";
    const userIdShort = userId.slice(-4).toUpperCase();
    const monthStr = month.toString().padStart(2, "0");
    const yearStr = year.toString().slice(-2);
    return `${prefix}${userIdShort}${monthStr}${yearStr}`;
  }
  // Check if user completed all signal reviews for the current billing cycle
  async checkMonthlyCompletion(userId) {
    const user = await storage.getUser(userId);
    if (!user) return {
      completed: false,
      allSignalsReviewed: false,
      totalSignals: 0,
      reviewedSignals: 0,
      discountPercentage: 0,
      daysUntilBillingCycleEnd: 999
    };
    const now = /* @__PURE__ */ new Date();
    const subscriptionStart = user.subscriptionStartDate || user.createdAt || now;
    let billingCycleStart = new Date(subscriptionStart);
    let billingCycleEnd = addMonths(billingCycleStart, 1);
    while (billingCycleEnd < now) {
      billingCycleStart = new Date(billingCycleEnd);
      billingCycleEnd = addMonths(billingCycleStart, 1);
    }
    const signals = await storage.getUserSignals(userId);
    const billingCycleSignals = signals.filter(
      (signal) => signal.status === "closed" && signal.closedAt && signal.closedAt >= billingCycleStart && signal.closedAt < billingCycleEnd
    );
    const totalSignals = billingCycleSignals.length;
    const reviewedSignals = billingCycleSignals.filter(
      (signal) => signal.userAction !== "pending"
    ).length;
    const allSignalsReviewed = totalSignals > 0 && reviewedSignals === totalSignals;
    const daysUntilBillingCycleEnd = differenceInCalendarDays(billingCycleEnd, now);
    const isWithinLastDay = daysUntilBillingCycleEnd <= 1 && daysUntilBillingCycleEnd >= 0;
    const completed = allSignalsReviewed && isWithinLastDay;
    let discountPercentage = 0;
    if (completed) {
      discountPercentage = 6;
    }
    let discountCode;
    if (completed && !user.pendingDiscountCode) {
      discountCode = this.generateDiscountCode(userId, billingCycleStart.getMonth() + 1, billingCycleStart.getFullYear());
      await storage.updateUserDiscountCode(userId, discountCode);
    } else if (user.pendingDiscountCode) {
      discountCode = user.pendingDiscountCode;
    }
    return {
      completed,
      allSignalsReviewed,
      totalSignals,
      reviewedSignals,
      discountCode,
      discountPercentage,
      billingCycleEnd,
      daysUntilBillingCycleEnd
    };
  }
  // Mark notification as sent
  async markNotificationSent(userId) {
    await storage.updateUserNotificationDate(userId);
  }
  // Get notification badge count
  async getNotificationCount(userId) {
    const pendingData = await this.checkPendingSignalReviews(userId);
    const monthlyData = await this.checkMonthlyCompletion(userId);
    const user = await storage.getUser(userId);
    const hasDiscount = !!user?.pendingDiscountCode;
    return {
      pendingReviews: pendingData.pendingSignals.length,
      hasDiscount,
      discountCode: user?.pendingDiscountCode || void 0,
      discountPercentage: monthlyData.discountPercentage
    };
  }
};
var notificationService = new NotificationService();

// server/services/tradingViewService.ts
import { addDays, subDays } from "date-fns";
import axios from "axios";
var TradingViewService = class {
  baseUrl = "https://economic-calendar.tradingview.com/events";
  cache = /* @__PURE__ */ new Map();
  cacheExpiry = 10 * 60 * 1e3;
  // 10 minutes cache
  // Economic event categories mapping
  categoryKeywords = {
    "Growth": ["gdp", "economic growth", "industrial production", "manufacturing pmi", "services pmi", "composite pmi", "business activity", "production index"],
    "Inflation": ["cpi", "ppi", "inflation", "price index", "core inflation", "pce price", "deflator"],
    "Employment": ["employment", "payroll", "nfp", "jobless", "unemployment", "job", "labor", "wage", "earnings", "ada nonfarm"],
    "Central Bank": ["fomc", "fed", "federal reserve", "interest rate", "rate decision", "monetary policy", "fed chair", "meeting minutes", "beige book"],
    "Bonds": ["treasury", "bond", "yield", "auction", "note sale", "govt bonds"],
    "Housing": ["housing", "home", "building permit", "construction", "mortgage", "house price", "existing home", "new home", "pending home"],
    "Consumer Surveys": ["consumer confidence", "consumer sentiment", "consumer expectations", "michigan sentiment", "cb consumer"],
    "Business Surveys": ["business confidence", "business sentiment", "ism", "purchasing managers", "manufacturing index", "nahb", "business optimism"],
    "Speeches": ["speech", "speaks", "testimony", "comments", "remarks", "press conference", "powell", "yellen"],
    "Misc": []
    // Catch-all for other economic events
  };
  async fetchEconomicCalendar(fromDate, toDate) {
    try {
      const fromISO = fromDate.toISOString();
      const toISO = toDate.toISOString();
      const url = `${this.baseUrl}`;
      const params = {
        from: fromISO,
        to: toISO,
        countries: "US",
        // Only United States
        minImportance: 1
        // Low=0, Medium=1, High=2 (we'll filter to medium/high later)
      };
      console.log(`[TradingView] Fetching economic calendar from ${fromISO} to ${toISO}`);
      const response = await axios.get(url, {
        params,
        headers: {
          "Origin": "https://www.tradingview.com",
          "Referer": "https://www.tradingview.com/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json"
        },
        timeout: 15e3
      });
      if (response.data && response.data.result) {
        console.log(`[TradingView] Fetched ${response.data.result.length} events`);
        return response.data.result;
      }
      console.log("[TradingView] No events found in response");
      return [];
    } catch (error) {
      console.error("[TradingView] Failed to fetch economic calendar:", error.message);
      return [];
    }
  }
  categorizeEvent(title) {
    const lowerTitle = title.toLowerCase();
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (category === "Misc") continue;
      for (const keyword of keywords) {
        if (lowerTitle.includes(keyword)) {
          return category;
        }
      }
    }
    return "Misc";
  }
  mapImpact(impactLevel, title) {
    if (impactLevel !== void 0) {
      if (impactLevel >= 3) return "high";
      if (impactLevel === 2) return "medium";
      if (impactLevel === 1) return "low";
    }
    const lowerTitle = title.toLowerCase();
    const highImpactKeywords = [
      "nfp",
      "non-farm",
      "payroll",
      "unemployment",
      "cpi",
      "inflation",
      "gdp",
      "fomc",
      "interest rate",
      "fed chair",
      "powell",
      "retail sales",
      "ppi",
      "consumer confidence",
      "ism",
      "pmi",
      "housing starts",
      "building permits"
    ];
    const mediumImpactKeywords = [
      "home sales",
      "durable goods",
      "factory orders",
      "trade balance",
      "jobless claims",
      "consumer sentiment",
      "business confidence"
    ];
    if (highImpactKeywords.some((keyword) => lowerTitle.includes(keyword))) {
      return "high";
    }
    if (mediumImpactKeywords.some((keyword) => lowerTitle.includes(keyword))) {
      return "medium";
    }
    return "low";
  }
  parseEvents(events) {
    const parsedEvents = [];
    for (const event of events) {
      try {
        const impact = this.mapImpact(event.impact, event.title);
        if (impact === "low") {
          continue;
        }
        const category = this.categorizeEvent(event.title);
        const isMajorCategory = category !== "Misc" || this.isRelevantMiscEvent(event.title);
        if (!isMajorCategory) {
          continue;
        }
        let eventTime;
        if (typeof event.date === "number") {
          eventTime = event.date > 1e10 ? new Date(event.date) : new Date(event.date * 1e3);
        } else if (typeof event.date === "string") {
          eventTime = new Date(event.date);
        } else {
          continue;
        }
        if (isNaN(eventTime.getTime())) {
          continue;
        }
        parsedEvents.push({
          id: `tv-${event.id}`,
          title: event.title,
          description: `${category}: ${event.title}`,
          currency: "USD",
          impact,
          eventTime,
          actualValue: event.actual || void 0,
          forecastValue: event.forecast || void 0,
          previousValue: event.previous || void 0,
          source: "TradingView",
          sourceUrl: "https://www.tradingview.com/economic-calendar/"
        });
      } catch (error) {
        console.error("[TradingView] Error parsing event:", error);
      }
    }
    return parsedEvents;
  }
  isRelevantMiscEvent(title) {
    const relevantMiscKeywords = [
      "trade balance",
      "retail sales",
      "wholesale",
      "current account",
      "budget",
      "deficit",
      "surplus",
      "import",
      "export",
      "durable goods",
      "factory orders",
      "inventory",
      "crude oil",
      "philadelphia fed",
      "empire state",
      "chicago pmi",
      "kansas city fed",
      "dallas fed",
      "richmond fed"
    ];
    const lowerTitle = title.toLowerCase();
    return relevantMiscKeywords.some((keyword) => lowerTitle.includes(keyword));
  }
  async getUpcomingNews(limit = 10) {
    const cacheKey = "upcoming";
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log("[TradingView] Returning cached upcoming events");
      return cached.data.slice(0, limit);
    }
    try {
      const now = /* @__PURE__ */ new Date();
      const futureDate = addDays(now, 14);
      const events = await this.fetchEconomicCalendar(now, futureDate);
      const parsedEvents = this.parseEvents(events);
      const upcomingEvents = parsedEvents.filter((event) => event.eventTime > now).sort((a, b) => a.eventTime.getTime() - b.eventTime.getTime()).slice(0, limit);
      this.cache.set(cacheKey, { data: upcomingEvents, timestamp: Date.now() });
      console.log(`[TradingView] Returning ${upcomingEvents.length} upcoming events`);
      return upcomingEvents;
    } catch (error) {
      console.error("[TradingView] Error getting upcoming news:", error);
      return [];
    }
  }
  async getRecentNews(limit = 10) {
    const cacheKey = "recent";
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log("[TradingView] Returning cached recent events");
      return cached.data.slice(0, limit);
    }
    try {
      const now = /* @__PURE__ */ new Date();
      const pastDate = subDays(now, 7);
      const events = await this.fetchEconomicCalendar(pastDate, now);
      const parsedEvents = this.parseEvents(events);
      const recentEvents = parsedEvents.filter((event) => event.eventTime <= now).sort((a, b) => b.eventTime.getTime() - a.eventTime.getTime()).slice(0, limit);
      this.cache.set(cacheKey, { data: recentEvents, timestamp: Date.now() });
      console.log(`[TradingView] Returning ${recentEvents.length} recent events`);
      return recentEvents;
    } catch (error) {
      console.error("[TradingView] Error getting recent news:", error);
      return [];
    }
  }
  clearCache() {
    this.cache.clear();
    console.log("[TradingView] Cache cleared");
  }
};
var tradingViewService = new TradingViewService();

// server/services/rateLimitService.ts
var RateLimitService = class {
  sendLimits = /* @__PURE__ */ new Map();
  verifyLimits = /* @__PURE__ */ new Map();
  SEND_WINDOW_MS = 60 * 1e3;
  // 1 minute
  VERIFY_WINDOW_MS = 10 * 60 * 1e3;
  // 10 minutes
  MAX_SEND_ATTEMPTS = 3;
  // 3 sends per minute
  MAX_VERIFY_ATTEMPTS = 5;
  // 5 verify attempts per 10 minutes
  cleanup() {
    const now = Date.now();
    Array.from(this.sendLimits.entries()).forEach(([key, entry]) => {
      if (now > entry.resetTime) {
        this.sendLimits.delete(key);
      }
    });
    Array.from(this.verifyLimits.entries()).forEach(([key, entry]) => {
      if (now > entry.resetTime) {
        this.verifyLimits.delete(key);
      }
    });
  }
  getIdentifier(req, userId) {
    if (userId) {
      return `user:${userId}`;
    }
    return `ip:${req.ip || req.connection.remoteAddress || "unknown"}`;
  }
  checkSendLimit(req, userId) {
    this.cleanup();
    const identifier = this.getIdentifier(req, userId);
    const now = Date.now();
    const entry = this.sendLimits.get(identifier);
    if (!entry) {
      this.sendLimits.set(identifier, {
        count: 1,
        resetTime: now + this.SEND_WINDOW_MS,
        firstAttempt: now
      });
      return { allowed: true, remainingAttempts: this.MAX_SEND_ATTEMPTS - 1 };
    }
    if (now > entry.resetTime) {
      this.sendLimits.set(identifier, {
        count: 1,
        resetTime: now + this.SEND_WINDOW_MS,
        firstAttempt: now
      });
      return { allowed: true, remainingAttempts: this.MAX_SEND_ATTEMPTS - 1 };
    }
    if (entry.count >= this.MAX_SEND_ATTEMPTS) {
      return {
        allowed: false,
        resetTime: entry.resetTime,
        remainingAttempts: 0
      };
    }
    entry.count++;
    return {
      allowed: true,
      remainingAttempts: this.MAX_SEND_ATTEMPTS - entry.count
    };
  }
  checkVerifyLimit(req, userId) {
    this.cleanup();
    const identifier = this.getIdentifier(req, userId);
    const now = Date.now();
    const entry = this.verifyLimits.get(identifier);
    if (!entry) {
      this.verifyLimits.set(identifier, {
        count: 1,
        resetTime: now + this.VERIFY_WINDOW_MS,
        firstAttempt: now
      });
      return { allowed: true, remainingAttempts: this.MAX_VERIFY_ATTEMPTS - 1 };
    }
    if (now > entry.resetTime) {
      this.verifyLimits.set(identifier, {
        count: 1,
        resetTime: now + this.VERIFY_WINDOW_MS,
        firstAttempt: now
      });
      return { allowed: true, remainingAttempts: this.MAX_VERIFY_ATTEMPTS - 1 };
    }
    if (entry.count >= this.MAX_VERIFY_ATTEMPTS) {
      return {
        allowed: false,
        resetTime: entry.resetTime,
        remainingAttempts: 0
      };
    }
    entry.count++;
    return {
      allowed: true,
      remainingAttempts: this.MAX_VERIFY_ATTEMPTS - entry.count
    };
  }
  resetUserLimits(userId) {
    this.sendLimits.delete(`user:${userId}`);
    this.verifyLimits.delete(`user:${userId}`);
  }
  getLimitInfo(req, userId, type = "send") {
    const identifier = this.getIdentifier(req, userId);
    const limitsMap = type === "send" ? this.sendLimits : this.verifyLimits;
    const maxAttempts = type === "send" ? this.MAX_SEND_ATTEMPTS : this.MAX_VERIFY_ATTEMPTS;
    const entry = limitsMap.get(identifier);
    if (!entry) {
      return {
        attempts: 0,
        maxAttempts,
        resetTime: null,
        windowMs: type === "send" ? this.SEND_WINDOW_MS : this.VERIFY_WINDOW_MS
      };
    }
    return {
      attempts: entry.count,
      maxAttempts,
      resetTime: entry.resetTime,
      windowMs: type === "send" ? this.SEND_WINDOW_MS : this.VERIFY_WINDOW_MS
    };
  }
};
var rateLimitService = new RateLimitService();

// server/services/sharingDetectionService.ts
var SharingDetectionService = class {
  MAX_ALLOWED_SESSIONS = 5;
  // Allow up to 5 simultaneous sessions (more lenient for legitimate multi-tab usage)
  SESSION_TIMEOUT_HOURS = 24;
  // Consider sessions inactive after 24 hours
  DEVICE_SIMILARITY_THRESHOLD = 0.7;
  // Device fingerprints similarity threshold
  SIMULTANEOUS_WINDOW_MINUTES = 5;
  // Consider sessions simultaneous if within 5 minutes
  async detectSharing(userId, currentDeviceId, storage2) {
    try {
      const recentSessions = await this.getRecentUserSessions(userId, storage2);
      const activeSessions = this.filterActiveSessions(recentSessions);
      const deviceAnalysis = this.analyzeDevicePatterns(activeSessions, currentDeviceId);
      const simultaneousAnalysis = this.analyzeSimultaneousAccess(activeSessions);
      const confidence = this.calculateSharingConfidence(deviceAnalysis, simultaneousAnalysis, activeSessions.length);
      return {
        isSharing: confidence > 0.8 || activeSessions.length > this.MAX_ALLOWED_SESSIONS,
        reason: this.generateSharingReason(deviceAnalysis, simultaneousAnalysis, activeSessions.length),
        confidence,
        activeSessions: activeSessions.length,
        suspiciousDevices: deviceAnalysis.suspiciousDevices
      };
    } catch (error) {
      console.error("Error detecting sharing:", error);
      return {
        isSharing: false,
        reason: "Error analyzing sessions",
        confidence: 0,
        activeSessions: 0,
        suspiciousDevices: []
      };
    }
  }
  async getRecentUserSessions(userId, storage2) {
    const cutoffTime = new Date(Date.now() - this.SESSION_TIMEOUT_HOURS * 60 * 60 * 1e3);
    const sessions2 = await storage2.getUserSessions(userId, cutoffTime);
    return sessions2 || [];
  }
  filterActiveSessions(sessions2) {
    const now = /* @__PURE__ */ new Date();
    const activeThreshold = new Date(now.getTime() - this.SESSION_TIMEOUT_HOURS * 60 * 60 * 1e3);
    return sessions2.filter(
      (session3) => new Date(session3.lastActive) > activeThreshold
    );
  }
  analyzeDevicePatterns(sessions2, currentDeviceId) {
    const uniqueDevices = new Set(sessions2.map((s) => s.deviceId));
    const uniqueIPs = new Set(sessions2.map((s) => s.ipAddress));
    const userAgents = sessions2.map((s) => s.userAgent);
    const suspiciousDevices = [];
    const deviceGroups = this.groupSimilarDevices(sessions2);
    for (const group of deviceGroups) {
      if (group.length > 1 && group.some((s) => s.deviceId !== currentDeviceId)) {
        suspiciousDevices.push(...group.map((s) => s.deviceId));
      }
    }
    return {
      uniqueDeviceCount: uniqueDevices.size,
      uniqueIPCount: uniqueIPs.size,
      userAgentVariations: this.analyzeUserAgentVariations(userAgents),
      suspiciousDevices,
      hasCurrentDevice: uniqueDevices.has(currentDeviceId)
    };
  }
  groupSimilarDevices(sessions2) {
    const groups = [];
    const processed = /* @__PURE__ */ new Set();
    for (const session3 of sessions2) {
      if (processed.has(session3.deviceId)) continue;
      const similarSessions = [session3];
      processed.add(session3.deviceId);
      for (const otherSession of sessions2) {
        if (otherSession.deviceId === session3.deviceId || processed.has(otherSession.deviceId)) {
          continue;
        }
        const similarity = this.calculateDeviceSimilarity(session3, otherSession);
        if (similarity > this.DEVICE_SIMILARITY_THRESHOLD) {
          similarSessions.push(otherSession);
          processed.add(otherSession.deviceId);
        }
      }
      groups.push(similarSessions);
    }
    return groups;
  }
  calculateDeviceSimilarity(session1, session22) {
    let score = 0;
    let factors = 0;
    if (session1.userAgent === session22.userAgent) {
      score += 0.4;
    } else if (this.areSimilarUserAgents(session1.userAgent, session22.userAgent)) {
      score += 0.2;
    }
    factors++;
    if (session1.ipAddress === session22.ipAddress) {
      score += 0.3;
    } else if (this.areSimilarIPs(session1.ipAddress, session22.ipAddress)) {
      score += 0.1;
    }
    factors++;
    if (session1.deviceFingerprint && session22.deviceFingerprint) {
      const fingerprintSimilarity = this.compareDeviceFingerprints(
        session1.deviceFingerprint,
        session22.deviceFingerprint
      );
      score += fingerprintSimilarity * 0.3;
      factors++;
    }
    return score / factors;
  }
  areSimilarUserAgents(ua1, ua2) {
    const extractFeatures = (ua) => {
      const browser = ua.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/)?.[0] || "";
      const os = ua.match(/(Windows|Mac|Linux|Android|iOS)/)?.[0] || "";
      return { browser, os };
    };
    const features1 = extractFeatures(ua1);
    const features2 = extractFeatures(ua2);
    return features1.browser === features2.browser && features1.os === features2.os;
  }
  areSimilarIPs(ip1, ip2) {
    const parts1 = ip1.split(".");
    const parts2 = ip2.split(".");
    if (parts1.length === 4 && parts2.length === 4) {
      return parts1.slice(0, 3).join(".") === parts2.slice(0, 3).join(".");
    }
    return false;
  }
  compareDeviceFingerprints(fp1, fp2) {
    if (!fp1 || !fp2) return 0;
    let matches = 0;
    let total = 0;
    const compareFields = [
      "browser",
      "os",
      "screenResolution",
      "timezone",
      "language",
      "platform",
      "canvasFingerprint",
      "webglFingerprint",
      "hardwareConcurrency"
    ];
    for (const field of compareFields) {
      if (fp1[field] && fp2[field]) {
        total++;
        if (fp1[field] === fp2[field]) {
          matches++;
        }
      }
    }
    return total > 0 ? matches / total : 0;
  }
  analyzeUserAgentVariations(userAgents) {
    const uniqueUAs = new Set(userAgents);
    const browsers = /* @__PURE__ */ new Set();
    const operatingSystems = /* @__PURE__ */ new Set();
    for (const ua of userAgents) {
      const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge)/);
      if (browserMatch) browsers.add(browserMatch[1]);
      const osMatch = ua.match(/(Windows|Mac|Linux|Android|iOS)/);
      if (osMatch) operatingSystems.add(osMatch[1]);
    }
    return {
      uniqueUserAgents: uniqueUAs.size,
      uniqueBrowsers: browsers.size,
      uniqueOperatingSystems: operatingSystems.size
    };
  }
  analyzeSimultaneousAccess(sessions2) {
    const timeWindows = /* @__PURE__ */ new Map();
    for (const session3 of sessions2) {
      const windowKey = this.getTimeWindowKey(session3.lastActive, 5);
      if (!timeWindows.has(windowKey)) {
        timeWindows.set(windowKey, []);
      }
      timeWindows.get(windowKey).push(session3);
    }
    let simultaneousWindowsCount = 0;
    let maxSimultaneousSessions = 0;
    Array.from(timeWindows.entries()).forEach(([window, windowSessions]) => {
      const uniqueDevices = new Set(windowSessions.map((s) => s.deviceId));
      const uniqueIPs = new Set(windowSessions.map((s) => s.ipAddress));
      if (uniqueDevices.size > 1 || uniqueIPs.size > 1) {
        simultaneousWindowsCount++;
        maxSimultaneousSessions = Math.max(maxSimultaneousSessions, windowSessions.length);
      }
    });
    return {
      simultaneousWindowsCount,
      maxSimultaneousSessions,
      totalTimeWindows: timeWindows.size
    };
  }
  getTimeWindowKey(date, intervalMinutes) {
    const time = new Date(date);
    const minutes = Math.floor(time.getMinutes() / intervalMinutes) * intervalMinutes;
    time.setMinutes(minutes, 0, 0);
    return time.toISOString();
  }
  calculateSharingConfidence(deviceAnalysis, simultaneousAnalysis, sessionCount) {
    let confidence = 0;
    if (deviceAnalysis.uniqueDeviceCount > 2) {
      confidence += 0.3;
    }
    if (deviceAnalysis.uniqueIPCount > 2) {
      confidence += 0.2;
    }
    if (simultaneousAnalysis.simultaneousWindowsCount > 0) {
      confidence += 0.4;
    }
    if (sessionCount > this.MAX_ALLOWED_SESSIONS) {
      confidence += 0.5;
    }
    if (deviceAnalysis.userAgentVariations.uniqueBrowsers > 2) {
      confidence += 0.2;
    }
    if (deviceAnalysis.userAgentVariations.uniqueOperatingSystems > 2) {
      confidence += 0.3;
    }
    if (deviceAnalysis.suspiciousDevices.length > 0) {
      confidence += 0.6;
    }
    return Math.min(confidence, 1);
  }
  generateSharingReason(deviceAnalysis, simultaneousAnalysis, sessionCount) {
    const reasons = [];
    if (sessionCount > this.MAX_ALLOWED_SESSIONS) {
      reasons.push(`Too many active sessions (${sessionCount}/${this.MAX_ALLOWED_SESSIONS})`);
    }
    if (deviceAnalysis.uniqueDeviceCount > 2) {
      reasons.push(`Multiple devices detected (${deviceAnalysis.uniqueDeviceCount})`);
    }
    if (deviceAnalysis.uniqueIPCount > 2) {
      reasons.push(`Multiple IP addresses (${deviceAnalysis.uniqueIPCount})`);
    }
    if (simultaneousAnalysis.simultaneousWindowsCount > 0) {
      reasons.push("Simultaneous access from different locations");
    }
    if (deviceAnalysis.suspiciousDevices.length > 0) {
      reasons.push("Similar device fingerprints detected");
    }
    if (deviceAnalysis.userAgentVariations.uniqueBrowsers > 2) {
      reasons.push(`Multiple browsers (${deviceAnalysis.userAgentVariations.uniqueBrowsers})`);
    }
    return reasons.length > 0 ? reasons.join(", ") : "Unusual access patterns detected";
  }
  // SPECIFIC ABUSE DETECTION METHODS
  // Detect if same account is logged in on different computers simultaneously (within 5 minutes)
  async detectSimultaneousMultipleComputers(userId, currentDeviceId, storage2) {
    try {
      const now = /* @__PURE__ */ new Date();
      const recentCutoff = new Date(now.getTime() - this.SIMULTANEOUS_WINDOW_MINUTES * 60 * 1e3);
      const recentSessions = await storage2.getUserSessions(userId, recentCutoff);
      if (!recentSessions || recentSessions.length <= 1) {
        return { isSimultaneous: false, deviceCount: 0, devices: [] };
      }
      const uniqueDevices = new Set(recentSessions.map((s) => s.deviceId));
      const deviceList = Array.from(uniqueDevices);
      const isSimultaneous = uniqueDevices.size > 1;
      if (isSimultaneous) {
        console.log(`[SIMULTANEOUS-DETECTION] User ${userId} has ${uniqueDevices.size} different devices active within ${this.SIMULTANEOUS_WINDOW_MINUTES} minutes`);
      }
      return {
        isSimultaneous,
        deviceCount: uniqueDevices.size,
        devices: deviceList
      };
    } catch (error) {
      console.error("Error detecting simultaneous computers:", error);
      return { isSimultaneous: false, deviceCount: 0, devices: [] };
    }
  }
  // Detect if same device has multiple free accounts open simultaneously
  async detectMultipleFreeAccountsOnDevice(currentDeviceId, storage2) {
    try {
      const now = /* @__PURE__ */ new Date();
      const recentCutoff = new Date(now.getTime() - this.SIMULTANEOUS_WINDOW_MINUTES * 60 * 1e3);
      const deviceSessions = await storage2.getDeviceSessions(currentDeviceId, recentCutoff);
      if (!deviceSessions || deviceSessions.length <= 1) {
        return { hasMultipleFreeAccounts: false, freeAccountCount: 0, userIds: [] };
      }
      const uniqueUserIds = [...new Set(deviceSessions.map((s) => s.userId))];
      const freeUsers = [];
      for (const userId of uniqueUserIds) {
        const user = await storage2.getUser(userId);
        if (user && user.subscriptionTier === "free") {
          freeUsers.push(userId);
        }
      }
      const hasMultiple = freeUsers.length > 1;
      if (hasMultiple) {
        console.log(`[MULTI-FREE-ACCOUNT-DETECTION] Device ${currentDeviceId} has ${freeUsers.length} free accounts active within ${this.SIMULTANEOUS_WINDOW_MINUTES} minutes`);
      }
      return {
        hasMultipleFreeAccounts: hasMultiple,
        freeAccountCount: freeUsers.length,
        userIds: freeUsers
      };
    } catch (error) {
      console.error("Error detecting multiple free accounts:", error);
      return { hasMultipleFreeAccounts: false, freeAccountCount: 0, userIds: [] };
    }
  }
  // Policy enforcement methods - TARGETED BLOCKING
  async enforcePolicy(userId, currentDeviceId, detectionResult, storage2) {
    const user = await storage2.getUser(userId);
    if (!user) {
      return { action: "allow", message: "User not found", blocked: false };
    }
    const simultaneousCheck = await this.detectSimultaneousMultipleComputers(userId, currentDeviceId, storage2);
    const isPaidUser = user.subscriptionTier === "starter_trader" || user.subscriptionTier === "pro_trader";
    const deviceThreshold = isPaidUser ? 3 : 5;
    if (simultaneousCheck.isSimultaneous && simultaneousCheck.deviceCount > deviceThreshold) {
      console.log(`[ABUSE-BLOCKED] User ${userId} (${user.subscriptionTier}) has simultaneous sessions on ${simultaneousCheck.deviceCount} different devices (threshold: ${deviceThreshold}). Blocking access.`);
      await storage2.terminateAllUserSessions(userId);
      await storage2.logSuspiciousActivity(userId, "simultaneous_multi_device_blocked", {
        deviceCount: simultaneousCheck.deviceCount,
        devices: simultaneousCheck.devices,
        subscriptionTier: user.subscriptionTier,
        action: "all_sessions_terminated"
      });
      if (user.email) {
        await verificationService.sendAccountBlockedEmail(
          user.email,
          user.firstName || "User",
          "Your account was detected being used on multiple devices simultaneously. This is not allowed per our terms of service."
        );
      }
      return {
        action: "terminate",
        message: "Your account is being used on multiple devices simultaneously. All sessions have been terminated for security. Please check your email for details and log in again using only one device at a time. If you believe this was an error, please contact support@nextradinglabs.com",
        blocked: true,
        sessionsTerminated: simultaneousCheck.deviceCount
      };
    }
    const multipleFreeCheck = await this.detectMultipleFreeAccountsOnDevice(currentDeviceId, storage2);
    if (multipleFreeCheck.hasMultipleFreeAccounts && multipleFreeCheck.freeAccountCount > 1) {
      console.log(`[ABUSE-BLOCKED] Device ${currentDeviceId} has ${multipleFreeCheck.freeAccountCount} free accounts active. Blocking access.`);
      const user2 = await storage2.getUser(userId);
      await storage2.logSuspiciousActivity(userId, "multiple_free_accounts_blocked", {
        deviceId: currentDeviceId,
        freeAccountCount: multipleFreeCheck.freeAccountCount,
        userIds: multipleFreeCheck.userIds,
        action: "access_blocked"
      });
      if (user2 && user2.email) {
        await verificationService.sendAccountBlockedEmail(
          user2.email,
          user2.firstName || "User",
          "Multiple free accounts were detected on your device. Our platform allows only one free account per device, or you can upgrade to a paid plan for multi-device access."
        );
      }
      return {
        action: "restrict",
        message: "Multiple free accounts detected on this device. Please check your email for details. You can upgrade to a paid plan or use only one free account at a time. If you believe this was an error, please contact support@nextradinglabs.com",
        blocked: true
      };
    }
    if (detectionResult.isSharing) {
      await storage2.logSuspiciousActivity(userId, "sharing_detected_allowed", {
        confidence: detectionResult.confidence,
        reason: detectionResult.reason,
        activeSessions: detectionResult.activeSessions,
        enforcement: "monitoring_only"
      });
      console.log(`[SHARING-DETECTED] General sharing patterns for user ${userId} (confidence: ${detectionResult.confidence}). No specific abuse - allowing access.`);
    }
    return { action: "allow", message: "Access allowed", blocked: false };
  }
  // Enhanced detection with immediate enforcement
  async detectAndEnforce(userId, currentDeviceId, ipAddress, userAgent, storage2) {
    try {
      await storage2.updateSessionActivity(userId, currentDeviceId, ipAddress, userAgent);
      const detectionResult = await this.detectSharing(userId, currentDeviceId, storage2);
      const enforcement = await this.enforcePolicy(userId, currentDeviceId, detectionResult, storage2);
      detectionResult.enforcement = {
        action: enforcement.action,
        sessionsTerminated: enforcement.sessionsTerminated,
        blocked: enforcement.blocked
      };
      return detectionResult;
    } catch (error) {
      console.error("Error in detectAndEnforce:", error);
      return {
        isSharing: false,
        reason: "Error during enforcement",
        confidence: 0,
        activeSessions: 0,
        suspiciousDevices: []
      };
    }
  }
  // Quick check for blocking requests
  async shouldBlockRequest(userId, currentDeviceId, storage2) {
    try {
      const detectionResult = await this.detectSharing(userId, currentDeviceId, storage2);
      return detectionResult.confidence >= 0.8;
    } catch (error) {
      console.error("Error in shouldBlockRequest:", error);
      return false;
    }
  }
};
var sharingDetectionService = new SharingDetectionService();

// server/services/authService.ts
import bcrypt from "bcryptjs";
var AuthService = class _AuthService {
  static instance;
  constructor() {
  }
  static getInstance() {
    if (!_AuthService.instance) {
      _AuthService.instance = new _AuthService();
    }
    return _AuthService.instance;
  }
  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password) {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
  /**
   * Verify a password against a hash
   */
  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
  /**
   * Register a new user with email and password
   */
  async register(email, password, firstName, lastName) {
    try {
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return { success: false, error: "User with this email already exists" };
      }
      const hashedPassword = await this.hashPassword(password);
      const user = await storage.upsertUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        emailVerified: false,
        subscriptionTier: "free",
        isActive: true
      });
      return { success: true, user };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Registration failed. Please try again." };
    }
  }
  /**
   * Login user with email and password
   */
  async login(email, password) {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        await this.recordFailedLoginAttempt(email);
        return { success: false, error: "Invalid email or password" };
      }
      if (user.accountLocked) {
        return { success: false, error: "Account is locked. Please contact support." };
      }
      if (!user.isActive) {
        return { success: false, error: "Account is disabled. Please contact support." };
      }
      if (!user.password || !await this.verifyPassword(password, user.password)) {
        await this.recordFailedLoginAttempt(email, user.id);
        return { success: false, error: "Invalid email or password" };
      }
      await this.resetLoginAttempts(user.id);
      return { success: true, user };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed. Please try again." };
    }
  }
  /**
   * Record failed login attempt and lock account if necessary
   */
  async recordFailedLoginAttempt(email, userId) {
    if (!userId) return;
    const user = await storage.getUser(userId);
    if (!user) return;
    const attempts = (user.loginAttempts || 0) + 1;
    const shouldLock = attempts >= 5;
    await storage.updateUserLoginAttempts(userId, attempts, shouldLock);
    if (shouldLock) {
      console.log(`Account locked for user ${userId} after ${attempts} failed attempts`);
    }
  }
  /**
   * Reset login attempts counter
   */
  async resetLoginAttempts(userId) {
    await storage.updateUserLoginAttempts(userId, 0, false);
  }
  /**
   * Validate password strength
   */
  validatePassword(password) {
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    return { valid: errors.length === 0, errors };
  }
  /**
   * Validate email format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: "Please enter a valid email address" };
    }
    return { valid: true };
  }
  /**
   * Create a default admin user if none exists
   */
  async createDefaultAdmin() {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminEmail || !adminPassword) {
        console.log("ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping admin creation.");
        return;
      }
      const existingAdmin = await storage.getUserByEmail(adminEmail);
      if (existingAdmin) {
        if (existingAdmin.subscriptionTier !== "admin" || !existingAdmin.emailVerified || !existingAdmin.onboardingCompleted) {
          await storage.upsertUser({
            ...existingAdmin,
            subscriptionTier: "admin",
            emailVerified: true,
            onboardingCompleted: true,
            maxDailyCredits: 999999,
            maxMonthlyCredits: 999999
          });
          console.log(`Updated existing user ${adminEmail} to admin role with full access`);
        }
        return;
      }
      const hashedPassword = await this.hashPassword(adminPassword);
      await storage.upsertUser({
        email: adminEmail,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        subscriptionTier: "admin",
        emailVerified: true,
        onboardingCompleted: true,
        isActive: true,
        maxDailyCredits: 999999,
        maxMonthlyCredits: 999999
      });
      console.log(`Created admin user: ${adminEmail}`);
    } catch (error) {
      console.error("Error creating admin user:", error);
    }
  }
};
var authService = AuthService.getInstance();

// server/services/passwordResetService.ts
import crypto2 from "crypto";
import bcrypt2 from "bcryptjs";
import { eq as eq2, and as and2, gt, lt } from "drizzle-orm";
import { TransactionalEmailsApi as TransactionalEmailsApi2, TransactionalEmailsApiApiKeys as TransactionalEmailsApiApiKeys2 } from "@getbrevo/brevo";
var PasswordResetService = class {
  TOKEN_EXPIRY_HOURS = 1;
  // Reset tokens expire in 1 hour
  MAX_REQUESTS_PER_HOUR = 3;
  // Prevent abuse
  brevoClient = null;
  constructor() {
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      this.brevoClient = new TransactionalEmailsApi2();
      this.brevoClient.setApiKey(TransactionalEmailsApiApiKeys2.apiKey, apiKey);
    }
  }
  /**
   * Generate a secure random token
   */
  generateToken() {
    return crypto2.randomBytes(32).toString("hex");
  }
  /**
   * Hash a token for secure storage
   */
  hashToken(token) {
    return crypto2.createHash("sha256").update(token).digest("hex");
  }
  /**
   * Check if user has exceeded reset request rate limit
   */
  async checkRateLimit(userId) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1e3);
    const recentRequests = await db.select().from(passwordResetTokens).where(
      and2(
        eq2(passwordResetTokens.userId, userId),
        gt(passwordResetTokens.createdAt, oneHourAgo)
      )
    );
    return recentRequests.length >= this.MAX_REQUESTS_PER_HOUR;
  }
  /**
   * Send password reset email via Brevo
   */
  async sendResetEmail(email, resetToken) {
    if (!this.brevoClient) {
      console.warn("Brevo client not initialized. Skipping email send.");
      console.log(`[DEV MODE] Password reset token for ${email}: ${resetToken}`);
      return;
    }
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5000";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    const emailData = {
      to: [{ email }],
      subject: "Reset Your Password - Next Trading Labs",
      sender: {
        email: "support@nextradinglabs.com",
        name: "Next Trading Labs"
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
                \u26A0\uFE0F Security Notice
              </p>
              <p style="margin: 8px 0 0; color: #e4e4e7; font-size: 14px; line-height: 1.6;">
                This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #09090b; padding: 24px; text-align: center; border-top: 1px solid #27272a;">
            <p style="margin: 0; color: #71717a; font-size: 12px;">
              \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Next Trading Labs. All rights reserved.
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
      console.error("Error sending password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }
  /**
   * Request a password reset
   */
  async requestPasswordReset(email, ipAddress) {
    try {
      const [user] = await db.select().from(users).where(eq2(users.email, email)).limit(1);
      if (!user) {
        console.log(`Password reset requested for non-existent email: ${email}`);
        return {
          success: true,
          message: "If an account exists with this email, you will receive a password reset link."
        };
      }
      if (!user.password) {
        console.log(`Password reset requested for user without password: ${email}`);
        return {
          success: true,
          message: "If an account exists with this email, you will receive a password reset link."
        };
      }
      const rateLimited = await this.checkRateLimit(user.id);
      if (rateLimited) {
        console.warn(`Rate limit exceeded for password reset: ${email}`);
        return {
          success: false,
          message: "Too many reset requests. Please try again later."
        };
      }
      const resetToken = this.generateToken();
      const hashedToken = this.hashToken(resetToken);
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1e3);
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token: hashedToken,
        expiresAt,
        ipAddress,
        used: false
      });
      await this.sendResetEmail(email, resetToken);
      return {
        success: true,
        message: "If an account exists with this email, you will receive a password reset link."
      };
    } catch (error) {
      console.error("Error requesting password reset:", error);
      throw new Error("Failed to process password reset request");
    }
  }
  /**
   * Validate a reset token
   */
  async validateResetToken(token) {
    try {
      const hashedToken = this.hashToken(token);
      const [resetToken] = await db.select().from(passwordResetTokens).where(
        and2(
          eq2(passwordResetTokens.token, hashedToken),
          eq2(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date())
        )
      ).limit(1);
      if (!resetToken) {
        return {
          valid: false,
          message: "Invalid or expired reset token"
        };
      }
      return {
        valid: true,
        userId: resetToken.userId
      };
    } catch (error) {
      console.error("Error validating reset token:", error);
      return {
        valid: false,
        message: "Failed to validate reset token"
      };
    }
  }
  /**
   * Reset password using a valid token
   */
  async resetPassword(token, newPassword) {
    try {
      const validation = await this.validateResetToken(token);
      if (!validation.valid || !validation.userId) {
        return {
          success: false,
          message: validation.message || "Invalid or expired reset token"
        };
      }
      const hashedPassword = await bcrypt2.hash(newPassword, 10);
      await db.update(users).set({
        password: hashedPassword,
        accountLocked: false,
        // Unlock account if it was locked
        loginAttempts: 0
        // Reset login attempts
      }).where(eq2(users.id, validation.userId));
      const hashedToken = this.hashToken(token);
      await db.update(passwordResetTokens).set({ used: true }).where(eq2(passwordResetTokens.token, hashedToken));
      console.log(`Password successfully reset for user: ${validation.userId}`);
      return {
        success: true,
        message: "Password successfully reset"
      };
    } catch (error) {
      console.error("Error resetting password:", error);
      throw new Error("Failed to reset password");
    }
  }
  /**
   * Clean up expired tokens (can be run periodically)
   */
  async cleanupExpiredTokens() {
    try {
      const result = await db.delete(passwordResetTokens).where(lt(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date()));
      console.log(`Cleaned up expired password reset tokens`);
      return 0;
    } catch (error) {
      console.error("Error cleaning up expired tokens:", error);
      return 0;
    }
  }
};
var passwordResetService = new PasswordResetService();

// server/utils/userSanitizer.ts
function sanitizeUser(user) {
  if (!user) return null;
  const {
    password,
    emailVerificationToken,
    phoneVerificationToken,
    verificationTokenExpiry,
    ...safeUser
  } = user;
  return safeUser;
}

// server/routes.ts
import { z } from "zod";
var isAuthenticated = async (req, res, next) => {
  try {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: "Account is disabled" });
    }
    if (user.accountLocked) {
      return res.status(401).json({ message: "Account is locked" });
    }
    req.user = {
      claims: { sub: user.id },
      normalizedUser: user
    };
    const skipVerificationPaths = [
      "/api/auth/user",
      "/api/auth/send-email-verification",
      "/api/auth/send-phone-verification",
      "/api/auth/verify-email",
      "/api/auth/verify-phone",
      "/api/onboarding/select-plan",
      "/api/onboarding/save-responses"
    ];
    if (!skipVerificationPaths.some((path4) => req.path.includes(path4))) {
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
var sharingDetectionMiddleware = async (req, res, next) => {
  try {
    const skipPaths = [
      "/api/security/sharing-check",
      "/api/auth/logout",
      "/api/auth/send-email-verification",
      "/api/auth/send-phone-verification",
      "/api/auth/verify-email",
      "/api/auth/verify-phone",
      "/api/onboarding/"
      // Skip all onboarding routes
    ];
    if (skipPaths.some((path4) => req.path.includes(path4))) {
      return next();
    }
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return next();
    }
    const user = await storage.getUser(userId);
    if (user && (!user.emailVerified || !user.onboardingCompleted || user.subscriptionTier === "admin")) {
      return next();
    }
    const deviceId = req.headers["x-device-id"] || "unknown";
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "";
    const detectionResult = await sharingDetectionService.detectAndEnforce(
      userId,
      deviceId,
      ipAddress,
      userAgent,
      storage
    );
    if (detectionResult.enforcement?.blocked) {
      console.log(`[SHARING-BLOCK] Blocking request for user ${userId} due to sharing detection`);
      return res.status(403).json({
        message: "Access denied due to account sharing policy violation.",
        reason: detectionResult.reason,
        confidence: detectionResult.confidence,
        enforcement: detectionResult.enforcement
      });
    }
    req.sharingDetection = detectionResult;
    next();
  } catch (error) {
    console.error("Error in sharing detection middleware:", error);
    next();
  }
};
var generateSignalRequestSchema = z.object({
  timeframe: z.enum(["5M", "15M", "30M", "1H", "4H", "1D", "1W"])
});
var verificationTokenSchema = z.object({
  token: z.string().length(6, "Verification code must be 6 digits").regex(/^\d{6}$/, "Verification code must contain only digits")
});
function applyLifecycleStatus(signals) {
  return signals.map((signal) => {
    const currentStatus = getSignalStatus(signal.createdAt, signal.timeframe);
    return {
      ...signal,
      status: currentStatus
    };
  });
}
async function registerRoutes(app2) {
  try {
    await setupAuth(app2);
  } catch (error) {
    console.log("Replit auth setup failed, using independent auth only:", error);
  }
  const unifyUserIdentity = async (req, res, next) => {
    try {
      let userId;
      let user;
      if (req.session?.user) {
        user = req.session.user;
        userId = user.id;
      } else if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
        if (userId) {
          user = await storage.getUser(userId);
        }
      }
      if (!userId || !user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }
      if (user.accountLocked) {
        return res.status(401).json({ message: "Account is locked" });
      }
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
  app2.get("/api/auth/user", unifyUserIdentity, sharingDetectionMiddleware, async (req, res) => {
    try {
      let user = req.user.normalizedUser;
      const userId = user.id;
      const currentTime = /* @__PURE__ */ new Date();
      const casablancaTime = new Date(currentTime.toLocaleString("en-US", { timeZone: "Africa/Casablanca" }));
      const lastReset = new Date(user.lastCreditReset || 0);
      const lastResetCasablanca = new Date(lastReset.toLocaleString("en-US", { timeZone: "Africa/Casablanca" }));
      const needsReset = casablancaTime.getDate() !== lastResetCasablanca.getDate() || casablancaTime.getMonth() !== lastResetCasablanca.getMonth() || casablancaTime.getFullYear() !== lastResetCasablanca.getFullYear();
      if (needsReset) {
        console.log(`[AUTH] Daily reset needed for user ${userId}`);
        await storage.resetDailyCredits(userId);
        user = await storage.getUser(userId);
        console.log(`[AUTH] Daily credits reset for user ${userId}, new daily credits: ${user?.dailyCredits}`);
      }
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.put("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, alias } = req.body;
      if (!firstName || typeof firstName !== "string") {
        return res.status(400).json({ message: "First name is required" });
      }
      await storage.updateUser(userId, {
        firstName: firstName.trim(),
        lastName: lastName?.trim() || null,
        alias: alias?.trim() || null
      });
      const updatedUser = await storage.getUser(userId);
      res.json({ success: true, user: sanitizeUser(updatedUser) });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.patch("/api/user/avatar", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { profileImageUrl } = req.body;
      if (!profileImageUrl || typeof profileImageUrl !== "string") {
        return res.status(400).json({ message: "Avatar ID is required" });
      }
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
  app2.put("/api/user/plan", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { plan } = req.body;
      const validPlans = ["free", "starter_trader", "pro_trader"];
      if (!plan || !validPlans.includes(plan)) {
        return res.status(400).json({ message: "Invalid plan selected" });
      }
      const planLimits = {
        free: { maxDaily: 2, maxMonthly: 10 },
        starter_trader: { maxDaily: 10, maxMonthly: 60 },
        pro_trader: { maxDaily: 999999, maxMonthly: 999999 }
        // Effectively unlimited
      };
      const limits = planLimits[plan];
      await storage.updateUser(userId, {
        subscriptionTier: plan,
        maxDailyCredits: limits.maxDaily,
        maxMonthlyCredits: limits.maxMonthly
      });
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
  app2.post("/api/auth/send-email-verification", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const rateLimit = rateLimitService.checkSendLimit(req, userId);
      if (!rateLimit.allowed) {
        const resetInMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / (1e3 * 60));
        return res.status(429).json({
          message: `Too many verification requests. Please try again in ${resetInMinutes} minute${resetInMinutes !== 1 ? "s" : ""}.`,
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
      const token = verificationService.generateOTP();
      const expiresAt = verificationService.getExpiryTime();
      const emailResult = await verificationService.sendEmailVerification({
        to: user.email,
        firstName: user.firstName || void 0,
        token
      });
      if (!emailResult.success) {
        return res.status(500).json({ message: emailResult.error || "Failed to send verification email" });
      }
      await storage.setEmailVerificationToken(userId, token, expiresAt);
      const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "";
      await storage.logUserSession(userId, ipAddress, userAgent);
      res.json({
        success: true,
        message: "Verification code sent to your email",
        expiresIn: 10
        // minutes
      });
    } catch (error) {
      console.error("Error sending email verification:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });
  app2.post("/api/auth/send-phone-verification", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const rateLimit = rateLimitService.checkSendLimit(req, userId);
      if (!rateLimit.allowed) {
        const resetInMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / (1e3 * 60));
        return res.status(429).json({
          message: `Too many verification requests. Please try again in ${resetInMinutes} minute${resetInMinutes !== 1 ? "s" : ""}.`,
          resetTime: rateLimit.resetTime,
          remainingAttempts: 0
        });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const phoneNumber = req.body.phoneNumber || user.phoneNumber;
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }
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
      const token = verificationService.generateOTP();
      const expiresAt = verificationService.getExpiryTime();
      const smsResult = await verificationService.sendSMSVerification({
        phoneNumber,
        token
      });
      if (!smsResult.success) {
        return res.status(500).json({ message: smsResult.error || "Failed to send verification SMS" });
      }
      await storage.setPhoneVerificationToken(userId, token, expiresAt);
      const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "";
      await storage.logUserSession(userId, ipAddress, userAgent);
      res.json({
        success: true,
        message: "Verification code sent to your phone",
        expiresIn: 10
        // minutes
      });
    } catch (error) {
      console.error("Error sending phone verification:", error);
      res.status(500).json({ message: "Failed to send verification SMS" });
    }
  });
  app2.post("/api/auth/verify-email", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const rateLimit = rateLimitService.checkVerifyLimit(req, userId);
      if (!rateLimit.allowed) {
        const resetInMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / (1e3 * 60));
        return res.status(429).json({
          message: `Too many verification attempts. Please try again in ${resetInMinutes} minute${resetInMinutes !== 1 ? "s" : ""}.`,
          resetTime: rateLimit.resetTime,
          remainingAttempts: 0
        });
      }
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
      await storage.markEmailVerified(userId);
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
        req.session.user = userWithoutPassword;
        await new Promise((resolve, reject) => {
          req.session.save((err) => {
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
  app2.post("/api/auth/verify-phone", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const rateLimit = rateLimitService.checkVerifyLimit(req, userId);
      if (!rateLimit.allowed) {
        const resetInMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / (1e3 * 60));
        return res.status(429).json({
          message: `Too many verification attempts. Please try again in ${resetInMinutes} minute${resetInMinutes !== 1 ? "s" : ""}.`,
          resetTime: rateLimit.resetTime,
          remainingAttempts: 0
        });
      }
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
  const registrationSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required")
  });
  const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required")
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const validation = registrationSchema.safeParse(req.body);
      if (!validation.success) {
        const errorMessages = validation.error.errors.map((err) => {
          const field = err.path.join(".");
          return `${field}: ${err.message}`;
        });
        return res.status(400).json({
          message: errorMessages.join(", "),
          errors: validation.error.errors
        });
      }
      const { email, password, firstName, lastName } = validation.data;
      const passwordValidation = authService.validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          message: passwordValidation.errors.join(". "),
          errors: passwordValidation.errors
        });
      }
      const result = await authService.register(email, password, firstName, lastName);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      const { password: _, ...userWithoutPassword } = result.user;
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Session error" });
        }
        req.session.user = userWithoutPassword;
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ message: "Session error" });
          }
          res.json({
            success: true,
            message: "Registration successful",
            user: sanitizeUser(result.user)
          });
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });
  app2.post("/api/onboarding/select-plan", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { selectedPlan } = req.body;
      if (!selectedPlan || !["free", "starter", "pro"].includes(selectedPlan)) {
        return res.status(400).json({ message: "Invalid plan selection" });
      }
      const planLimits = {
        free: { maxDaily: 2, maxMonthly: 10 },
        starter: { maxDaily: 10, maxMonthly: 60 },
        pro: { maxDaily: 999999, maxMonthly: 999999 }
        // Effectively unlimited
      };
      const limits = planLimits[selectedPlan];
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
        req.session.user = userWithoutPassword;
        await new Promise((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      res.json({
        success: true,
        message: "Plan selected successfully"
      });
    } catch (error) {
      console.error("Error saving plan selection:", error);
      res.status(500).json({ message: "Failed to save plan selection" });
    }
  });
  app2.post("/api/onboarding/save-responses", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { heardFrom, tradingExperience, tradingGoals, currentOccupation } = req.body;
      if (!heardFrom || !tradingExperience) {
        return res.status(400).json({ message: "Required fields missing" });
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
        req.session.user = userWithoutPassword;
        await new Promise((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      res.json({
        success: true,
        message: "Onboarding completed successfully"
      });
    } catch (error) {
      console.error("Error saving onboarding responses:", error);
      res.status(500).json({ message: "Failed to save responses" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: validation.error.errors
        });
      }
      const { email, password } = validation.data;
      const rateLimitCheck = rateLimitService.checkSendLimit(req, email);
      if (!rateLimitCheck.allowed) {
        const resetInMinutes = Math.ceil((rateLimitCheck.resetTime - Date.now()) / (1e3 * 60));
        return res.status(429).json({
          message: `Too many login attempts. Please try again in ${resetInMinutes} minute${resetInMinutes !== 1 ? "s" : ""}.`,
          resetTime: rateLimitCheck.resetTime,
          remainingAttempts: 0
        });
      }
      const result = await authService.login(email, password);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }
      const { password: _, ...userWithoutPassword } = result.user;
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Session error" });
        }
        req.session.user = userWithoutPassword;
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ message: "Session error" });
          }
          res.json({
            success: true,
            message: "Login successful",
            user: sanitizeUser(result.user)
          });
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed. Please try again." });
    }
  });
  app2.post("/api/auth/logout-independent", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
      }
      const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
      const result = await passwordResetService.requestPasswordReset(email, ipAddress);
      if (!result.success) {
        return res.status(429).json({ message: result.message });
      }
      res.json({ success: true, message: result.message });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });
  app2.get("/api/auth/validate-reset-token", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ valid: false, message: "Token is required" });
      }
      const validation = await passwordResetService.validateResetToken(token);
      res.json(validation);
    } catch (error) {
      console.error("Token validation error:", error);
      res.status(500).json({ valid: false, message: "Failed to validate token" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ success: false, message: "Token is required" });
      }
      if (!newPassword || typeof newPassword !== "string") {
        return res.status(400).json({ success: false, message: "New password is required" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long"
        });
      }
      const result = await passwordResetService.resetPassword(token, newPassword);
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
      }
      res.json({ success: true, message: result.message });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ success: false, message: "Failed to reset password" });
    }
  });
  app2.get("/api/security/sharing-check", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const deviceId = req.headers["x-device-id"] || "unknown";
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
  app2.post("/api/tracking/device-action", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const {
        action,
        timestamp: timestamp2,
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
        timestamp: timestamp2 || (/* @__PURE__ */ new Date()).toISOString(),
        ...additionalData
      };
      const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "";
      await storage.updateSessionActivity(userId, deviceId, ipAddress, userAgent, deviceFingerprint);
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
  app2.use((req, res, next) => {
    if (!req.user) {
      return next();
    }
    const userId = req.user.claims.sub;
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
    storage.checkSuspiciousActivity(userId, ipAddress).then((result) => {
      if (result.suspicious) {
        console.log(`Suspicious activity detected for user ${userId}: ${result.reason}`);
      }
      next();
    }).catch((error) => {
      console.error("Error checking suspicious activity:", error);
      next();
    });
  });
  app2.get("/api/v1/market-status", async (req, res) => {
    try {
      const marketOpen = isMarketOpen();
      res.json({
        isOpen: marketOpen,
        timezone: "Africa/Casablanca",
        message: marketOpen ? "Market is currently open" : "Market is currently closed"
      });
    } catch (error) {
      console.error("Error checking market status:", error);
      res.status(500).json({ message: "Failed to check market status" });
    }
  });
  app2.get("/api/v1/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0.0"
    });
  });
  app2.post("/api/v1/generate-signal", isAuthenticated, sharingDetectionMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { timeframe } = generateSignalRequestSchema.parse(req.body);
      if (!isMarketOpen()) {
        return res.status(400).json({
          message: "Market is currently closed. Trading signals are only available during market hours.",
          marketStatus: "closed"
        });
      }
      const tierLimits = {
        free: { dailyLimit: 2, cooldownMinutes: 90 },
        starter_trader: { dailyLimit: 10, cooldownMinutes: 30 },
        pro_trader: { dailyLimit: 999999, cooldownMinutes: 15 },
        // Pro gets unlimited with 15min cooldown
        admin: { dailyLimit: 999999, cooldownMinutes: 0 }
        // Admin gets unlimited with no cooldown
      };
      const userTierLimits = tierLimits[user.subscriptionTier] || tierLimits.free;
      console.log(`[GENERATION] User ${user.email} tier: ${user.subscriptionTier}, limits:`, userTierLimits);
      const originalDailyCredits = user.dailyCredits;
      const originalLastGenerationTime = user.lastGenerationTime;
      const currentTime = /* @__PURE__ */ new Date();
      const casablancaTime = new Date(currentTime.toLocaleString("en-US", { timeZone: "Africa/Casablanca" }));
      const lastReset = new Date(user.lastCreditReset || 0);
      const lastResetCasablanca = new Date(lastReset.toLocaleString("en-US", { timeZone: "Africa/Casablanca" }));
      const needsReset = casablancaTime.getDate() !== lastResetCasablanca.getDate() || casablancaTime.getMonth() !== lastResetCasablanca.getMonth() || casablancaTime.getFullYear() !== lastResetCasablanca.getFullYear();
      if (needsReset) {
        console.log(`[GENERATION] Daily reset needed for user ${userId}`);
        await storage.resetDailyCredits(userId);
        user.dailyCredits = 0;
        user.lastCreditReset = currentTime;
        user.lastGenerationTime = null;
      }
      const cooldownEndTime = user.lastGenerationTime ? new Date(new Date(user.lastGenerationTime).getTime() + userTierLimits.cooldownMinutes * 60 * 1e3) : null;
      const canGenerate = user.dailyCredits < userTierLimits.dailyLimit && (!cooldownEndTime || currentTime >= cooldownEndTime);
      if (!canGenerate) {
        if (user.dailyCredits >= userTierLimits.dailyLimit) {
          const upgradeMessages = {
            free: "Daily limit reached. Free users get 2 signals per day. Upgrade to Starter for 10 signals per day.",
            starter_trader: "Daily limit reached. Starter users get 10 signals per day. Upgrade to Pro for 20 signals per day.",
            pro_trader: "Daily limit reached. Pro users get 20 signals per day.",
            admin: "Daily limit reached (this should not happen for admin users)."
          };
          return res.status(429).json({
            message: upgradeMessages[user.subscriptionTier] || upgradeMessages.free,
            creditsRemaining: 0,
            dailyLimitReached: true
          });
        }
        if (cooldownEndTime && currentTime < cooldownEndTime) {
          const remainingTime = Math.ceil((cooldownEndTime.getTime() - currentTime.getTime()) / (1e3 * 60));
          return res.status(429).json({
            message: `Please wait ${remainingTime} minute${remainingTime !== 1 ? "s" : ""} before generating another signal.`,
            cooldownRemaining: remainingTime,
            nextGenerationTime: cooldownEndTime.toISOString()
          });
        }
      }
      const updateResult = await storage.atomicGenerationUpdate(
        userId,
        userTierLimits.dailyLimit,
        userTierLimits.cooldownMinutes,
        currentTime
      );
      if (!updateResult.success) {
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
        const newCooldownEndTime = updatedUser.lastGenerationTime ? new Date(new Date(updatedUser.lastGenerationTime).getTime() + userTierLimits.cooldownMinutes * 60 * 1e3) : null;
        if (newCooldownEndTime && currentTime < newCooldownEndTime) {
          const remainingTime = Math.ceil((newCooldownEndTime.getTime() - currentTime.getTime()) / (1e3 * 60));
          return res.status(429).json({
            message: `Cooldown active. Another request was processed first.`,
            cooldownRemaining: remainingTime,
            nextGenerationTime: newCooldownEndTime.toISOString()
          });
        }
        return res.status(500).json({ message: "Failed to process request. Please try again." });
      }
      let signalData;
      try {
        signalData = await generateTradingSignal(timeframe, user.subscriptionTier, userId);
      } catch (error) {
        console.error(`[GENERATION] OpenAI generation failed for user ${userId}:`, error);
        await storage.revertGenerationUpdate(userId, originalDailyCredits, originalLastGenerationTime);
        return res.status(500).json({
          message: "Signal generation failed. Please try again.",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
      const signal = await storage.createSignal({
        userId,
        pair: "XAUUSD",
        direction: signalData.action,
        timeframe,
        entryPrice: signalData.entry.toString(),
        stopLoss: signalData.stop_loss.toString(),
        takeProfit: signalData.take_profit.toString(),
        takeProfits: signalData.take_profits || [],
        // Store takeProfits in database
        confidence: signalData.confidence,
        analysis: `${signalData.ai_analysis.brief} ${signalData.ai_analysis.detailed}`.replace(/\[.*?\]/g, "").replace(/\(.*?\.com.*?\)/g, "").replace(/\([^)]*https?[^)]*\)/g, "").replace(/\([^)]*www\.[^)]*\)/g, "").trim(),
        status: "fresh"
      });
      res.json({
        signal,
        creditsUsed: user.subscriptionTier === "pro" ? 0 : 1,
        creditsRemaining: userTierLimits.dailyLimit - (user.dailyCredits + 1),
        cooldownMinutes: userTierLimits.cooldownMinutes,
        nextGenerationTime: new Date(Date.now() + userTierLimits.cooldownMinutes * 60 * 1e3).toISOString()
      });
    } catch (error) {
      console.error("Error generating signal:", error);
      res.status(500).json({ message: "Failed to generate trading signal" });
    }
  });
  app2.get("/api/v1/signals", isAuthenticated, sharingDetectionMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.subscriptionTier === "free") {
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
  app2.get("/api/v1/signals/latest", isAuthenticated, sharingDetectionMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.subscriptionTier === "free") {
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
  app2.get("/api/v1/notifications/pending-reviews", isAuthenticated, sharingDetectionMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const pendingData = await notificationService.checkPendingSignalReviews(userId);
      res.json(pendingData);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      res.status(500).json({ message: "Failed to fetch pending reviews" });
    }
  });
  app2.patch("/api/v1/signals/:signalId/action", isAuthenticated, async (req, res) => {
    try {
      const { signalId } = req.params;
      const { action } = req.body;
      if (!["successful", "unsuccessful", "didnt_take"].includes(action)) {
        return res.status(400).json({ message: "Invalid action. Must be 'successful', 'unsuccessful', or 'didnt_take'" });
      }
      await storage.updateSignalUserAction(signalId, action);
      const userId = req.user.claims.sub;
      await notificationService.markNotificationSent(userId);
      res.json({ message: "Signal action updated successfully" });
    } catch (error) {
      console.error("Error updating signal action:", error);
      res.status(500).json({ message: "Failed to update signal action" });
    }
  });
  app2.get("/api/v1/notifications/count", isAuthenticated, sharingDetectionMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const notificationData = await notificationService.getNotificationCount(userId);
      res.json(notificationData);
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });
  app2.get("/api/v1/notifications/monthly-status", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const monthlyData = await notificationService.checkMonthlyCompletion(userId);
      res.json(monthlyData);
    } catch (error) {
      console.error("Error fetching monthly status:", error);
      res.status(500).json({ message: "Failed to fetch monthly status" });
    }
  });
  app2.post("/api/v1/notifications/claim-discount", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.pendingDiscountCode) {
        return res.status(404).json({ message: "No discount code available" });
      }
      await storage.updateUserDiscountCode(userId, "");
      res.json({
        message: "Discount code claimed successfully",
        discountCode: user.pendingDiscountCode
      });
    } catch (error) {
      console.error("Error claiming discount:", error);
      res.status(500).json({ message: "Failed to claim discount code" });
    }
  });
  app2.get("/api/v1/logs", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(403).json({ message: "Authentication required" });
      }
      const { date } = req.query;
      if (date) {
        const logs = await apiLogger.getLogsByDate(date);
        res.json({ date, logs });
      } else {
        const logFiles = await apiLogger.getAllLogFiles();
        res.json({ logFiles });
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });
  app2.get("/api/v1/debug-gpt5", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user || user.claims?.email !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const testSignal = await generateTradingSignal("1H", "pro", user.claims.sub);
      res.json({
        status: "connected",
        model: "gpt-5-mini",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        testSignal
      });
    } catch (error) {
      console.error("GPT-5 debug error:", error);
      res.status(500).json({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/v1/news/recent", async (req, res) => {
    try {
      const { limit = "10" } = req.query;
      const news = await tradingViewService.getRecentNews(
        parseInt(limit)
      );
      console.log(`[TradingView] Fetched ${news.length} recent news items`);
      res.json(news);
    } catch (error) {
      console.error("Error fetching recent news from TradingView:", error);
      res.status(500).json({ message: "Failed to fetch recent news" });
    }
  });
  app2.get("/api/v1/news/upcoming", async (req, res) => {
    try {
      const { limit = "10" } = req.query;
      const news = await tradingViewService.getUpcomingNews(
        parseInt(limit)
      );
      console.log(`[TradingView] Fetched ${news.length} upcoming news items`);
      res.json(news);
    } catch (error) {
      console.error("Error fetching upcoming news from TradingView:", error);
      res.status(500).json({ message: "Failed to fetch upcoming news" });
    }
  });
  app2.post("/api/v1/news/refresh-cache", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user || user.claims?.email !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ message: "Admin access required" });
      }
      tradingViewService.clearCache();
      res.json({
        message: "TradingView cache cleared successfully",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error clearing TradingView cache:", error);
      res.status(500).json({ message: "Failed to clear cache" });
    }
  });
  app2.post("/api/v1/news", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.subscriptionTier === "free") {
        return res.status(403).json({
          message: "News management requires a paid subscription"
        });
      }
      const newsData = insertNewsSchema.parse(req.body);
      const news = await storage.createNews(newsData);
      res.status(201).json(news);
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ message: "Failed to create news item" });
    }
  });
  app2.get("/api/admin/users", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.subscriptionTier !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const allUsers = await storage.getAllUsers();
      const sanitizedUsers = allUsers.map((u) => sanitizeUser(u));
      res.json({ users: sanitizedUsers });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.put("/api/admin/users/:userId/plan", isAuthenticated, async (req, res) => {
    try {
      const adminId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminId);
      if (!adminUser || adminUser.subscriptionTier !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { userId } = req.params;
      const { plan } = req.body;
      const validPlans = ["free", "starter_trader", "pro_trader", "admin"];
      if (!plan || !validPlans.includes(plan)) {
        return res.status(400).json({ message: "Invalid plan selected" });
      }
      const planLimits = {
        free: { maxDaily: 2, maxMonthly: 10 },
        starter_trader: { maxDaily: 10, maxMonthly: 60 },
        pro_trader: { maxDaily: 999999, maxMonthly: 999999 },
        admin: { maxDaily: 999999, maxMonthly: 999999 }
      };
      const limits = planLimits[plan];
      await storage.updateUser(userId, {
        subscriptionTier: plan,
        maxDailyCredits: limits.maxDaily,
        maxMonthlyCredits: limits.maxMonthly
      });
      await storage.resetDailyCredits(userId);
      const updatedUser = await storage.getUser(userId);
      res.json({ success: true, user: sanitizeUser(updatedUser) });
    } catch (error) {
      console.error("Error updating user plan:", error);
      res.status(500).json({ message: "Failed to update user plan" });
    }
  });
  app2.put("/api/admin/users/:userId/status", isAuthenticated, async (req, res) => {
    try {
      const adminId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminId);
      if (!adminUser || adminUser.subscriptionTier !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { userId } = req.params;
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "Invalid status value" });
      }
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
  app2.post("/api/v1/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({
          message: "Name, email, and message are required"
        });
      }
      console.log("Contact form submission:", {
        name,
        email,
        subject: subject || "No subject",
        message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.status(200).json({
        message: "Contact form submitted successfully",
        success: true
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });
  app2.post("/api/v1/payment-requests", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { plan, period, whatsappNumber } = req.body;
      if (!plan || !["starter_trader", "pro_trader"].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan. Must be starter_trader or pro_trader" });
      }
      if (!period || ![1, 3, 12].includes(period)) {
        return res.status(400).json({ message: "Invalid period. Must be 1, 3, or 12 months" });
      }
      const { calculateSubscriptionPrice: calculateSubscriptionPrice2, generateReferenceCode: generateReferenceCode2 } = await Promise.resolve().then(() => (init_paymentService(), paymentService_exports));
      const pricing = calculateSubscriptionPrice2(plan, period, user.isFirstTimeSubscriber || false);
      const referenceCode = generateReferenceCode2();
      const paymentRequest = await storage.createPaymentRequest({
        userId: user.id,
        userEmail: user.email,
        requestedPlan: plan,
        subscriptionPeriod: period,
        referenceCode,
        amount: pricing.finalAmount.toString(),
        originalAmount: pricing.originalAmount.toString(),
        discountPercentage: pricing.discountPercentage,
        whatsappNumber: whatsappNumber || void 0
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
  app2.get("/api/v1/payment-requests/me", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getUserPaymentRequests(userId);
      res.json({ paymentRequests: requests });
    } catch (error) {
      console.error("Error fetching payment requests:", error);
      res.status(500).json({ message: "Failed to fetch payment requests" });
    }
  });
  app2.post("/api/v1/payment-requests/:id/whatsapp-link", isAuthenticated, async (req, res) => {
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
      const { generateWhatsAppMessage: generateWhatsAppMessage2, getWhatsAppUrl: getWhatsAppUrl2, getPlanDisplayName: getPlanDisplayName2, getPeriodDisplayText: getPeriodDisplayText2 } = await Promise.resolve().then(() => (init_paymentService(), paymentService_exports));
      const message = generateWhatsAppMessage2(
        paymentRequest.userEmail,
        paymentRequest.requestedPlan,
        paymentRequest.subscriptionPeriod,
        parseFloat(paymentRequest.amount),
        paymentRequest.referenceCode
      );
      const whatsappNumber = process.env.WHATSAPP_SUPPORT_NUMBER || "1234567890";
      const whatsappUrl = getWhatsAppUrl2(whatsappNumber, message);
      res.json({
        success: true,
        whatsappUrl,
        message,
        paymentDetails: {
          plan: getPlanDisplayName2(paymentRequest.requestedPlan),
          period: getPeriodDisplayText2(paymentRequest.subscriptionPeriod),
          amount: paymentRequest.amount,
          referenceCode: paymentRequest.referenceCode
        }
      });
    } catch (error) {
      console.error("Error generating WhatsApp link:", error);
      res.status(500).json({ message: "Failed to generate WhatsApp link" });
    }
  });
  app2.get("/api/admin/payment-requests", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.subscriptionTier !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { status } = req.query;
      let requests;
      if (status === "pending") {
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
  app2.post("/api/admin/payment-requests/:id/confirm", isAuthenticated, async (req, res) => {
    try {
      const adminId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminId);
      if (!adminUser || adminUser.subscriptionTier !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { id } = req.params;
      const { notes } = req.body;
      const paymentRequest = await storage.getPaymentRequest(id);
      if (!paymentRequest) {
        return res.status(404).json({ message: "Payment request not found" });
      }
      if (paymentRequest.status !== "pending") {
        return res.status(400).json({ message: "Payment request is not pending" });
      }
      const { calculateSubscriptionEndDate: calculateSubscriptionEndDate2, calculateGracePeriodEndDate: calculateGracePeriodEndDate2 } = await Promise.resolve().then(() => (init_paymentService(), paymentService_exports));
      const now = /* @__PURE__ */ new Date();
      const endDate = calculateSubscriptionEndDate2(now, paymentRequest.subscriptionPeriod);
      const graceEndDate = calculateGracePeriodEndDate2(endDate);
      const planLimits = {
        starter_trader: { maxDaily: 10, maxMonthly: 60 },
        pro_trader: { maxDaily: 999999, maxMonthly: 999999 }
      };
      const limits = planLimits[paymentRequest.requestedPlan];
      await storage.updateUser(paymentRequest.userId, {
        subscriptionTier: paymentRequest.requestedPlan,
        subscriptionStartDate: now,
        subscriptionEndDate: endDate,
        subscriptionPeriod: paymentRequest.subscriptionPeriod,
        gracePeriodEndDate: graceEndDate,
        isFirstTimeSubscriber: false,
        // Mark as no longer first-time after first payment
        maxDailyCredits: limits.maxDaily,
        maxMonthlyCredits: limits.maxMonthly
      });
      await storage.resetDailyCredits(paymentRequest.userId);
      await storage.confirmPaymentRequest(id, adminId);
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
  app2.post("/api/admin/payment-requests/:id/cancel", isAuthenticated, async (req, res) => {
    try {
      const adminId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminId);
      if (!adminUser || adminUser.subscriptionTier !== "admin") {
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
  app2.post("/api/contact", async (req, res) => {
    try {
      const { email, type, subject, message } = req.body;
      if (!email || !type || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const typeLabels = {
        support_ticket: "[SUPPORT TICKET]",
        general_question: "[GENERAL QUESTION]"
      };
      const emailSubject = `${typeLabels[type] || "[CONTACT]"} ${subject}`;
      const emailSent = await notificationService.sendEmail(
        "support@nextradinglabs.com",
        emailSubject,
        `
          <h2>New Contact Form Submission</h2>
          <p><strong>Type:</strong> ${type === "support_ticket" ? "Support Ticket" : "General Question"}</p>
          <p><strong>From:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <br>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    hmr: {
      clientPort: 443
    },
    fs: {
      strict: true,
      deny: ["**/."]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/services/newsService.ts
var sampleNewsData = [
  {
    title: "Federal Reserve Interest Rate Decision",
    description: "FOMC announces interest rate decision and monetary policy outlook",
    currency: "USD",
    impact: "high",
    eventTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1e3),
    // 2 days from now
    isArchived: false,
    previousValue: "5.25%",
    forecastValue: "5.50%",
    actualValue: null
  },
  {
    title: "US Non-Farm Payrolls",
    description: "Monthly employment data showing job creation and unemployment rate",
    currency: "USD",
    impact: "high",
    eventTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1e3),
    // 5 days from now
    isArchived: false,
    previousValue: "150K",
    forecastValue: "175K",
    actualValue: null
  },
  {
    title: "Consumer Price Index (CPI)",
    description: "Monthly inflation data measuring price changes in consumer goods",
    currency: "USD",
    impact: "high",
    eventTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
    // 1 week from now
    isArchived: false,
    previousValue: "3.2%",
    forecastValue: "3.1%",
    actualValue: null
  },
  {
    title: "GDP Quarterly Report",
    description: "Economic growth data for the previous quarter",
    currency: "USD",
    impact: "high",
    eventTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3),
    // 2 days ago
    isArchived: false,
    previousValue: "2.1%",
    forecastValue: "2.3%",
    actualValue: "2.4%"
  },
  {
    title: "Federal Reserve Chair Speech",
    description: "Jerome Powell speaks on monetary policy and economic outlook",
    currency: "USD",
    impact: "high",
    eventTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3),
    // 1 day ago
    isArchived: false,
    previousValue: null,
    forecastValue: null,
    actualValue: null
  }
];
async function initializeSampleNews() {
  try {
    console.log("Initializing sample economic news data...");
    for (const newsItem of sampleNewsData) {
      await storage.createNews(newsItem);
    }
    console.log(`Successfully added ${sampleNewsData.length} news items`);
  } catch (error) {
    console.error("Error initializing sample news:", error);
  }
}

// server/services/subscriptionChecker.ts
import { and as and3, lte, isNotNull, ne as ne2, eq as eq3 } from "drizzle-orm";
var CHECK_INTERVAL_MS = 24 * 60 * 60 * 1e3;
var isRunning = false;
var SubscriptionCheckerService = class {
  checkInterval = null;
  /**
   * Start the subscription checker service
   */
  start() {
    if (isRunning) {
      console.log("[SUBSCRIPTION-CHECKER] Service is already running");
      return;
    }
    console.log("[SUBSCRIPTION-CHECKER] Starting subscription checker service...");
    isRunning = true;
    this.checkSubscriptions();
    this.checkInterval = setInterval(() => {
      this.checkSubscriptions();
    }, CHECK_INTERVAL_MS);
  }
  /**
   * Stop the subscription checker service
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    isRunning = false;
    console.log("[SUBSCRIPTION-CHECKER] Service stopped");
  }
  /**
   * Main check function - handles all subscription expiry logic
   */
  async checkSubscriptions() {
    try {
      console.log("[SUBSCRIPTION-CHECKER] Running subscription expiry check...");
      const now = /* @__PURE__ */ new Date();
      await this.handleNewlyExpiredSubscriptions(now);
      await this.sendExpirationReminders(now);
      await this.handleExpiredGracePeriods(now);
      console.log("[SUBSCRIPTION-CHECKER] Subscription check completed successfully");
    } catch (error) {
      console.error("[SUBSCRIPTION-CHECKER] Error during subscription check:", error);
    }
  }
  /**
   * Handle subscriptions that just expired - set grace period
   */
  async handleNewlyExpiredSubscriptions(now) {
    try {
      const expiredUsers = await db.select().from(users).where(
        and3(
          lte(users.subscriptionEndDate, now),
          // Subscription ended
          isNotNull(users.subscriptionEndDate),
          // Has an end date
          eq3(users.gracePeriodEndDate, null),
          // Grace period not set yet
          ne2(users.subscriptionTier, "free"),
          // Not already free
          ne2(users.subscriptionTier, "admin")
          // Not admin
        )
      );
      console.log(`[SUBSCRIPTION-CHECKER] Found ${expiredUsers.length} newly expired subscriptions`);
      for (const user of expiredUsers) {
        const graceEndDate = new Date(user.subscriptionEndDate);
        graceEndDate.setHours(graceEndDate.getHours() + 48);
        await storage.updateUser(user.id, {
          gracePeriodEndDate: graceEndDate
        });
        console.log(`[SUBSCRIPTION-CHECKER] Set grace period for ${user.email} until ${graceEndDate.toISOString()}`);
      }
    } catch (error) {
      console.error("[SUBSCRIPTION-CHECKER] Error handling newly expired subscriptions:", error);
    }
  }
  /**
   * Send reminders for subscriptions expiring soon (within 7 days)
   */
  async sendExpirationReminders(now) {
    try {
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      const expiringUsers = await db.select().from(users).where(
        and3(
          isNotNull(users.subscriptionEndDate),
          lte(users.subscriptionEndDate, sevenDaysFromNow),
          // Expires within 7 days
          lte(now, users.subscriptionEndDate),
          // Not yet expired
          ne2(users.subscriptionTier, "free"),
          ne2(users.subscriptionTier, "admin")
        )
      );
      console.log(`[SUBSCRIPTION-CHECKER] Found ${expiringUsers.length} subscriptions expiring within 7 days`);
      for (const user of expiringUsers) {
        const daysUntilExpiry = Math.ceil(
          (user.subscriptionEndDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)
        );
        console.log(`[SUBSCRIPTION-CHECKER] ${user.email} subscription expires in ${daysUntilExpiry} days`);
      }
    } catch (error) {
      console.error("[SUBSCRIPTION-CHECKER] Error sending expiration reminders:", error);
    }
  }
  /**
   * Handle expired grace periods - auto-downgrade to free
   */
  async handleExpiredGracePeriods(now) {
    try {
      const gracePeriodExpiredUsers = await db.select().from(users).where(
        and3(
          isNotNull(users.gracePeriodEndDate),
          lte(users.gracePeriodEndDate, now),
          // Grace period ended
          ne2(users.subscriptionTier, "free"),
          // Not already free
          ne2(users.subscriptionTier, "admin")
          // Not admin
        )
      );
      console.log(`[SUBSCRIPTION-CHECKER] Found ${gracePeriodExpiredUsers.length} users with expired grace periods`);
      for (const user of gracePeriodExpiredUsers) {
        await storage.updateUser(user.id, {
          subscriptionTier: "free",
          subscriptionEndDate: null,
          subscriptionPeriod: null,
          gracePeriodEndDate: null,
          maxDailyCredits: 2,
          maxMonthlyCredits: 10
        });
        await storage.resetDailyCredits(user.id);
        console.log(`[SUBSCRIPTION-CHECKER] Auto-downgraded ${user.email} to free tier after grace period`);
      }
    } catch (error) {
      console.error("[SUBSCRIPTION-CHECKER] Error handling expired grace periods:", error);
    }
  }
  /**
   * Manual check trigger (for testing or admin use)
   */
  async manualCheck() {
    console.log("[SUBSCRIPTION-CHECKER] Manual check triggered");
    await this.checkSubscriptions();
  }
};
var subscriptionChecker = new SubscriptionCheckerService();

// server/index.ts
var app = express2();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      // unsafe-eval needed for Vite
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      // WebSocket needed for Vite HMR
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://s.tradingview.com", "https://www.tradingview.com"]
    }
  },
  crossOriginEmbedderPolicy: false
  // Disable for Vite compatibility
}));
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? [process.env.FRONTEND_URL || "https://ntl-trading-platform.onrender.com"] : true,
  // Allow all origins in development for Replit proxy
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-device-id"]
}));
app.set("trust proxy", 1);
var sessionTtl = 7 * 24 * 60 * 60 * 1e3;
if (process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
  const pgStore = connectPg2(session2);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  app.use(session2({
    secret: process.env.SESSION_SECRET || "fallback-secret-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: sessionTtl,
      sameSite: "none"
    }
  }));
} else {
  app.use(session2({
    secret: process.env.SESSION_SECRET || "fallback-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: sessionTtl,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }
  }));
}
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "ntl-trading-platform",
      environment: process.env.NODE_ENV || "development"
    });
  });
  const server = await registerRoutes(app);
  if (app.get("env") === "development") {
    try {
      await initializeSampleNews();
    } catch (error) {
      console.log("Sample news data may already exist, skipping initialization");
    }
  }
  try {
    console.log("Initializing admin user...");
    await authService.createDefaultAdmin();
  } catch (error) {
    console.error("Error initializing admin user:", error);
  }
  startSignalLifecycleService();
  console.log("Starting subscription expiry checker...");
  subscriptionChecker.start();
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
  server.listen(port, host, () => {
    log(`serving on port ${port}`);
  });
})();
