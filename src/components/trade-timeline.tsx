'use client';

import type { Trade } from '@/lib/types';
import { formatCurrencyFull, formatDate } from '@/lib/format';
import { TrendingUp, TrendingDown, Circle } from 'lucide-react';

interface Props {
  trades: Trade[];
}

export function TradeTimeline({ trades }: Props) {
  const sorted = [...trades].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">No trades logged yet. Start by adding a buy trade.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="space-y-0">
        {sorted.map((trade, i) => {
          const isBuy = trade.tradeType === 'buy';
          const totalAmount = trade.quantity * trade.price;

          return (
            <div key={trade.id} className="flex gap-4">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isBuy
                      ? 'bg-emerald-400/15 text-emerald-400'
                      : 'bg-red-400/15 text-red-400'
                  }`}
                >
                  {isBuy ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                </div>
                {i < sorted.length - 1 && (
                  <div className="w-px h-full min-h-[32px] bg-border" />
                )}
              </div>

              {/* Content */}
              <div className="pb-6 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      <span
                        className={`${
                          isBuy ? 'text-emerald-400' : 'text-red-400'
                        } font-bold mr-1.5`}
                      >
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                      {trade.stockName}
                      <span className="text-xs text-muted-foreground font-mono ml-1.5">
                        {trade.ticker}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {trade.quantity} shares @ ₹{trade.price.toFixed(2)}
                    </p>
                    {trade.notes && (
                      <p className="text-xs text-muted-foreground/60 mt-1 italic">
                        {trade.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono font-semibold">
                      {formatCurrencyFull(totalAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(trade.date)}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
