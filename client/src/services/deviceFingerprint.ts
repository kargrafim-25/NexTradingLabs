export interface DeviceFingerprint {
  deviceId: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  screenResolution: string;
  timezone: string;
  language: string;
  userAgent: string;
  platform: string;
  hardwareConcurrency: number;
  colorDepth: number;
  timestamp: string;
}

class DeviceFingerprintService {
  private readonly STORAGE_KEY = 'device_fingerprint';

  private getBrowserInfo(): { browser: string; browserVersion: string } {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let browserVersion = 'Unknown';

    if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
      const match = ua.match(/Firefox\/(\d+\.\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
      browser = 'Chrome';
      const match = ua.match(/Chrome\/(\d+\.\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
      browser = 'Safari';
      const match = ua.match(/Version\/(\d+\.\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.indexOf('Edg') > -1) {
      browser = 'Edge';
      const match = ua.match(/Edg\/(\d+\.\d+)/);
      if (match) browserVersion = match[1];
    }

    return { browser, browserVersion };
  }

  private getOSInfo(): { os: string; osVersion: string } {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    let os = 'Unknown';
    let osVersion = 'Unknown';

    if (platform.indexOf('Win') > -1) {
      os = 'Windows';
      if (ua.indexOf('Windows NT 10') > -1) osVersion = '10';
      else if (ua.indexOf('Windows NT 11') > -1) osVersion = '11';
    } else if (platform.indexOf('Mac') > -1) {
      os = 'macOS';
      const match = ua.match(/Mac OS X (\d+[._]\d+)/);
      if (match) osVersion = match[1].replace('_', '.');
    } else if (platform.indexOf('Linux') > -1) {
      os = 'Linux';
    } else if (/Android/.test(ua)) {
      os = 'Android';
      const match = ua.match(/Android (\d+\.\d+)/);
      if (match) osVersion = match[1];
    } else if (/iPhone|iPad|iPod/.test(ua)) {
      os = 'iOS';
      const match = ua.match(/OS (\d+_\d+)/);
      if (match) osVersion = match[1].replace('_', '.');
    }

    return { os, osVersion };
  }

  private generateDeviceId(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset().toString(),
      screen.width + 'x' + screen.height,
      screen.colorDepth.toString(),
      navigator.hardwareConcurrency?.toString() || '0',
      navigator.platform
    ];

    const fingerprint = components.join('|');
    
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36) + Date.now().toString(36);
  }

  async getOrCreateFingerprint(): Promise<DeviceFingerprint> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse stored fingerprint, generating new one');
      }
    }

    const { browser, browserVersion } = this.getBrowserInfo();
    const { os, osVersion } = this.getOSInfo();

    const fingerprint: DeviceFingerprint = {
      deviceId: this.generateDeviceId(),
      browser,
      browserVersion,
      os,
      osVersion,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      colorDepth: screen.colorDepth,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(fingerprint));
    
    return fingerprint;
  }

  clearFingerprint(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const deviceFingerprintService = new DeviceFingerprintService();
