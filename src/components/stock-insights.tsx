'use client';

import type { StockPerformance } from '@/lib/types';
import { formatCurrency, formatCurrencyFull, formatDays, plColor } from '@/lib/format';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Props {
  stockPerformance: StockPerformance[];
}

export function StockInsights({ stockPerformance }: Props) {
  if (stockPerformance.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">
          Stock insights will appear once you have closed trades
        </p>
      </div>
    );
  }

  const sorted = [...stockPerformance].sort((a, b) => b.totalProfitLoss - a.totalProfitLoss);

  const chartData = sorted.map((s) => ({
    name: s.ticker,
    pl: s.totalProfitLoss,
  }));

  return (
    <div className="space-y-6">
      {/* Chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-display font-semibold mb-4">P&L by Stock</h3>
          <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40)}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'P&L']}
              />
              <Bar dataKey="pl" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.pl >= 0 ? '#34d399' : '#f87171'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detail cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((stock) => (
          <div key={stock.ticker} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-sm">{stock.stockName}</p>
                <p className="text-xs text-muted-foreground font-mono">{stock.ticker}</p>
              </div>
              {stock.totalProfitLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
            </div>

            <p className={`text-lg font-display font-bold mb-3 ${plColor(stock.totalProfitLoss)}`}>
              {formatCurrencyFull(stock.totalProfitLoss)}
            </p>

            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">Total Trades</span>
                <p className="font-mono font-semibold">{stock.totalTrades}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Win Rate</span>
                <p className={`font-mono font-semibold ${stock.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stock.winRate.toFixed(0)}%
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Holding</span>
                <p className="font-mono font-semibold">{formatDays(stock.avgHoldingDays)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">W/L</span>
                <p className="font-mono font-semibold">
                  <span className="text-emerald-400">{stock.wins}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-red-400">{stock.losses}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
