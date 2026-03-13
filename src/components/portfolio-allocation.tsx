'use client';

import type { OpenPosition } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/format';
import { PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  positions: OpenPosition[];
}

const COLORS = [
  '#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa',
  '#f472b6', '#fb923c', '#2dd4bf', '#818cf8', '#e879f9',
  '#84cc16', '#22d3ee',
];

export function PortfolioAllocation({ positions }: Props) {
  if (positions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <PieIcon className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">
          Portfolio allocation will appear once you have open positions
        </p>
      </div>
    );
  }

  const totalValue = positions.reduce((s, p) => s + p.currentValue, 0);
  const data = positions
    .map((p) => ({
      name: p.ticker,
      fullName: p.stockName,
      value: p.currentValue,
      pct: totalValue > 0 ? (p.currentValue / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-display font-semibold mb-4">Portfolio Allocation</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [
                `₹${value.toLocaleString('en-IN')}`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="space-y-2">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold truncate">{item.fullName}</span>
                  <span className="text-xs text-muted-foreground font-mono ml-2">
                    {item.pct.toFixed(1)}%
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {formatCurrency(item.value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
