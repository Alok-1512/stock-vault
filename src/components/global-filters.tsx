'use client';

import type { FilterState } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface Props {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  years: number[];
  stocks: { name: string; ticker: string }[];
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function GlobalFilters({ filters, setFilters, years, stocks }: Props) {
  const hasFilters =
    filters.dateFrom || filters.dateTo || filters.year || filters.quarter ||
    filters.month || filters.stock;

  function clearFilters() {
    setFilters({
      dateFrom: '',
      dateTo: '',
      year: '',
      quarter: '',
      month: '',
      stock: '',
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">FILTERS</span>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-muted-foreground hover:text-foreground gap-1"
            onClick={clearFilters}
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          placeholder="From"
          className="w-[140px] h-8 text-xs bg-secondary border-border"
        />
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          placeholder="To"
          className="w-[140px] h-8 text-xs bg-secondary border-border"
        />

        <select
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          className="rounded-lg border border-border bg-secondary px-3 h-8 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y.toString()}>{y}</option>
          ))}
        </select>

        <select
          value={filters.quarter}
          onChange={(e) => setFilters({ ...filters, quarter: e.target.value })}
          className="rounded-lg border border-border bg-secondary px-3 h-8 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Quarter</option>
          <option value="1">Q1 (Jan-Mar)</option>
          <option value="2">Q2 (Apr-Jun)</option>
          <option value="3">Q3 (Jul-Sep)</option>
          <option value="4">Q4 (Oct-Dec)</option>
        </select>

        <select
          value={filters.month}
          onChange={(e) => setFilters({ ...filters, month: e.target.value })}
          className="rounded-lg border border-border bg-secondary px-3 h-8 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={(i + 1).toString()}>{m}</option>
          ))}
        </select>

        <select
          value={filters.stock}
          onChange={(e) => setFilters({ ...filters, stock: e.target.value })}
          className="rounded-lg border border-border bg-secondary px-3 h-8 text-xs focus:outline-none focus:ring-1 focus:ring-ring min-w-[140px]"
        >
          <option value="">All Stocks</option>
          {stocks.map((s) => (
            <option key={s.ticker} value={s.ticker}>
              {s.name} ({s.ticker})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
