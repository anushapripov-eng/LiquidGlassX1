# TradeJournal

A professional trading journal application built with Next.js, React, and Tailwind CSS.

## Project Overview

TradeJournal helps traders track their trades, analyze performance, review mistakes, and grow as traders through a premium journaling experience.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components (Radix UI)
- **State Management**: Local state with Zustand (lib/store.ts)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Project Structure

- `app/` - Next.js App Router pages (layout.tsx, page.tsx)
- `components/` - React components
  - `sections/` - Main app sections (dashboard, trade log, analytics, etc.)
  - `ui/` - shadcn/ui component library
- `lib/` - Utility functions and store
- `hooks/` - Custom React hooks
- `public/` - Static assets

## Running the App

The app runs on port 5000 with host 0.0.0.0 for Replit compatibility.

```bash
npm run dev
```

## Features

- Authentication screen (login/register)
- Dashboard with trading overview
- Trade log for recording trades
- Analytics section with charts
- Trading calendar view
- Weekly performance view
- Mistakes tracker
- Trading rules
- News section
- Export functionality
- Dark/light theme support

## Deployment

Configured for autoscale deployment:
- Build: `npm run build`
- Run: `npm run start`
