import { verificationService } from './verificationService';

interface SessionInfo {
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  lastActive: Date;
  deviceFingerprint?: any;
}

interface SharingDetectionResult {
  isSharing: boolean;
  reason: string;
  confidence: number; // 0-1, where 1 is definitely sharing
  activeSessions: number;
  suspiciousDevices: string[];
  enforcement?: {
    action: 'allow' | 'warn' | 'restrict' | 'terminate';
    sessionsTerminated?: number;
    blocked?: boolean;
  };
}

class SharingDetectionService {
  private readonly MAX_ALLOWED_SESSIONS = 5; // Allow up to 5 simultaneous sessions (more lenient for legitimate multi-tab usage)
  private readonly SESSION_TIMEOUT_HOURS = 24; // Consider sessions inactive after 24 hours
  private readonly DEVICE_SIMILARITY_THRESHOLD = 0.7; // Device fingerprints similarity threshold
  private readonly SIMULTANEOUS_WINDOW_MINUTES = 5; // Consider sessions simultaneous if within 5 minutes

  async detectSharing(userId: string, currentDeviceId: string, storage: any): Promise<SharingDetectionResult> {
    try {
      // Get all recent sessions for this user
      const recentSessions = await this.getRecentUserSessions(userId, storage);
      
      // Filter out expired sessions
      const activeSessions = this.filterActiveSessions(recentSessions);
      
      // Analyze device patterns
      const deviceAnalysis = this.analyzeDevicePatterns(activeSessions, currentDeviceId);
      
      // Check for simultaneous sessions from different locations/devices
      const simultaneousAnalysis = this.analyzeSimultaneousAccess(activeSessions);
      
      // Calculate sharing confidence score
      const confidence = this.calculateSharingConfidence(deviceAnalysis, simultaneousAnalysis, activeSessions.length);
      
      return {
        isSharing: confidence > 0.8 || activeSessions.length > this.MAX_ALLOWED_SESSIONS,
        reason: this.generateSharingReason(deviceAnalysis, simultaneousAnalysis, activeSessions.length),
        confidence,
        activeSessions: activeSessions.length,
        suspiciousDevices: deviceAnalysis.suspiciousDevices
      };
    } catch (error) {
      console.error('Error detecting sharing:', error);
      return {
        isSharing: false,
        reason: 'Error analyzing sessions',
        confidence: 0,
        activeSessions: 0,
        suspiciousDevices: []
      };
    }
  }

  private async getRecentUserSessions(userId: string, storage: any): Promise<SessionInfo[]> {
    // Get sessions from the last 24 hours
    const cutoffTime = new Date(Date.now() - this.SESSION_TIMEOUT_HOURS * 60 * 60 * 1000);
    
    // This would typically query the user_sessions table
    // For now, we'll use the storage interface we have
    const sessions = await storage.getUserSessions(userId, cutoffTime);
    return sessions || [];
  }

  private filterActiveSessions(sessions: SessionInfo[]): SessionInfo[] {
    const now = new Date();
    const activeThreshold = new Date(now.getTime() - this.SESSION_TIMEOUT_HOURS * 60 * 60 * 1000);
    
    return sessions.filter(session => 
      new Date(session.lastActive) > activeThreshold
    );
  }

  private analyzeDevicePatterns(sessions: SessionInfo[], currentDeviceId: string) {
    const uniqueDevices = new Set(sessions.map(s => s.deviceId));
    const uniqueIPs = new Set(sessions.map(s => s.ipAddress));
    const userAgents = sessions.map(s => s.userAgent);
    
    // Check for similar device fingerprints that might indicate device spoofing
    const suspiciousDevices: string[] = [];
    const deviceGroups = this.groupSimilarDevices(sessions);
    
    // If we have too many similar devices, it might be spoofing
    for (const group of deviceGroups) {
      if (group.length > 1 && group.some(s => s.deviceId !== currentDeviceId)) {
        suspiciousDevices.push(...group.map(s => s.deviceId));
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

  private groupSimilarDevices(sessions: SessionInfo[]): SessionInfo[][] {
    const groups: SessionInfo[][] = [];
    const processed = new Set<string>();

    for (const session of sessions) {
      if (processed.has(session.deviceId)) continue;

      const similarSessions = [session];
      processed.add(session.deviceId);

      // Find similar sessions based on device fingerprint similarity
      for (const otherSession of sessions) {
        if (otherSession.deviceId === session.deviceId || processed.has(otherSession.deviceId)) {
          continue;
        }

        const similarity = this.calculateDeviceSimilarity(session, otherSession);
        if (similarity > this.DEVICE_SIMILARITY_THRESHOLD) {
          similarSessions.push(otherSession);
          processed.add(otherSession.deviceId);
        }
      }

      groups.push(similarSessions);
    }

    return groups;
  }

  private calculateDeviceSimilarity(session1: SessionInfo, session2: SessionInfo): number {
    let score = 0;
    let factors = 0;

    // Compare user agents
    if (session1.userAgent === session2.userAgent) {
      score += 0.4;
    } else if (this.areSimilarUserAgents(session1.userAgent, session2.userAgent)) {
      score += 0.2;
    }
    factors++;

    // Compare IP addresses (same IP = higher similarity)
    if (session1.ipAddress === session2.ipAddress) {
      score += 0.3;
    } else if (this.areSimilarIPs(session1.ipAddress, session2.ipAddress)) {
      score += 0.1;
    }
    factors++;

    // If we have device fingerprint data, use it
    if (session1.deviceFingerprint && session2.deviceFingerprint) {
      const fingerprintSimilarity = this.compareDeviceFingerprints(
        session1.deviceFingerprint,
        session2.deviceFingerprint
      );
      score += fingerprintSimilarity * 0.3;
      factors++;
    }

    return score / factors;
  }

  private areSimilarUserAgents(ua1: string, ua2: string): boolean {
    // Extract browser and OS information
    const extractFeatures = (ua: string) => {
      const browser = ua.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/)?.[0] || '';
      const os = ua.match(/(Windows|Mac|Linux|Android|iOS)/)?.[0] || '';
      return { browser, os };
    };

    const features1 = extractFeatures(ua1);
    const features2 = extractFeatures(ua2);

    return features1.browser === features2.browser && features1.os === features2.os;
  }

  private areSimilarIPs(ip1: string, ip2: string): boolean {
    // Check if IPs are in the same subnet (simple check)
    const parts1 = ip1.split('.');
    const parts2 = ip2.split('.');
    
    if (parts1.length === 4 && parts2.length === 4) {
      // Same /24 subnet
      return parts1.slice(0, 3).join('.') === parts2.slice(0, 3).join('.');
    }
    
    return false;
  }

  private compareDeviceFingerprints(fp1: any, fp2: any): number {
    if (!fp1 || !fp2) return 0;

    let matches = 0;
    let total = 0;

    const compareFields = [
      'browser', 'os', 'screenResolution', 'timezone', 
      'language', 'platform', 'canvasFingerprint',
      'webglFingerprint', 'hardwareConcurrency'
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

  private analyzeUserAgentVariations(userAgents: string[]) {
    const uniqueUAs = new Set(userAgents);
    const browsers = new Set();
    const operatingSystems = new Set();

    for (const ua of userAgents) {
      // Extract browser
      const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge)/);
      if (browserMatch) browsers.add(browserMatch[1]);

      // Extract OS
      const osMatch = ua.match(/(Windows|Mac|Linux|Android|iOS)/);
      if (osMatch) operatingSystems.add(osMatch[1]);
    }

    return {
      uniqueUserAgents: uniqueUAs.size,
      uniqueBrowsers: browsers.size,
      uniqueOperatingSystems: operatingSystems.size
    };
  }

  private analyzeSimultaneousAccess(sessions: SessionInfo[]) {
    // Group sessions by time windows (5-minute intervals)
    const timeWindows = new Map<string, SessionInfo[]>();
    
    for (const session of sessions) {
      const windowKey = this.getTimeWindowKey(session.lastActive, 5); // 5-minute windows
      if (!timeWindows.has(windowKey)) {
        timeWindows.set(windowKey, []);
      }
      timeWindows.get(windowKey)!.push(session);
    }

    // Find windows with multiple sessions from different devices/IPs
    let simultaneousWindowsCount = 0;
    let maxSimultaneousSessions = 0;

    Array.from(timeWindows.entries()).forEach(([window, windowSessions]) => {
      const uniqueDevices = new Set(windowSessions.map((s: SessionInfo) => s.deviceId));
      const uniqueIPs = new Set(windowSessions.map((s: SessionInfo) => s.ipAddress));
      
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

  private getTimeWindowKey(date: Date, intervalMinutes: number): string {
    const time = new Date(date);
    const minutes = Math.floor(time.getMinutes() / intervalMinutes) * intervalMinutes;
    time.setMinutes(minutes, 0, 0);
    return time.toISOString();
  }

  private calculateSharingConfidence(
    deviceAnalysis: any,
    simultaneousAnalysis: any,
    sessionCount: number
  ): number {
    let confidence = 0;

    // Multiple unique devices increases confidence
    if (deviceAnalysis.uniqueDeviceCount > 2) {
      confidence += 0.3;
    }

    // Multiple unique IPs increases confidence
    if (deviceAnalysis.uniqueIPCount > 2) {
      confidence += 0.2;
    }

    // Simultaneous access from different devices
    if (simultaneousAnalysis.simultaneousWindowsCount > 0) {
      confidence += 0.4;
    }

    // Too many sessions
    if (sessionCount > this.MAX_ALLOWED_SESSIONS) {
      confidence += 0.5;
    }

    // Multiple browser/OS combinations
    if (deviceAnalysis.userAgentVariations.uniqueBrowsers > 2) {
      confidence += 0.2;
    }

    if (deviceAnalysis.userAgentVariations.uniqueOperatingSystems > 2) {
      confidence += 0.3;
    }

    // Suspicious device fingerprint similarity
    if (deviceAnalysis.suspiciousDevices.length > 0) {
      confidence += 0.6;
    }

    return Math.min(confidence, 1.0); // Cap at 1.0
  }

  private generateSharingReason(
    deviceAnalysis: any,
    simultaneousAnalysis: any,
    sessionCount: number
  ): string {
    const reasons: string[] = [];

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
      reasons.push('Simultaneous access from different locations');
    }

    if (deviceAnalysis.suspiciousDevices.length > 0) {
      reasons.push('Similar device fingerprints detected');
    }

    if (deviceAnalysis.userAgentVariations.uniqueBrowsers > 2) {
      reasons.push(`Multiple browsers (${deviceAnalysis.userAgentVariations.uniqueBrowsers})`);
    }

    return reasons.length > 0 ? reasons.join(', ') : 'Unusual access patterns detected';
  }

  // SPECIFIC ABUSE DETECTION METHODS

  // Detect if same account is logged in on different computers simultaneously (within 5 minutes)
  async detectSimultaneousMultipleComputers(userId: string, currentDeviceId: string, storage: any): Promise<{
    isSimultaneous: boolean;
    deviceCount: number;
    devices: string[];
  }> {
    try {
      // Get very recent sessions (last 5 minutes)
      const now = new Date();
      const recentCutoff = new Date(now.getTime() - this.SIMULTANEOUS_WINDOW_MINUTES * 60 * 1000);
      const recentSessions = await storage.getUserSessions(userId, recentCutoff);
      
      if (!recentSessions || recentSessions.length <= 1) {
        return { isSimultaneous: false, deviceCount: 0, devices: [] };
      }

      // Get unique devices from recent sessions
      const uniqueDevices = new Set(recentSessions.map((s: SessionInfo) => s.deviceId));
      const deviceList = Array.from(uniqueDevices);
      
      // If multiple DIFFERENT devices are active within 5 minutes, it's simultaneous usage
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
      console.error('Error detecting simultaneous computers:', error);
      return { isSimultaneous: false, deviceCount: 0, devices: [] };
    }
  }

  // Detect if same device has multiple free accounts open simultaneously
  async detectMultipleFreeAccountsOnDevice(currentDeviceId: string, storage: any): Promise<{
    hasMultipleFreeAccounts: boolean;
    freeAccountCount: number;
    userIds: string[];
  }> {
    try {
      // Get all recent sessions for this device across all users
      const now = new Date();
      const recentCutoff = new Date(now.getTime() - this.SIMULTANEOUS_WINDOW_MINUTES * 60 * 1000);
      const deviceSessions = await storage.getDeviceSessions(currentDeviceId, recentCutoff);
      
      if (!deviceSessions || deviceSessions.length <= 1) {
        return { hasMultipleFreeAccounts: false, freeAccountCount: 0, userIds: [] };
      }

      // Get unique user IDs from device sessions
      const uniqueUserIds = [...new Set(deviceSessions.map((s: any) => s.userId))];
      
      // Check which users are on free tier
      const freeUsers: string[] = [];
      for (const userId of uniqueUserIds) {
        const user = await storage.getUser(userId);
        if (user && user.subscriptionTier === 'free') {
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
      console.error('Error detecting multiple free accounts:', error);
      return { hasMultipleFreeAccounts: false, freeAccountCount: 0, userIds: [] };
    }
  }

  // Policy enforcement methods - TARGETED BLOCKING
  async enforcePolicy(
    userId: string,
    currentDeviceId: string,
    detectionResult: SharingDetectionResult,
    storage: any
  ): Promise<{ action: string; message: string; blocked?: boolean; sessionsTerminated?: number }> {
    // Check for SPECIFIC abuse scenarios only
    
    // Get user details to check subscription tier
    const user = await storage.getUser(userId);
    if (!user) {
      return { action: 'allow', message: 'User not found', blocked: false };
    }
    
    // Scenario 1: Same account on different computers simultaneously
    const simultaneousCheck = await this.detectSimultaneousMultipleComputers(userId, currentDeviceId, storage);
    
    // Only enforce for paid users with >3 devices, or free users with >5 devices
    // This prevents false positives from browser tabs, refreshes, dev tools, etc.
    const isPaidUser = user.subscriptionTier === 'starter_trader' || user.subscriptionTier === 'pro_trader';
    const deviceThreshold = isPaidUser ? 3 : 5;
    
    if (simultaneousCheck.isSimultaneous && simultaneousCheck.deviceCount > deviceThreshold) {
      console.log(`[ABUSE-BLOCKED] User ${userId} (${user.subscriptionTier}) has simultaneous sessions on ${simultaneousCheck.deviceCount} different devices (threshold: ${deviceThreshold}). Blocking access.`);
      
      // Terminate all sessions for this user
      await storage.terminateAllUserSessions(userId);
      
      await storage.logSuspiciousActivity(userId, 'simultaneous_multi_device_blocked', {
        deviceCount: simultaneousCheck.deviceCount,
        devices: simultaneousCheck.devices,
        subscriptionTier: user.subscriptionTier,
        action: 'all_sessions_terminated'
      });
      
      // Send email notification
      if (user.email) {
        await verificationService.sendAccountBlockedEmail(
          user.email,
          user.firstName || 'User',
          'Your account was detected being used on multiple devices simultaneously. This is not allowed per our terms of service.'
        );
      }
      
      return {
        action: 'terminate',
        message: 'Your account is being used on multiple devices simultaneously. All sessions have been terminated for security. Please check your email for details and log in again using only one device at a time. If you believe this was an error, please contact support@nextradinglabs.com',
        blocked: true,
        sessionsTerminated: simultaneousCheck.deviceCount
      };
    }
    
    // Scenario 2: Same device with multiple free accounts simultaneously
    const multipleFreeCheck = await this.detectMultipleFreeAccountsOnDevice(currentDeviceId, storage);
    
    if (multipleFreeCheck.hasMultipleFreeAccounts && multipleFreeCheck.freeAccountCount > 1) {
      console.log(`[ABUSE-BLOCKED] Device ${currentDeviceId} has ${multipleFreeCheck.freeAccountCount} free accounts active. Blocking access.`);
      
      // Get user details for email notification
      const user = await storage.getUser(userId);
      
      // Block this specific request
      await storage.logSuspiciousActivity(userId, 'multiple_free_accounts_blocked', {
        deviceId: currentDeviceId,
        freeAccountCount: multipleFreeCheck.freeAccountCount,
        userIds: multipleFreeCheck.userIds,
        action: 'access_blocked'
      });
      
      // Send email notification
      if (user && user.email) {
        await verificationService.sendAccountBlockedEmail(
          user.email,
          user.firstName || 'User',
          'Multiple free accounts were detected on your device. Our platform allows only one free account per device, or you can upgrade to a paid plan for multi-device access.'
        );
      }
      
      return {
        action: 'restrict',
        message: 'Multiple free accounts detected on this device. Please check your email for details. You can upgrade to a paid plan or use only one free account at a time. If you believe this was an error, please contact support@nextradinglabs.com',
        blocked: true
      };
    }
    
    // No specific abuse detected - allow access
    // Still log general sharing detection for monitoring
    if (detectionResult.isSharing) {
      await storage.logSuspiciousActivity(userId, 'sharing_detected_allowed', {
        confidence: detectionResult.confidence,
        reason: detectionResult.reason,
        activeSessions: detectionResult.activeSessions,
        enforcement: 'monitoring_only'
      });
      
      console.log(`[SHARING-DETECTED] General sharing patterns for user ${userId} (confidence: ${detectionResult.confidence}). No specific abuse - allowing access.`);
    }

    return { action: 'allow', message: 'Access allowed', blocked: false };
  }

  // Enhanced detection with immediate enforcement
  async detectAndEnforce(
    userId: string, 
    currentDeviceId: string, 
    ipAddress: string,
    userAgent: string,
    storage: any
  ): Promise<SharingDetectionResult> {
    try {
      // First update session activity
      await storage.updateSessionActivity(userId, currentDeviceId, ipAddress, userAgent);
      
      // Perform detection
      const detectionResult = await this.detectSharing(userId, currentDeviceId, storage);
      
      // Always enforce policy to check for specific abuse scenarios
      const enforcement = await this.enforcePolicy(userId, currentDeviceId, detectionResult, storage);
      detectionResult.enforcement = {
        action: enforcement.action as any,
        sessionsTerminated: enforcement.sessionsTerminated,
        blocked: enforcement.blocked
      };
      
      return detectionResult;
    } catch (error) {
      console.error('Error in detectAndEnforce:', error);
      return {
        isSharing: false,
        reason: 'Error during enforcement',
        confidence: 0,
        activeSessions: 0,
        suspiciousDevices: []
      };
    }
  }

  // Quick check for blocking requests
  async shouldBlockRequest(userId: string, currentDeviceId: string, storage: any): Promise<boolean> {
    try {
      const detectionResult = await this.detectSharing(userId, currentDeviceId, storage);
      return detectionResult.confidence >= 0.8;
    } catch (error) {
      console.error('Error in shouldBlockRequest:', error);
      return false; // Fail open for availability
    }
  }
}

export const sharingDetectionService = new SharingDetectionService();