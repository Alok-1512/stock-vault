# StockVault — Indian Stock Portfolio & Trade Tracking Dashboard

A professional fintech-grade dashboard for Indian stock market investors to track purchases, sales, open positions, realized P&L, capital gains (STCG/LTCG), and tax implications.

![StockVault](https://img.shields.io/badge/StockVault-Portfolio%20Tracker-10b981?style=for-the-badge)

## Features

### Core Trading Features
- **Trade Logger** — Log buy and sell events with full validation
- **FIFO Lot Matching** — Automatic First-In-First-Out matching for sell orders
- **Open Positions** — Live portfolio with editable current prices, best/worst performer highlights
- **Closed Trades** — Complete history with STCG/LTCG classification, filterable by stock/date/type

### Tax & Capital Gains (Indian Rules)
- **STCG** — Short-Term Capital Gains (holding < 365 days) taxed at 20%
- **LTCG** — Long-Term Capital Gains (holding ≥ 365 days) taxed at 12.5% with ₹1.25L exemption
- **Tax Dashboard** — Full breakdown: gross gains, losses, net taxable, estimated tax payable
- **Yearly Tax Trends** — Track tax obligations across financial years

### Analytics & Insights
- **Portfolio Overview** — Metric cards, monthly P&L chart, profit vs loss pie
- **Performance Analytics** — Most profitable stock, biggest win/loss, win rate, avg holding period
- **Yearly Performance** — Year-by-year P&L with cumulative profit graph
- **Stock Insights** — Per-stock aggregate performance with P&L chart
- **Portfolio Allocation** — Pie chart showing concentration by stock
- **Holding Duration Insights** — Average/median holding time with distribution chart

### Utilities
- **Advanced Filters** — Filter by date range, year, quarter, month, specific stock
- **CSV Export** — Export trades, closed trades, positions, and tax summary
- **Dark/Light Mode** — Professional dark-first theme with light mode support
- **Trade Timeline** — Chronological log of all buy/sell events

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Charts**: Recharts
- **Fonts**: Space Grotesk + DM Sans
- **Storage**: Browser localStorage (zero setup, works offline)
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Storage

All data is stored in browser localStorage — no backend, no accounts, no setup required. Your trading data stays entirely on your device.

## Tax Disclaimer

Tax estimates are indicative only. Actual tax may vary based on your income slab, surcharge, cess, and other factors. Please consult a Chartered Accountant for accurate tax calculations.


