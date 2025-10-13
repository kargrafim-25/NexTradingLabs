import { storage } from '../storage';
import { db } from '../db';
import { users } from '@shared/schema';
import { and, lte, isNotNull, ne, eq } from 'drizzle-orm';

/**
 * Subscription Expiry Checker Service
 * Runs daily to check for expired subscriptions, manage grace periods, and auto-downgrade users
 */

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
let isRunning = false;

export class SubscriptionCheckerService {
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * Start the subscription checker service
   */
  start() {
    if (isRunning) {
      console.log('[SUBSCRIPTION-CHECKER] Service is already running');
      return;
    }

    console.log('[SUBSCRIPTION-CHECKER] Starting subscription checker service...');
    isRunning = true;

    // Run immediately on start
    this.checkSubscriptions();

    // Then run every 24 hours
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
    console.log('[SUBSCRIPTION-CHECKER] Service stopped');
  }

  /**
   * Main check function - handles all subscription expiry logic
   */
  async checkSubscriptions() {
    try {
      console.log('[SUBSCRIPTION-CHECKER] Running subscription expiry check...');
      const now = new Date();

      // 1. Check for subscriptions that just expired (no grace period set yet)
      await this.handleNewlyExpiredSubscriptions(now);

      // 2. Check for upcoming expirations (within 7 days) and send reminders
      await this.sendExpirationReminders(now);

      // 3. Check for expired grace periods and auto-downgrade
      await this.handleExpiredGracePeriods(now);

      console.log('[SUBSCRIPTION-CHECKER] Subscription check completed successfully');
    } catch (error) {
      console.error('[SUBSCRIPTION-CHECKER] Error during subscription check:', error);
    }
  }

  /**
   * Handle subscriptions that just expired - set grace period
   */
  private async handleNewlyExpiredSubscriptions(now: Date) {
    try {
      // Find subscriptions that expired but don't have grace period set yet
      const expiredUsers = await db
        .select()
        .from(users)
        .where(
          and(
            lte(users.subscriptionEndDate, now), // Subscription ended
            isNotNull(users.subscriptionEndDate), // Has an end date
            eq(users.gracePeriodEndDate, null), // Grace period not set yet
            ne(users.subscriptionTier, 'free'), // Not already free
            ne(users.subscriptionTier, 'admin') // Not admin
          )
        );

      console.log(`[SUBSCRIPTION-CHECKER] Found ${expiredUsers.length} newly expired subscriptions`);

      for (const user of expiredUsers) {
        // Set grace period (48 hours from subscription end date)
        const graceEndDate = new Date(user.subscriptionEndDate!);
        graceEndDate.setHours(graceEndDate.getHours() + 48);

        await storage.updateUser(user.id!, {
          gracePeriodEndDate: graceEndDate
        });

        console.log(`[SUBSCRIPTION-CHECKER] Set grace period for ${user.email} until ${graceEndDate.toISOString()}`);

        // TODO: Send email notification about expiration and grace period
        // await sendExpirationEmail(user.email, graceEndDate);
      }
    } catch (error) {
      console.error('[SUBSCRIPTION-CHECKER] Error handling newly expired subscriptions:', error);
    }
  }

  /**
   * Send reminders for subscriptions expiring soon (within 7 days)
   */
  private async sendExpirationReminders(now: Date) {
    try {
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      // Find users with subscriptions expiring within 7 days
      const expiringUsers = await db
        .select()
        .from(users)
        .where(
          and(
            isNotNull(users.subscriptionEndDate),
            lte(users.subscriptionEndDate, sevenDaysFromNow), // Expires within 7 days
            lte(now, users.subscriptionEndDate), // Not yet expired
            ne(users.subscriptionTier, 'free'),
            ne(users.subscriptionTier, 'admin')
          )
        );

      console.log(`[SUBSCRIPTION-CHECKER] Found ${expiringUsers.length} subscriptions expiring within 7 days`);

      for (const user of expiringUsers) {
        const daysUntilExpiry = Math.ceil(
          (user.subscriptionEndDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        console.log(`[SUBSCRIPTION-CHECKER] ${user.email} subscription expires in ${daysUntilExpiry} days`);

        // TODO: Send renewal reminder email
        // await sendRenewalReminderEmail(user.email, daysUntilExpiry);
      }
    } catch (error) {
      console.error('[SUBSCRIPTION-CHECKER] Error sending expiration reminders:', error);
    }
  }

  /**
   * Handle expired grace periods - auto-downgrade to free
   */
  private async handleExpiredGracePeriods(now: Date) {
    try {
      // Find users whose grace period has expired
      const gracePeriodExpiredUsers = await db
        .select()
        .from(users)
        .where(
          and(
            isNotNull(users.gracePeriodEndDate),
            lte(users.gracePeriodEndDate, now), // Grace period ended
            ne(users.subscriptionTier, 'free'), // Not already free
            ne(users.subscriptionTier, 'admin') // Not admin
          )
        );

      console.log(`[SUBSCRIPTION-CHECKER] Found ${gracePeriodExpiredUsers.length} users with expired grace periods`);

      for (const user of gracePeriodExpiredUsers) {
        // Downgrade to free tier
        await storage.updateUser(user.id!, {
          subscriptionTier: 'free',
          subscriptionEndDate: null,
          subscriptionPeriod: null,
          gracePeriodEndDate: null,
          maxDailyCredits: 2,
          maxMonthlyCredits: 10
        });

        // Reset credits
        await storage.resetDailyCredits(user.id!);

        console.log(`[SUBSCRIPTION-CHECKER] Auto-downgraded ${user.email} to free tier after grace period`);

        // TODO: Send downgrade notification email
        // await sendDowngradeNotificationEmail(user.email);
      }
    } catch (error) {
      console.error('[SUBSCRIPTION-CHECKER] Error handling expired grace periods:', error);
    }
  }

  /**
   * Manual check trigger (for testing or admin use)
   */
  async manualCheck() {
    console.log('[SUBSCRIPTION-CHECKER] Manual check triggered');
    await this.checkSubscriptions();
  }
}

// Export singleton instance
export const subscriptionChecker = new SubscriptionCheckerService();
