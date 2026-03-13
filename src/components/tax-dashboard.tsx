'use client';

import type { TaxSummary, ClosedTrade } from '@/lib/types';
import { formatCurrency, formatCurrencyFull, plColor } from '@/lib/format';
import {
  Receipt,
  TrendingUp,
  TrendingDown,
  Calculator,
  AlertTriangle,
  IndianRupee,
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
  Legend,
} from 'recharts';

interface Props {
  taxSummary: TaxSummary;
  closedTrades: ClosedTrade[];
}

export function TaxDashboard({ taxSummary, closedTrades }: Props) {
  const tax = taxSummary;

  if (closedTrades.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <Receipt className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">
          Tax calculations will appear once you have closed trades
        </p>
      </div>
    );
  }

  const taxCards = [
    {
      label: 'STCG Profit',
      value: tax.totalSTCGProfit,
      icon: TrendingUp,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      label: 'LTCG Profit',
      value: tax.totalLTCGProfit,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      label: 'Total Losses',
      value: -tax.totalRealizedLosses,
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
    },
    {
      label: 'Net Realized Gains',
      value: tax.netRealizedGains,
      icon: IndianRupee,
      color: tax.netRealizedGains >= 0 ? 'text-emerald-400' : 'text-red-400',
      bg: tax.netRealizedGains >= 0 ? 'bg-emerald-400/10' : 'bg-red-400/10',
    },
    {
      label: 'Estimated Tax',
      value: tax.totalEstimatedTax,
      icon: Calculator,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
    },
  ];

  // Tax breakdown pie
  const pieData = [
    { name: 'STCG Tax (20%)', value: tax.estimatedSTCGTax },
    { name: 'LTCG Tax (12.5%)', value: tax.estimatedLTCGTax },
  ].filter((d) => d.value > 0);
  const PIE_COLORS = ['#fbbf24', '#a78bfa'];

  // Yearly tax data
  const yearMap = new Map<number, { stcg: number; ltcg: number; loss: number }>();
  for (const ct of closedTrades) {
    const year = new Date(ct.sellDate).getFullYear();
    const entry = yearMap.get(year) || { stcg: 0, ltcg: 0, loss: 0 };
    if (ct.profitLoss >= 0) {
      if (ct.tradeType === 'STCG') entry.stcg += ct.profitLoss;
      else entry.ltcg += ct.profitLoss;
    } else {
      entry.loss += Math.abs(ct.profitLoss);
    }
    yearMap.set(year, entry);
  }
  const yearlyTaxData = Array.from(yearMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, data]) => ({
      year: year.toString(),
      STCG: data.stcg,
      LTCG: data.ltcg,
      Loss: -data.loss,
    }));

  return (
    <div className="space-y-6">
      {/* Tax metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {taxCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className={`rounded-lg p-1.5 ${card.bg}`}>
                <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
              </div>
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <p className={`text-lg font-display font-bold ${plColor(card.value)}`}>
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Tax details card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-display font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Tax Calculation Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Gross STCG</span>
              <span className="font-mono text-sm">{formatCurrencyFull(tax.totalSTCGProfit)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">STCG Losses</span>
              <span className="font-mono text-sm text-red-400">-{formatCurrencyFull(tax.totalSTCGLoss)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm font-semibold">Net STCG</span>
              <span className={`font-mono text-sm font-bold ${plColor(tax.netSTCG)}`}>
                {formatCurrencyFull(tax.netSTCG)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">STCG Tax @ 20%</span>
              <span className="font-mono text-sm text-amber-400">
                {formatCurrencyFull(tax.estimatedSTCGTax)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Gross LTCG</span>
              <span className="font-mono text-sm">{formatCurrencyFull(tax.totalLTCGProfit)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">LTCG Losses</span>
              <span className="font-mono text-sm text-red-400">-{formatCurrencyFull(tax.totalLTCGLoss)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Net LTCG (before exemption)</span>
              <span className={`font-mono text-sm ${plColor(tax.netLTCG)}`}>
                {formatCurrencyFull(tax.netLTCG)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">LTCG Exemption (₹1.25L)</span>
              <span className="font-mono text-sm text-emerald-400">
                -{formatCurrencyFull(Math.min(tax.ltcgExemption, Math.max(0, tax.netLTCG)))}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">LTCG Tax @ 12.5%</span>
              <span className="font-mono text-sm text-purple-400">
                {formatCurrencyFull(tax.estimatedLTCGTax)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
          <span className="text-sm font-display font-bold">Total Estimated Tax</span>
          <span className="text-xl font-display font-bold text-orange-400">
            {formatCurrencyFull(tax.totalEstimatedTax)}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-2">
          * Tax estimates are indicative. Actual tax may vary based on your income slab, surcharge, cess, and other factors. Consult a CA for accurate calculations.
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {pieData.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-display font-semibold mb-4">Tax Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
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
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {yearlyTaxData.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-display font-semibold mb-4">Yearly Tax Trends</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={yearlyTaxData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`₹${Math.abs(value).toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="STCG" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                <Bar dataKey="LTCG" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Loss" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
