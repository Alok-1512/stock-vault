'use client';

import type { YearlyPerformance as YearlyPerf } from '@/lib/types';
import { formatCurrency, formatCurrencyFull, plColor } from '@/lib/format';
import { Calendar, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';

interface Props {
  yearlyData: YearlyPerf[];
}

export function YearlyPerformance({ yearlyData }: Props) {
  if (yearlyData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Calendar className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">
          Yearly performance will appear once you have closed trades
        </p>
      </div>
    );
  }

  const chartData = yearlyData.map((y) => ({
    year: y.year.toString(),
    profit: y.totalProfit,
    loss: -y.totalLoss,
    net: y.netPL,
    cumulative: y.cumulativePL,
  }));

  return (
    <div className="space-y-6">
      {/* Year cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {yearlyData.map((y) => (
          <div key={y.year} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">FY {y.year}</p>
            <p className={`text-lg font-display font-bold ${plColor(y.netPL)}`}>
              {formatCurrency(y.netPL)}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>{y.totalTrades} trades</span>
              <span className="text-emerald-400">+{formatCurrency(y.totalProfit)}</span>
              <span className="text-red-400">-{formatCurrency(y.totalLoss)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* P&L Bar Chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-display font-semibold mb-4">Yearly P&L</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`₹${Math.abs(value).toLocaleString('en-IN')}`, '']}
              />
              <Bar dataKey="profit" name="Profit" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="loss" name="Loss" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative P&L */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-display font-semibold mb-4">Cumulative Profit</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="cumGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Cumulative']}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#34d399"
                fill="url(#cumGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
