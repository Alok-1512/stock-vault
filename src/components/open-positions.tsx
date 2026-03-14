'use client';

import { useState, useEffect } from 'react';
import type { OpenPosition } from '@/lib/types';
import { formatCurrencyFull, formatPercent, formatDays, plColor } from '@/lib/format';
import { Input } from '@/components/ui/input';
import { ArrowUpRight, ArrowDownRight, Pencil, Check, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  positions: OpenPosition[];
  onUpdatePrice: (ticker: string, price: number) => void;
  onRefreshPrices?: () => void;
  pricesFetching?: boolean;
  lastPriceUpdate?: string | null;
}

export function OpenPositions({
  positions,
  onUpdatePrice,
  onRefreshPrices,
  pricesFetching = false,
  lastPriceUpdate = null,
}: Props) {
  const [editingTicker, setEditingTicker] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  function startEdit(ticker: string, currentPrice: number) {
    setEditingTicker(ticker);
    setEditPrice(currentPrice.toString());
  }

  function savePrice(ticker: string) {
    const p = parseFloat(editPrice);
    if (p > 0) onUpdatePrice(ticker, p);
    setEditingTicker(null);
  }

  const [now, setNow] = useState(() => 0);
  useEffect(() => {
    setNow(Date.now());
  }, [positions]);

  // Format the last update time
  const lastUpdateLabel = (() => {
    if (!lastPriceUpdate) return null;
    const elapsed = now - new Date(lastPriceUpdate).getTime();
    if (elapsed < 0 || isNaN(elapsed)) return 'just now';
    const mins = Math.floor(elapsed / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(lastPriceUpdate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  })();

  if (positions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">
          No open positions. Log a buy trade to get started.
        </p>
      </div>
    );
  }

  // Find best and worst
  const best = positions.reduce((a, b) =>
    a.unrealizedPLPercent > b.unrealizedPLPercent ? a : b
  );
  const worst = positions.reduce((a, b) =>
    a.unrealizedPLPercent < b.unrealizedPLPercent ? a : b
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Live price header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          {lastPriceUpdate ? (
            <div className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-semibold">LIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <WifiOff className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-semibold">MANUAL</span>
            </div>
          )}
          {lastUpdateLabel && (
            <span className="text-[10px] text-muted-foreground">
              Updated {lastUpdateLabel}
            </span>
          )}
        </div>
        {onRefreshPrices && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
            onClick={onRefreshPrices}
            disabled={pricesFetching}
          >
            <RefreshCw
              className={`h-3 w-3 ${pricesFetching ? 'animate-spin' : ''}`}
            />
            {pricesFetching ? 'Fetching...' : 'Refresh Prices'}
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                Stock
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                Shares
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                Avg Price
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                Invested
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                Current Price
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                Value
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                P&L
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                Holding
              </th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => {
              const isBest =
                pos.ticker === best.ticker && pos.unrealizedPLPercent > 0;
              const isWorst =
                pos.ticker === worst.ticker && pos.unrealizedPLPercent < 0;
              const daysSinceFirst = Math.floor(
                (now - new Date(pos.earliestBuyDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <tr
                  key={pos.ticker}
                  className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                    isBest
                      ? 'bg-emerald-500/5'
                      : isWorst
                        ? 'bg-red-500/5'
                        : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-semibold text-sm">{pos.stockName}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {pos.ticker}
                        </p>
                      </div>
                      {isBest && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/15 text-emerald-400 font-semibold">
                          BEST
                        </span>
                      )}
                      {isWorst && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-400/15 text-red-400 font-semibold">
                          WORST
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {pos.totalShares}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                    ₹{pos.avgBuyPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatCurrencyFull(pos.totalInvested)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingTicker === pos.ticker ? (
                      <div className="flex items-center gap-1 justify-end">
                        <Input
                          type="number"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-24 h-7 text-xs font-mono bg-secondary"
                          onKeyDown={(e) =>
                            e.key === 'Enter' && savePrice(pos.ticker)
                          }
                          autoFocus
                        />
                        <button
                          onClick={() => savePrice(pos.ticker)}
                          className="p-1 rounded hover:bg-muted"
                        >
                          <Check className="h-3 w-3 text-emerald-400" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(pos.ticker, pos.currentPrice)}
                        className="inline-flex items-center gap-1 font-mono hover:text-foreground text-muted-foreground transition-colors"
                      >
                        ₹{pos.currentPrice.toFixed(2)}
                        <Pencil className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatCurrencyFull(pos.currentValue)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {pos.unrealizedPL >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-400" />
                      )}
                      <span
                        className={`font-mono font-semibold ${plColor(pos.unrealizedPL)}`}
                      >
                        {formatCurrencyFull(pos.unrealizedPL)}
                      </span>
                    </div>
                    <p
                      className={`text-xs font-mono ${plColor(pos.unrealizedPLPercent)}`}
                    >
                      {formatPercent(pos.unrealizedPLPercent)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground font-mono">
                    {formatDays(daysSinceFirst)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
