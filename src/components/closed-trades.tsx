'use client';

import { useState } from 'react';
import type { ClosedTrade } from '@/lib/types';
import { formatCurrencyFull, formatDate, formatDays, plColor, plBg } from '@/lib/format';

interface Props {
  closedTrades: ClosedTrade[];
  uniqueStocks: { name: string; ticker: string }[];
}

export function ClosedTradesTable({ closedTrades, uniqueStocks }: Props) {
  const [stockFilter, setStockFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = closedTrades.filter((ct) => {
    if (stockFilter && ct.ticker !== stockFilter) return false;
    if (typeFilter && ct.tradeType !== typeFilter) return false;
    return true;
  });

  if (closedTrades.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">No closed trades yet. Sell some shares to see results here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Stocks</option>
          {uniqueStocks.map((s) => (
            <option key={s.ticker} value={s.ticker}>
              {s.name} ({s.ticker})
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Types</option>
          <option value="STCG">STCG</option>
          <option value="LTCG">LTCG</option>
        </select>
        <span className="text-xs text-muted-foreground self-center ml-2">
          {filtered.length} trade{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Buy Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Sell Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Qty</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Buy Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Sell Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Holding</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">P&L</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Type</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ct) => (
                <tr key={ct.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-sm">{ct.stockName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{ct.ticker}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(ct.buyDate)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(ct.sellDate)}</td>
                  <td className="px-4 py-3 text-right font-mono">{ct.quantity}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">₹{ct.buyPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono">₹{ct.sellPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-xs font-mono text-muted-foreground">
                    {formatDays(ct.holdingDays)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono font-semibold ${plColor(ct.profitLoss)}`}>
                      {formatCurrencyFull(ct.profitLoss)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        ct.tradeType === 'LTCG'
                          ? 'bg-purple-400/15 text-purple-400'
                          : 'bg-amber-400/15 text-amber-400'
                      }`}
                    >
                      {ct.tradeType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
