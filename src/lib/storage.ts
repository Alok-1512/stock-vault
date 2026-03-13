import type { Trade, CurrentPrices } from './types';

const TRADES_KEY = 'stockvault_trades';
const PRICES_KEY = 'stockvault_current_prices';

export function getTrades(): Trade[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(TRADES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTrades(trades: Trade[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
}

export function addTrade(trade: Trade): Trade[] {
  const trades = getTrades();
  trades.push(trade);
  saveTrades(trades);
  return trades;
}

export function deleteTrade(tradeId: string): Trade[] {
  const trades = getTrades().filter(t => t.id !== tradeId);
  saveTrades(trades);
  return trades;
}

export function getCurrentPrices(): CurrentPrices {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(PRICES_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveCurrentPrices(prices: CurrentPrices): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRICES_KEY, JSON.stringify(prices));
}

export function updateCurrentPrice(ticker: string, price: number): CurrentPrices {
  const prices = getCurrentPrices();
  prices[ticker] = price;
  saveCurrentPrices(prices);
  return prices;
}
