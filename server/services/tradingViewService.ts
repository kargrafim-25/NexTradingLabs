import { format, addDays, subDays } from 'date-fns';
import axios from 'axios';

interface TradingViewEvent {
  id: string;
  title: string;
  country: string;
  date: number; // Unix timestamp
  impact: number; // -1=holiday, 1=low, 2=medium, 3=high
  forecast: string;
  previous: string;
  actual: string;
  currency?: string;
}

interface ParsedNewsEvent {
  id: string;
  title: string;
  description: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF';
  impact: 'low' | 'medium' | 'high';
  eventTime: Date;
  actualValue?: string;
  forecastValue?: string;
  previousValue?: string;
  source: string;
  sourceUrl: string;
}

export class TradingViewService {
  private baseUrl = 'https://economic-calendar.tradingview.com/events';
  private cache: Map<string, { data: ParsedNewsEvent[], timestamp: number }> = new Map();
  private cacheExpiry = 10 * 60 * 1000; // 10 minutes cache

  // Economic event categories mapping
  private categoryKeywords = {
    'Growth': ['gdp', 'economic growth', 'industrial production', 'manufacturing pmi', 'services pmi', 'composite pmi', 'business activity', 'production index'],
    'Inflation': ['cpi', 'ppi', 'inflation', 'price index', 'core inflation', 'pce price', 'deflator'],
    'Employment': ['employment', 'payroll', 'nfp', 'jobless', 'unemployment', 'job', 'labor', 'wage', 'earnings', 'ada nonfarm'],
    'Central Bank': ['fomc', 'fed', 'federal reserve', 'interest rate', 'rate decision', 'monetary policy', 'fed chair', 'meeting minutes', 'beige book'],
    'Bonds': ['treasury', 'bond', 'yield', 'auction', 'note sale', 'govt bonds'],
    'Housing': ['housing', 'home', 'building permit', 'construction', 'mortgage', 'house price', 'existing home', 'new home', 'pending home'],
    'Consumer Surveys': ['consumer confidence', 'consumer sentiment', 'consumer expectations', 'michigan sentiment', 'cb consumer'],
    'Business Surveys': ['business confidence', 'business sentiment', 'ism', 'purchasing managers', 'manufacturing index', 'nahb', 'business optimism'],
    'Speeches': ['speech', 'speaks', 'testimony', 'comments', 'remarks', 'press conference', 'powell', 'yellen'],
    'Misc': [] // Catch-all for other economic events
  };

  private async fetchEconomicCalendar(fromDate: Date, toDate: Date): Promise<TradingViewEvent[]> {
    try {
      const fromISO = fromDate.toISOString();
      const toISO = toDate.toISOString();

      const url = `${this.baseUrl}`;
      const params = {
        from: fromISO,
        to: toISO,
        countries: 'US', // Only United States
        minImportance: 1, // Low=0, Medium=1, High=2 (we'll filter to medium/high later)
      };

      console.log(`[TradingView] Fetching economic calendar from ${fromISO} to ${toISO}`);

      const response = await axios.get(url, {
        params,
        headers: {
          'Origin': 'https://www.tradingview.com',
          'Referer': 'https://www.tradingview.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        timeout: 15000,
      });

      if (response.data && response.data.result) {
        console.log(`[TradingView] Fetched ${response.data.result.length} events`);
        return response.data.result;
      }

      console.log('[TradingView] No events found in response');
      return [];
    } catch (error: any) {
      console.error('[TradingView] Failed to fetch economic calendar:', error.message);
      return [];
    }
  }

  private categorizeEvent(title: string): string {
    const lowerTitle = title.toLowerCase();
    
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (category === 'Misc') continue; // Check this last
      
      for (const keyword of keywords) {
        if (lowerTitle.includes(keyword)) {
          return category;
        }
      }
    }
    
    return 'Misc'; // Default category
  }

  private mapImpact(impactLevel: number | undefined, title: string): 'low' | 'medium' | 'high' {
    // If impact level is explicitly provided
    if (impactLevel !== undefined) {
      if (impactLevel >= 3) return 'high';
      if (impactLevel === 2) return 'medium';
      if (impactLevel === 1) return 'low';
    }
    
    // If undefined, infer impact from event title (important economic indicators)
    const lowerTitle = title.toLowerCase();
    const highImpactKeywords = [
      'nfp', 'non-farm', 'payroll', 'unemployment', 'cpi', 'inflation', 'gdp',
      'fomc', 'interest rate', 'fed chair', 'powell', 'retail sales', 'ppi',
      'consumer confidence', 'ism', 'pmi', 'housing starts', 'building permits'
    ];
    
    const mediumImpactKeywords = [
      'home sales', 'durable goods', 'factory orders', 'trade balance',
      'jobless claims', 'consumer sentiment', 'business confidence'
    ];
    
    // Check for high impact
    if (highImpactKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return 'high';
    }
    
    // Check for medium impact
    if (mediumImpactKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  private parseEvents(events: TradingViewEvent[]): ParsedNewsEvent[] {
    const parsedEvents: ParsedNewsEvent[] = [];

    for (const event of events) {
      try {
        const impact = this.mapImpact(event.impact, event.title);
        
        // Filter: Only high and medium impact events
        if (impact === 'low') {
          continue;
        }

        // Filter: Only events from major USD economic categories
        const category = this.categorizeEvent(event.title);
        const isMajorCategory = category !== 'Misc' || this.isRelevantMiscEvent(event.title);
        
        if (!isMajorCategory) {
          continue;
        }

        // Handle different date formats from TradingView
        let eventTime: Date;
        if (typeof event.date === 'number') {
          // Unix timestamp (try both seconds and milliseconds)
          eventTime = event.date > 10000000000 
            ? new Date(event.date) 
            : new Date(event.date * 1000);
        } else if (typeof event.date === 'string') {
          // ISO string
          eventTime = new Date(event.date);
        } else {
          continue;
        }
        
        // Validate the date
        if (isNaN(eventTime.getTime())) {
          continue;
        }
        
        parsedEvents.push({
          id: `tv-${event.id}`,
          title: event.title,
          description: `${category}: ${event.title}`,
          currency: 'USD',
          impact,
          eventTime,
          actualValue: event.actual || undefined,
          forecastValue: event.forecast || undefined,
          previousValue: event.previous || undefined,
          source: 'TradingView',
          sourceUrl: 'https://www.tradingview.com/economic-calendar/',
        });
      } catch (error) {
        console.error('[TradingView] Error parsing event:', error);
      }
    }

    return parsedEvents;
  }

  private isRelevantMiscEvent(title: string): boolean {
    // Allow some miscellaneous economic events that are still important
    const relevantMiscKeywords = [
      'trade balance',
      'retail sales',
      'wholesale',
      'current account',
      'budget',
      'deficit',
      'surplus',
      'import',
      'export',
      'durable goods',
      'factory orders',
      'inventory',
      'crude oil',
      'philadelphia fed',
      'empire state',
      'chicago pmi',
      'kansas city fed',
      'dallas fed',
      'richmond fed',
    ];

    const lowerTitle = title.toLowerCase();
    return relevantMiscKeywords.some(keyword => lowerTitle.includes(keyword));
  }

  async getUpcomingNews(limit: number = 10): Promise<ParsedNewsEvent[]> {
    const cacheKey = 'upcoming';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log('[TradingView] Returning cached upcoming events');
      return cached.data.slice(0, limit);
    }

    try {
      const now = new Date();
      const futureDate = addDays(now, 14); // Get 2 weeks ahead

      const events = await this.fetchEconomicCalendar(now, futureDate);
      const parsedEvents = this.parseEvents(events);

      // Filter for upcoming events only
      const upcomingEvents = parsedEvents
        .filter(event => event.eventTime > now)
        .sort((a, b) => a.eventTime.getTime() - b.eventTime.getTime())
        .slice(0, limit);

      this.cache.set(cacheKey, { data: upcomingEvents, timestamp: Date.now() });
      console.log(`[TradingView] Returning ${upcomingEvents.length} upcoming events`);

      return upcomingEvents;
    } catch (error) {
      console.error('[TradingView] Error getting upcoming news:', error);
      return [];
    }
  }

  async getRecentNews(limit: number = 10): Promise<ParsedNewsEvent[]> {
    const cacheKey = 'recent';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log('[TradingView] Returning cached recent events');
      return cached.data.slice(0, limit);
    }

    try {
      const now = new Date();
      const pastDate = subDays(now, 7); // Get last 7 days

      const events = await this.fetchEconomicCalendar(pastDate, now);
      const parsedEvents = this.parseEvents(events);

      // Filter for recent events only (already occurred)
      const recentEvents = parsedEvents
        .filter(event => event.eventTime <= now)
        .sort((a, b) => b.eventTime.getTime() - a.eventTime.getTime())
        .slice(0, limit);

      this.cache.set(cacheKey, { data: recentEvents, timestamp: Date.now() });
      console.log(`[TradingView] Returning ${recentEvents.length} recent events`);

      return recentEvents;
    } catch (error) {
      console.error('[TradingView] Error getting recent news:', error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
    console.log('[TradingView] Cache cleared');
  }
}

export const tradingViewService = new TradingViewService();
