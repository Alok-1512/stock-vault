'use client';

import type { ClosedTrade } from '@/lib/types';
import { getHoldingDurationInsights } from '@/lib/engine';
import { formatDays } from '@/lib/format';
import { Clock } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  closedTrades: ClosedTrade[];
}

export function HoldingInsights({ closedTrades }: Props) {
  const insights = getHoldingDurationInsights(closedTrades);

  if (closedTrades.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Clock className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">
          Holding insights will appear once you have closed trades
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-display font-semibold mb-4">Holding Duration Insights</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-muted/30 p-3">
          <span className="text-xs text-muted-foreground">Average</span>
          <p className="text-xl font-display font-bold">{formatDays(insights.avgDays)}</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-3">
          <span className="text-xs text-muted-foreground">Median</span>
          <p className="text-xl font-display font-bold">{formatDays(insights.medianDays)}</p>
        </div>
      </div>

      {insights.distribution.filter((d) => d.count > 0).length > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={insights.distribution.filter((d) => d.count > 0)}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              angle={-15}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [value, 'Trades']}
            />
            <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
