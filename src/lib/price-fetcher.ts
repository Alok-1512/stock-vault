import type { CurrentPrices } from './types';

interface PriceResponse {
  prices: CurrentPrices;
  failed: string[];
  fetchedAt: string;
}

const LAST_UPDATED_KEY = 'stockvault_prices_updated';

export async function fetchLivePrices(tickers: string[]): Promise<PriceResponse> {
  if (tickers.length === 0) {
    return { prices: {}, failed: [], fetchedAt: new Date().toISOString() };
  }

  const res = await fetch('/api/prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tickers }),
  });

  if (!res.ok) {
    throw new Error(`Price fetch failed: ${res.status}`);
  }

  return res.json();
}

export function getLastPriceUpdate(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LAST_UPDATED_KEY);
}

export function setLastPriceUpdate(isoDate: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_UPDATED_KEY, isoDate);
}

export function isPriceStale(maxAgeMs: number = 5 * 60 * 1000): boolean {
  const last = getLastPriceUpdate();
  if (!last) return true;
  return Date.now() - new Date(last).getTime() > maxAgeMs;
}
