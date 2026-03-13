'use client';

import type { ClosedTrade } from '@/lib/types';
import { getPerformanceAnalytics } from '@/lib/engine';
import { formatCurrency, formatCurrencyFull, formatDays, plColor } from '@/lib/format';
import {
  Trophy,
  Skull,
  Target,
  Clock,
  TrendingUp,
  Percent,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Props {
  closedTrades: ClosedTrade[];
}

export function PerformanceAnalytics({ closedTrades }: Props) {
  const analytics = getPerformanceAnalytics(closedTrades);

  if (closedTrades.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">
          Performance analytics will appear once you have closed trades
        </p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Most Profitable Stock',
      value: analytics.mostProfitableStock
        ? `${analytics.mostProfitableStock.name}`
        : 'N/A',
      sub: analytics.mostProfitableStock
        ? formatCurrencyFull(analytics.mostProfitableStock.pl)
        : '',
      icon: Trophy,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      label: 'Biggest Win',
      value: analytics.biggestWinningTrade
        ? analytics.biggestWinningTrade.stockName
        : 'N/A',
      sub: analytics.biggestWinningTrade
        ? formatCurrencyFull(analytics.biggestWinningTrade.profitLoss)
        : '',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      label: 'Biggest Loss',
      value: analytics.biggestLosingTrade
        ? analytics.biggestLosingTrade.stockName
        : 'N/A',
      sub: analytics.biggestLosingTrade
        ? formatCurrencyFull(analytics.biggestLosingTrade.profitLoss)
        : '',
      icon: Skull,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
    },
    {
      label: 'Win Rate',
      value: `${analytics.winRate.toFixed(1)}%`,
      sub: `${analytics.winCount}W / ${analytics.lossCount}L`,
      icon: Target,
      color: analytics.winRate >= 50 ? 'text-emerald-400' : 'text-red-400',
      bg: analytics.winRate >= 50 ? 'bg-emerald-400/10' : 'bg-red-400/10',
    },
    {
      label: 'Avg Holding Period',
      value: formatDays(analytics.avgHoldingPeriod),
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Avg Trade Profit',
      value: formatCurrency(analytics.avgTradeProfit),
      icon: Percent,
      color: analytics.avgTradeProfit >= 0 ? 'text-emerald-400' : 'text-red-400',
      bg: analytics.avgTradeProfit >= 0 ? 'bg-emerald-400/10' : 'bg-red-400/10',
    },
  ];

  // Win/Loss pie
  const winLossPie = [
    { name: 'Wins', value: analytics.winCount },
    { name: 'Losses', value: analytics.lossCount },
  ].filter((d) => d.value > 0);

  // Top 10 trades by P&L for bar chart
  const topTrades = [...closedTrades]
    .sort((a, b) => Math.abs(b.profitLoss) - Math.abs(a.profitLoss))
    .slice(0, 10)
    .map((ct) => ({
      name: `${ct.ticker} (${ct.quantity})`,
      pl: ct.profitLoss,
    }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className={`rounded-lg p-1.5 ${card.bg}`}>
                <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
              </div>
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <p className="text-base font-display font-bold truncate">{card.value}</p>
            {card.sub && (
              <span className="text-xs text-muted-foreground">{card.sub}</span>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Win/Loss Pie */}
        {winLossPie.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-display font-semibold mb-4">Win vs Loss Ratio</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={winLossPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  <Cell fill="#34d399" />
                  <Cell fill="#f87171" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Trades Bar */}
        {topTrades.length > 0 && (
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-display font-semibold mb-4">Top Trades by P&L</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topTrades} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  width={90}
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
                <Bar
                  dataKey="pl"
                  radius={[0, 4, 4, 0]}
                  fill="#34d399"
                >
                  {topTrades.map((entry, i) => (
                    <Cell key={i} fill={entry.pl >= 0 ? '#34d399' : '#f87171'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
