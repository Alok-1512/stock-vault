export interface Trade {
  id: string;
  stockName: string;
  ticker: string;
  tradeType: 'buy' | 'sell';
  quantity: number;
  price: number;
  date: string; // ISO date string
  notes?: string;
}

export interface ClosedTrade {
  id: string;
  stockName: string;
  ticker: string;
  buyDate: string;
  sellDate: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  holdingDays: number;
  profitLoss: number;
  tradeType: 'STCG' | 'LTCG';
}

export interface OpenPosition {
  stockName: string;
  ticker: string;
  totalShares: number;
  avgBuyPrice: number;
  totalInvested: number;
  currentPrice: number;
  currentValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  earliestBuyDate: string;
  lots: PositionLot[];
}

export interface PositionLot {
  tradeId: string;
  buyDate: string;
  quantity: number;
  price: number;
}

export interface CurrentPrices {
  [ticker: string]: number;
}

export interface TaxSummary {
  totalSTCGProfit: number;
  totalLTCGProfit: number;
  totalSTCGLoss: number;
  totalLTCGLoss: number;
  totalRealizedLosses: number;
  netSTCG: number;
  netLTCG: number;
  netRealizedGains: number;
  estimatedSTCGTax: number;
  estimatedLTCGTax: number;
  ltcgExemption: number;
  totalEstimatedTax: number;
}

export interface YearlyPerformance {
  year: number;
  totalTrades: number;
  totalProfit: number;
  totalLoss: number;
  netPL: number;
  cumulativePL: number;
}

export interface StockPerformance {
  stockName: string;
  ticker: string;
  totalTrades: number;
  totalBuys: number;
  totalSells: number;
  totalProfitLoss: number;
  avgHoldingDays: number;
  winRate: number;
  wins: number;
  losses: number;
}

export interface PortfolioMetrics {
  totalInvestedCapital: number;
  currentPortfolioValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  realizedPL: number;
  totalTradesExecuted: number;
  netTaxableGains: number;
  openPositionsCount: number;
  closedTradesCount: number;
}

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  year: string;
  quarter: string;
  month: string;
  stock: string;
}
