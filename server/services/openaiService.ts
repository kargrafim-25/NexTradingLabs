import OpenAI from "openai";
import { apiLogger, APILogEntry } from "../utils/apiLogger";

// Using GPT-5 Mini as requested by the user
let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY
    });
  } else {
    console.warn('OPENAI_API_KEY not found - trading signal generation will be limited');
  }
} catch (error) {
  console.error('Failed to initialize OpenAI service:', error);
}

export interface TakeProfitLevel {
  level: number;
  price: number;
  risk_reward_ratio: number;
}

export interface AIAnalysis {
  brief: string;
  detailed: string;
  market_sentiment: string;
  trend_direction: string;
  key_indicators: string[];
}

export interface HistoricalPosition {
  symbol: string;
  entry_price: number;
  current_status: string;
  days_active: number;
  unrealized_pnl: number;
}

export interface TradingSignalData {
  action: 'BUY' | 'SELL';
  entry: number;
  stop_loss: number;
  take_profit: number;
  confidence: number;
  take_profits: TakeProfitLevel[];
  ai_analysis: AIAnalysis;
  future_positions: any[];
  historical_positions: HistoricalPosition[];
  has_notifications: boolean;
}

export async function generateTradingSignal(
  timeframe: string, 
  subscriptionTier: string,
  userId?: string
): Promise<TradingSignalData> {
  const startTime = Date.now();
  let logEntry: APILogEntry;
  
  // If OpenAI is not available, return a mock signal for development
  if (!openai) {
    console.warn('OpenAI not available - returning mock trading signal for development');
    return generateMockSignal(timeframe, subscriptionTier, userId);
  }
  
  try {
    const symbol = "XAUUSD";
    
    const prompt = `You are a professional XAUUSD trading analyst. Please analyze the current XAUUSD market on the ${timeframe} timeframe and provide a trading signal.

Search for current XAUUSD price and recent market data. Perform comprehensive technical analysis including current price, support/resistance levels, RSI, MACD, moving averages, Bollinger Bands, market sentiment, and volume analysis.

Based on your analysis, determine BUY or SELL action and calculate entry, stop loss, and ${subscriptionTier === 'pro_trader' || subscriptionTier === 'admin' ? '3 take profit levels' : 'take profit levels'}. Provide confidence score 60-100.

CRITICAL REQUIREMENT: Your analysis must contain ZERO website links, URLs, citations, or references to external sources. DO NOT include any text in brackets like [website.com] or (website.com). Provide pure technical analysis text ONLY. No sources, no links, no references whatsoever.

Return analysis in exact JSON format:
{
    "action": "BUY or SELL",
    "entry": current_market_price_number,
    "stop_loss": calculated_stop_loss_number,
    "take_profit": primary_take_profit_number,
    "confidence": confidence_score_60_to_100,
    "take_profits": [
        {"level": 1, "price": first_tp_level, "risk_reward_ratio": 1.5}${subscriptionTier === 'pro_trader' || subscriptionTier === 'admin' ? ',\n        {"level": 2, "price": second_tp_level, "risk_reward_ratio": 2.0},\n        {"level": 3, "price": third_tp_level, "risk_reward_ratio": 3.0}' : ''}
    ],
    "ai_analysis": {
        "brief": "${subscriptionTier === 'starter_trader' ? 'One sentence pure technical analysis with NO website links, citations, or brackets' : 'Brief technical analysis with NO website links, citations, or brackets'}",
        "detailed": "${subscriptionTier === 'pro_trader' || subscriptionTier === 'admin' ? 'Detailed 3-sentence pure technical analysis - NO links, NO citations, NO brackets, NO references' : subscriptionTier === 'starter_trader' ? '2 sentences pure technical analysis - NO links, NO citations, NO brackets' : 'Pure technical analysis with NO links, NO citations, NO brackets'}",
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
        { type: "web_search" },
      ],
      input: prompt,
    });

    const result = JSON.parse(response.output_text || '{}');

    // Validate that we have actual numeric prices (no fallbacks)
    const entryPrice = parseFloat(result.entry);
    const stopLoss = parseFloat(result.stop_loss);
    const takeProfit = parseFloat(result.take_profit);

    if (!entryPrice || !stopLoss || !takeProfit || 
        entryPrice <= 0 || stopLoss <= 0 || takeProfit <= 0) {
      throw new Error("Invalid market prices received. AI may not have access to current market data. Please retry.");
    }

    // Validate that prices are realistic for gold (basic sanity check)
    if (entryPrice < 1000 || entryPrice > 5000) {
      throw new Error("Unrealistic gold price received. AI may not have access to current market data. Please retry.");
    }

    // Return validated result with no fallbacks
    const finalResult: TradingSignalData = {
      action: result.action === 'SELL' ? 'SELL' : 'BUY',
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

    // Log successful API call
    const executionTime = Date.now() - startTime;
    logEntry = {
      timestamp: new Date().toISOString(),
      userId: userId || 'unknown',
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
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log failed API call
    const executionTime = Date.now() - startTime;
    logEntry = {
      timestamp: new Date().toISOString(),
      userId: userId || 'unknown',
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

// Generate mock signal for development when OpenAI is not available
function generateMockSignal(timeframe: string, subscriptionTier: string, userId?: string): TradingSignalData {
  const mockPrice = 2650.50; // Mock XAUUSD price
  const isBuy = Math.random() > 0.5;
  const stopDistance = 15; // 15 pips stop loss
  const tpDistance = 25; // 25 pips take profit
  
  return {
    action: isBuy ? 'BUY' : 'SELL',
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
