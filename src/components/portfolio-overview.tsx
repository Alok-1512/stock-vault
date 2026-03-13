'use client';

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { PortfolioMetrics, ClosedTrade } from '@/lib/types';
import { formatCurrency, formatPercent, plColor } from '@/lib/format';
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
  metrics: PortfolioMetrics;
  closedTrades: ClosedTrade[];
}

export function PortfolioOverview({ metrics, closedTrades }: Props) {
  const cards = [
    {
      label: 'Total Invested',
      value: formatCurrency(metrics.totalInvestedCapital),
      icon: Wallet,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Portfolio Value',
      value: formatCurrency(metrics.currentPortfolioValue),
      icon: BarChart3,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      label: 'Unrealized P&L',
      value: formatCurrency(metrics.unrealizedPL),
      sub: formatPercent(metrics.unrealizedPLPercent),
      icon: metrics.unrealizedPL >= 0 ? TrendingUp : TrendingDown,
      color: metrics.unrealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400',
      bg: metrics.unrealizedPL >= 0 ? 'bg-emerald-400/10' : 'bg-red-400/10',
    },
    {
      label: 'Realized P&L',
      value: formatCurrency(metrics.realizedPL),
      icon: metrics.realizedPL >= 0 ? ArrowUpRight : ArrowDownRight,
      color: metrics.realizedPL >= 0 ? 'text-emerald-400' : 'text-red-400',
      bg: metrics.realizedPL >= 0 ? 'bg-emerald-400/10' : 'bg-red-400/10',
    },
    {
      label: 'Total Trades',
      value: metrics.totalTradesExecuted.toString(),
      icon: Activity,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      label: 'Net Taxable Gains',
      value: formatCurrency(metrics.netTaxableGains),
      icon: Target,
      color: metrics.netTaxableGains >= 0 ? 'text-emerald-400' : 'text-red-400',
      bg: metrics.netTaxableGains >= 0 ? 'bg-emerald-400/10' : 'bg-red-400/10',
    },
  ];

  // Monthly P&L chart data from closed trades
  const monthlyPL = new Map<string, number>();
  for (const ct of closedTrades) {
    const d = new Date(ct.sellDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyPL.set(key, (monthlyPL.get(key) || 0) + ct.profitLoss);
  }
  const chartData = Array.from(monthlyPL.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)
    .map(([month, pl]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-IN', {
        month: 'short',
        year: '2-digit',
      }),
      profit: pl >= 0 ? pl : 0,
      loss: pl < 0 ? pl : 0,
    }));

  // P&L summary pie
  const totalProfit = closedTrades.filter((ct) => ct.profitLoss >= 0).reduce((s, ct) => s + ct.profitLoss, 0);
  const totalLoss = Math.abs(closedTrades.filter((ct) => ct.profitLoss < 0).reduce((s, ct) => s + ct.profitLoss, 0));
  const pieData = [
    { name: 'Profit', value: totalProfit },
    { name: 'Loss', value: totalLoss },
  ].filter((d) => d.value > 0);
  const PIE_COLORS = ['#34d399', '#f87171'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className={`rounded-lg p-1.5 ${card.bg}`}>
                <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
              </div>
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <p className={`text-lg font-display font-bold ${card.color !== 'text-blue-400' && card.color !== 'text-purple-400' && card.color !== 'text-amber-400' ? plColor(parseFloat(card.value.replace(/[₹,CLr]/g, ''))) : ''}`}>
              {card.value}
            </p>
            {card.sub && (
              <span className={`text-xs ${plColor(metrics.unrealizedPLPercent)}`}>
                {card.sub}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {chartData.length > 0 && (
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-display font-semibold mb-4">Monthly P&L</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="profit" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="loss" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {pieData.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-display font-semibold mb-4">Profit vs Loss</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-muted-foreground">Profit: {formatCurrency(totalProfit)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="text-xs text-muted-foreground">Loss: {formatCurrency(totalLoss)}</span>
              </div>
            </div>
          </div>
        )}

        {chartData.length === 0 && pieData.length === 0 && (
          <div className="lg:col-span-3 rounded-xl border border-border bg-card p-12 text-center">
            <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Charts will appear once you have closed trades
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
