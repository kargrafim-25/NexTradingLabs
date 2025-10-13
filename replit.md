# NTL Trading Platform

## Overview

NTL (Next Trading Labs) is a professional AI-powered trading platform that provides real-time XAUUSD (Gold) trading signals using OpenAI's GPT technology. The platform features a comprehensive subscription system with tiered access levels, credit management, live market analysis, and integrated TradingView charts. It offers both independent authentication and optional Replit integration, with robust security measures including account sharing detection and rate limiting. The project aims to provide a reliable and feature-rich trading assistant experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite.
- **UI Library**: Shadcn/ui components built on Radix UI.
- **Styling**: Tailwind CSS with a custom design system.
- **State Management**: TanStack Query for server state, local React state for UI.
- **Routing**: Wouter for client-side routing.
- **Charts**: TradingView widget integration.
- **UI/UX Decisions**: Professional design with a clean aesthetic, dark theme configuration, responsive layouts, and intuitive navigation. Features like collapsible sections, compact info displays, and clear CTAs are prioritized.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript.
- **Database**: PostgreSQL with Drizzle ORM.
- **Session Management**: Express sessions with PostgreSQL store.
- **Authentication**: Dual system supporting independent auth (bcrypt) and optional Replit Auth.
- **Security**: Comprehensive middleware stack including helmet, CORS, rate limiting, and advanced account sharing detection.

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect.
- **Schema Structure**: Users (with subscription tiers, credits), trading signals (with lifecycle management), economic news, security events, session tracking, password reset tokens, rate limiting, and verification token storage.

### Authentication & Security
- **Multi-tier Authentication**: Independent bcrypt-based auth with optional Replit integration.
- **Session Security**: HTTP-only cookies, secure flags, SameSite protection.
- **Account Protection**: Login attempt limiting, account lockout, email/phone verification, password strength validation.
- **Sharing Detection**: Advanced device fingerprinting and session analysis with configurable thresholds and onboarding bypass.
- **Rate Limiting**: Granular limits for signal generation, verification sends, and API access.
- **Admin Access**: Admin users bypass sharing detection.

### API Architecture
- **RESTful Design**: Structured endpoints with proper HTTP status codes.
- **Request Validation**: Zod schemas for type-safe input validation.
- **Error Handling**: Comprehensive error responses.
- **Logging**: Detailed API logging for signals and security events.

### Signal Generation System
- **AI Integration**: OpenAI GPT for real-time market analysis.
- **Timeframe Support**: Multiple timeframes (5M, 15M, 30M, 1H, 4H, 1D, 1W).
- **Market Hours**: Validation against live gold market trading hours.
- **Lifecycle Management**: Automatic signal status transitions.
- **Performance Tracking**: User feedback system for signal effectiveness.

### Subscription System
- **Tiers**: Free (limited), Starter Trader, Pro Trader, Admin.
- **Credit Management**: Daily/monthly limits with automatic resets.
- **Feature Gating**: Progressive feature access based on subscription level.
- **Cooldowns**: Configurable signal generation cooldowns per tier (Free: 90 min, Starter: 30 min, Pro: 15 min, Admin: No cooldown).
- **Billing**: Includes payment request system with WhatsApp integration, discount handling, and grace periods for renewals. Automated subscription expiry checks and reminders are implemented.
- **User Management**: Avatar persistence with React Query cache invalidation ensuring avatars persist across sessions, password reset flow.

### Communication & Support
- **Contact Form**: Dedicated contact page with type selector (Support, General) and email forwarding to support.
- **Notifications**: Renewal reminders, grace period warnings.

## External Dependencies

### Core Services
- **OpenAI API**: GPT models for trading signal generation.
- **Brevo (formerly Sendinblue)**: Transactional email and SMS verification, contact form email delivery.
- **PostgreSQL**: Primary database.
- **TradingView**: Embedded chart widgets for live market data.

### Development & Build Tools
- **Vite**: Frontend build tool.
- **TypeScript**: Type safety.
- **Drizzle Kit**: Database migrations and schema management.

### UI & Styling Dependencies
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **React Hook Form**: Form state management with validation.

### Monitoring & Analytics
- **Custom Logging**: File-based logging for signals and security events.

### Economic News Integration
- **TradingView Economic Calendar API**: Primary source for real-time economic calendar events (FREE, no API key required).
  - Provides USD economic events with automatic impact detection
  - Categories: Growth, Inflation, Employment, Central Bank, Bonds, Housing, Consumer Surveys, Business Surveys, Speeches, Misc
  - Filters: High and medium impact events only
  - Updates: 10-minute cache with real-time data from TradingView
  - Coverage: 2 weeks upcoming events, 7 days recent events

### Legacy/Backup Integrations
- **Alpha Vantage API**: Backup financial news (currently not used for economic calendar).
- **Forex Factory**: Economic calendar scraping (deprecated due to blocking issues).
- **SendGrid**: Alternative email service provider.