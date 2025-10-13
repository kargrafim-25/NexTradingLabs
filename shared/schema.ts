import { sql } from 'drizzle-orm';
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
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Define enums first before tables
export const signalDirectionEnum = pgEnum('signal_direction', ['BUY', 'SELL']);
export const signalStatusEnum = pgEnum('signal_status', ['fresh', 'active', 'closed', 'stopped']);
export const userActionEnum = pgEnum('user_action', ['pending', 'successful', 'unsuccessful', 'didnt_take']);
export const timeframeEnum = pgEnum('timeframe', ['5M', '15M', '30M', '1H', '4H', '1D', '1W']);
export const newsImpactEnum = pgEnum('news_impact', ['low', 'medium', 'high']);
export const newsCurrencyEnum = pgEnum('news_currency', ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'cancelled', 'expired']);

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
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
  password: varchar("password"), // For independent auth (bcrypt hashed)
  isActive: boolean("is_active").default(true).notNull(),
  accountLocked: boolean("account_locked").default(false).notNull(),
  loginAttempts: integer("login_attempts").default(0).notNull(),
  lastLoginAttempt: timestamp("last_login_attempt"),
  subscriptionTier: varchar("subscription_tier").default("free").notNull().$type<'free' | 'starter_trader' | 'pro_trader' | 'admin'>(),
  subscriptionStartDate: timestamp("subscription_start_date").defaultNow(), // When user started current billing cycle
  subscriptionEndDate: timestamp("subscription_end_date"), // When subscription expires
  subscriptionPeriod: integer("subscription_period"), // Duration in months: 1, 3, or 12
  isFirstTimeSubscriber: boolean("is_first_time_subscriber").default(true).notNull(), // For 10% first-time discount
  gracePeriodEndDate: timestamp("grace_period_end_date"), // 48h grace period after expiry
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tradingSignals = pgTable("trading_signals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  pair: varchar("pair").default("XAUUSD").notNull(),
  direction: signalDirectionEnum("direction").notNull(),
  timeframe: timeframeEnum("timeframe").notNull(),
  entryPrice: decimal("entry_price", { precision: 10, scale: 2 }).notNull(),
  stopLoss: decimal("stop_loss", { precision: 10, scale: 2 }).notNull(),
  takeProfit: decimal("take_profit", { precision: 10, scale: 2 }).notNull(),
  takeProfits: jsonb("take_profits"), // Store take profit levels as JSON
  confidence: integer("confidence").notNull(), // 1-100
  analysis: text("analysis"),
  status: signalStatusEnum("status").default("fresh").notNull(),
  userAction: userActionEnum("user_action").default("pending").notNull(),
  pips: decimal("pips", { precision: 10, scale: 2 }),
  lastNotified: timestamp("last_notified"),
  createdAt: timestamp("created_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const economicNews = pgTable("economic_news", {
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User sessions for abuse detection
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  ipAddress: varchar("ip_address").notNull(),
  userAgent: text("user_agent"),
  deviceFingerprint: varchar("device_fingerprint"),
  isActive: boolean("is_active").default(true).notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Security events for abuse tracking
export const securityEvents = pgTable("security_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  eventType: varchar("event_type").notNull(), // login_attempt, suspicious_activity, multiple_sessions, etc
  ipAddress: varchar("ip_address").notNull(),
  details: text("details"),
  severity: varchar("severity").default("low").notNull(), // low, medium, high, critical
  blocked: boolean("blocked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Password reset tokens for secure password recovery
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(), // Hashed token
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  ipAddress: varchar("ip_address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment requests for WhatsApp-based subscription payments
export const paymentRequests = pgTable("payment_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  userEmail: varchar("user_email").notNull(),
  requestedPlan: varchar("requested_plan").notNull().$type<'starter_trader' | 'pro_trader'>(),
  subscriptionPeriod: integer("subscription_period").notNull(), // 1, 3, or 12 months
  referenceCode: varchar("reference_code").notNull().unique(), // e.g., PAY-ABC123
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Final amount after discount
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(), // Before discount
  discountPercentage: integer("discount_percentage").default(0).notNull(), // 10% first-time, 20%, or 45%
  status: paymentStatusEnum("status").default("pending").notNull(),
  notes: text("notes"), // For support to add comments
  whatsappNumber: varchar("whatsapp_number"), // User's WhatsApp if provided
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  completedByAdminId: varchar("completed_by_admin_id").references(() => users.id),
});

export const usersRelations = relations(users, ({ many }) => ({
  signals: many(tradingSignals),
  paymentRequests: many(paymentRequests),
}));

export const signalsRelations = relations(tradingSignals, ({ one }) => ({
  user: one(users, {
    fields: [tradingSignals.userId],
    references: [users.id],
  }),
}));

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertTradingSignal = typeof tradingSignals.$inferInsert;
export type EconomicNews = typeof economicNews.$inferSelect;
export type InsertEconomicNews = typeof economicNews.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;
export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = typeof securityEvents.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertPaymentRequest = typeof paymentRequests.$inferInsert;

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  phoneNumber: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertSignalSchema = createInsertSchema(tradingSignals).omit({
  id: true,
  createdAt: true,
  closedAt: true,
});

export const insertNewsSchema = createInsertSchema(economicNews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type InsertNews = z.infer<typeof insertNewsSchema>;
