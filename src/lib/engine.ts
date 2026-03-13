import type {
  Trade,
  ClosedTrade,
  OpenPosition,
  PositionLot,
  CurrentPrices,
  TaxSummary,
  YearlyPerformance,
  StockPerformance,
  PortfolioMetrics,
  FilterState,
} from './types';
import { v4 as uuidv4 } from 'uuid';

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function daysSince(date: string): number {
  return daysBetween(date, new Date().toISOString().split('T')[0]);
}

// FIFO engine: processes all trades chronologically and produces open positions + closed trades
export function processTradesFIFO(trades: Trade[]): {
  openPositions: Map<string, PositionLot[]>;
  closedTrades: ClosedTrade[];
} {
  const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const positions = new Map<string, PositionLot[]>();
  const closedTrades: ClosedTrade[] = [];

  for (const trade of sorted) {
    const key = trade.ticker;
    if (trade.tradeType === 'buy') {
      const lots = positions.get(key) || [];
      lots.push({
        tradeId: trade.id,
        buyDate: trade.date,
        quantity: trade.quantity,
        price: trade.price,
      });
      positions.set(key, lots);
    } else {
      // Sell: match against FIFO lots
      let remaining = trade.quantity;
      const lots = positions.get(key) || [];

      while (remaining > 0 && lots.length > 0) {
        const lot = lots[0];
        const matched = Math.min(remaining, lot.quantity);
        const holdingDays = daysBetween(lot.buyDate, trade.date);
        const pl = (trade.price - lot.price) * matched;

        closedTrades.push({
          id: uuidv4(),
          stockName: trade.stockName,
          ticker: trade.ticker,
          buyDate: lot.buyDate,
          sellDate: trade.date,
          quantity: matched,
          buyPrice: lot.price,
          sellPrice: trade.price,
          holdingDays,
          profitLoss: pl,
          tradeType: holdingDays >= 365 ? 'LTCG' : 'STCG',
        });

        lot.quantity -= matched;
        remaining -= matched;

        if (lot.quantity <= 0) {
          lots.shift();
        }
      }

      positions.set(key, lots);
    }
  }

  return { openPositions: positions, closedTrades };
}

export function getOpenPositions(trades: Trade[], currentPrices: CurrentPrices): OpenPosition[] {
  const { openPositions } = processTradesFIFO(trades);
  const result: OpenPosition[] = [];

  // Build stock name map
  const nameMap = new Map<string, string>();
  for (const t of trades) {
    nameMap.set(t.ticker, t.stockName);
  }

  for (const [ticker, lots] of openPositions.entries()) {
    if (lots.length === 0) continue;

    const totalShares = lots.reduce((s, l) => s + l.quantity, 0);
    if (totalShares <= 0) continue;

    const totalInvested = lots.reduce((s, l) => s + l.price * l.quantity, 0);
    const avgBuyPrice = totalInvested / totalShares;
    const currentPrice = currentPrices[ticker] || avgBuyPrice;
    const currentValue = totalShares * currentPrice;
    const unrealizedPL = currentValue - totalInvested;
    const unrealizedPLPercent = totalInvested > 0 ? (unrealizedPL / totalInvested) * 100 : 0;
    const earliestBuyDate = lots.reduce(
      (min, l) => (l.buyDate < min ? l.buyDate : min),
      lots[0].buyDate
    );

    result.push({
      stockName: nameMap.get(ticker) || ticker,
      ticker,
      totalShares,
      avgBuyPrice,
      totalInvested,
      currentPrice,
      currentValue,
      unrealizedPL,
      unrealizedPLPercent,
      earliestBuyDate,
      lots,
    });
  }

  return result.sort((a, b) => b.totalInvested - a.totalInvested);
}

export function getClosedTrades(trades: Trade[]): ClosedTrade[] {
  const { closedTrades } = processTradesFIFO(trades);
  return closedTrades.sort((a, b) => new Date(b.sellDate).getTime() - new Date(a.sellDate).getTime());
}

export function calculateTaxSummary(closedTrades: ClosedTrade[]): TaxSummary {
  let totalSTCGProfit = 0;
  let totalLTCGProfit = 0;
  let totalSTCGLoss = 0;
  let totalLTCGLoss = 0;

  for (const ct of closedTrades) {
    if (ct.tradeType === 'STCG') {
      if (ct.profitLoss >= 0) totalSTCGProfit += ct.profitLoss;
      else totalSTCGLoss += Math.abs(ct.profitLoss);
    } else {
      if (ct.profitLoss >= 0) totalLTCGProfit += ct.profitLoss;
      else totalLTCGLoss += Math.abs(ct.profitLoss);
    }
  }

  const totalRealizedLosses = totalSTCGLoss + totalLTCGLoss;
  const netSTCG = totalSTCGProfit - totalSTCGLoss;
  const netLTCG = totalLTCGProfit - totalLTCGLoss;
  const netRealizedGains = netSTCG + netLTCG;

  // Indian Tax: STCG at 20%, LTCG at 12.5% with ₹1.25L exemption
  const LTCG_EXEMPTION = 125000;
  const estimatedSTCGTax = Math.max(0, netSTCG) * 0.20;
  const taxableLTCG = Math.max(0, netLTCG - LTCG_EXEMPTION);
  const estimatedLTCGTax = taxableLTCG * 0.125;

  return {
    totalSTCGProfit,
    totalLTCGProfit,
    totalSTCGLoss,
    totalLTCGLoss,
    totalRealizedLosses,
    netSTCG,
    netLTCG,
    netRealizedGains,
    estimatedSTCGTax,
    estimatedLTCGTax,
    ltcgExemption: LTCG_EXEMPTION,
    totalEstimatedTax: estimatedSTCGTax + estimatedLTCGTax,
  };
}

export function getPortfolioMetrics(
  trades: Trade[],
  currentPrices: CurrentPrices
): PortfolioMetrics {
  const openPos = getOpenPositions(trades, currentPrices);
  const closedTrades = getClosedTrades(trades);
  const taxSummary = calculateTaxSummary(closedTrades);

  const totalInvestedCapital = openPos.reduce((s, p) => s + p.totalInvested, 0);
  const currentPortfolioValue = openPos.reduce((s, p) => s + p.currentValue, 0);
  const unrealizedPL = currentPortfolioValue - totalInvestedCapital;
  const unrealizedPLPercent = totalInvestedCapital > 0 ? (unrealizedPL / totalInvestedCapital) * 100 : 0;
  const realizedPL = closedTrades.reduce((s, ct) => s + ct.profitLoss, 0);

  return {
    totalInvestedCapital,
    currentPortfolioValue,
    unrealizedPL,
    unrealizedPLPercent,
    realizedPL,
    totalTradesExecuted: trades.length,
    netTaxableGains: taxSummary.netRealizedGains,
    openPositionsCount: openPos.length,
    closedTradesCount: closedTrades.length,
  };
}

export function getYearlyPerformance(closedTrades: ClosedTrade[]): YearlyPerformance[] {
  const yearMap = new Map<number, { trades: number; profit: number; loss: number }>();

  for (const ct of closedTrades) {
    const year = new Date(ct.sellDate).getFullYear();
    const entry = yearMap.get(year) || { trades: 0, profit: 0, loss: 0 };
    entry.trades++;
    if (ct.profitLoss >= 0) entry.profit += ct.profitLoss;
    else entry.loss += Math.abs(ct.profitLoss);
    yearMap.set(year, entry);
  }

  const years = Array.from(yearMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, data]) => ({
      year,
      totalTrades: data.trades,
      totalProfit: data.profit,
      totalLoss: data.loss,
      netPL: data.profit - data.loss,
      cumulativePL: 0,
    }));

  let cumulative = 0;
  for (const y of years) {
    cumulative += y.netPL;
    y.cumulativePL = cumulative;
  }

  return years;
}

export function getStockPerformance(closedTrades: ClosedTrade[]): StockPerformance[] {
  const stockMap = new Map<
    string,
    {
      stockName: string;
      ticker: string;
      trades: number;
      buys: number;
      sells: number;
      pl: number;
      holdingDays: number[];
      wins: number;
      losses: number;
    }
  >();

  for (const ct of closedTrades) {
    const entry = stockMap.get(ct.ticker) || {
      stockName: ct.stockName,
      ticker: ct.ticker,
      trades: 0,
      buys: 0,
      sells: 0,
      pl: 0,
      holdingDays: [],
      wins: 0,
      losses: 0,
    };
    entry.trades++;
    entry.sells++;
    entry.pl += ct.profitLoss;
    entry.holdingDays.push(ct.holdingDays);
    if (ct.profitLoss >= 0) entry.wins++;
    else entry.losses++;
    stockMap.set(ct.ticker, entry);
  }

  return Array.from(stockMap.values()).map((s) => ({
    stockName: s.stockName,
    ticker: s.ticker,
    totalTrades: s.trades,
    totalBuys: s.buys,
    totalSells: s.sells,
    totalProfitLoss: s.pl,
    avgHoldingDays:
      s.holdingDays.length > 0
        ? Math.round(s.holdingDays.reduce((a, b) => a + b, 0) / s.holdingDays.length)
        : 0,
    winRate: s.trades > 0 ? (s.wins / s.trades) * 100 : 0,
    wins: s.wins,
    losses: s.losses,
  }));
}

export function getAvailableShares(trades: Trade[], ticker: string): number {
  const { openPositions } = processTradesFIFO(trades);
  const lots = openPositions.get(ticker) || [];
  return lots.reduce((s, l) => s + l.quantity, 0);
}

export function getUniqueStocks(trades: Trade[]): { name: string; ticker: string }[] {
  const map = new Map<string, string>();
  for (const t of trades) {
    map.set(t.ticker, t.stockName);
  }
  return Array.from(map.entries()).map(([ticker, name]) => ({ name, ticker }));
}

export function getHoldingDurationInsights(closedTrades: ClosedTrade[]): {
  avgDays: number;
  medianDays: number;
  distribution: { range: string; count: number }[];
} {
  if (closedTrades.length === 0) {
    return { avgDays: 0, medianDays: 0, distribution: [] };
  }

  const days = closedTrades.map((ct) => ct.holdingDays).sort((a, b) => a - b);
  const avgDays = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
  const medianDays = days[Math.floor(days.length / 2)];

  const ranges = [
    { range: '0-30 days', min: 0, max: 30 },
    { range: '31-90 days', min: 31, max: 90 },
    { range: '91-180 days', min: 91, max: 180 },
    { range: '181-365 days', min: 181, max: 365 },
    { range: '1-2 years', min: 366, max: 730 },
    { range: '2+ years', min: 731, max: Infinity },
  ];

  const distribution = ranges.map((r) => ({
    range: r.range,
    count: days.filter((d) => d >= r.min && d <= r.max).length,
  }));

  return { avgDays, medianDays, distribution };
}

export function filterTrades(trades: Trade[], filters: FilterState): Trade[] {
  return trades.filter((t) => {
    const date = new Date(t.date);
    if (filters.dateFrom && t.date < filters.dateFrom) return false;
    if (filters.dateTo && t.date > filters.dateTo) return false;
    if (filters.year && date.getFullYear().toString() !== filters.year) return false;
    if (filters.quarter) {
      const q = Math.ceil((date.getMonth() + 1) / 3);
      if (q.toString() !== filters.quarter) return false;
    }
    if (filters.month) {
      if ((date.getMonth() + 1).toString() !== filters.month) return false;
    }
    if (filters.stock && t.ticker !== filters.stock) return false;
    return true;
  });
}

export function filterClosedTrades(closedTrades: ClosedTrade[], filters: FilterState): ClosedTrade[] {
  return closedTrades.filter((ct) => {
    const sellDate = new Date(ct.sellDate);
    if (filters.dateFrom && ct.sellDate < filters.dateFrom) return false;
    if (filters.dateTo && ct.sellDate > filters.dateTo) return false;
    if (filters.year && sellDate.getFullYear().toString() !== filters.year) return false;
    if (filters.quarter) {
      const q = Math.ceil((sellDate.getMonth() + 1) / 3);
      if (q.toString() !== filters.quarter) return false;
    }
    if (filters.month) {
      if ((sellDate.getMonth() + 1).toString() !== filters.month) return false;
    }
    if (filters.stock && ct.ticker !== filters.stock) return false;
    return true;
  });
}

// Helper to get unique years from trades
export function getTradeYears(trades: Trade[]): number[] {
  const years = new Set(trades.map((t) => new Date(t.date).getFullYear()));
  return Array.from(years).sort((a, b) => b - a);
}

// Get performance analytics
export function getPerformanceAnalytics(closedTrades: ClosedTrade[]) {
  if (closedTrades.length === 0) {
    return {
      mostProfitableStock: null,
      biggestLosingTrade: null,
      biggestWinningTrade: null,
      winCount: 0,
      lossCount: 0,
      winRate: 0,
      avgHoldingPeriod: 0,
      avgTradeProfit: 0,
      totalTrades: 0,
    };
  }

  // Most profitable stock (aggregate)
  const stockPL = new Map<string, { name: string; pl: number }>();
  for (const ct of closedTrades) {
    const entry = stockPL.get(ct.ticker) || { name: ct.stockName, pl: 0 };
    entry.pl += ct.profitLoss;
    stockPL.set(ct.ticker, entry);
  }
  const mostProfitableStock = Array.from(stockPL.entries())
    .sort((a, b) => b[1].pl - a[1].pl)[0];

  const biggestWinningTrade = [...closedTrades].sort((a, b) => b.profitLoss - a.profitLoss)[0];
  const biggestLosingTrade = [...closedTrades].sort((a, b) => a.profitLoss - b.profitLoss)[0];

  const winCount = closedTrades.filter((ct) => ct.profitLoss >= 0).length;
  const lossCount = closedTrades.filter((ct) => ct.profitLoss < 0).length;
  const winRate = (winCount / closedTrades.length) * 100;
  const avgHoldingPeriod = Math.round(
    closedTrades.reduce((s, ct) => s + ct.holdingDays, 0) / closedTrades.length
  );
  const avgTradeProfit = closedTrades.reduce((s, ct) => s + ct.profitLoss, 0) / closedTrades.length;

  return {
    mostProfitableStock: mostProfitableStock
      ? { ticker: mostProfitableStock[0], ...mostProfitableStock[1] }
      : null,
    biggestLosingTrade,
    biggestWinningTrade,
    winCount,
    lossCount,
    winRate,
    avgHoldingPeriod,
    avgTradeProfit,
    totalTrades: closedTrades.length,
  };
}
