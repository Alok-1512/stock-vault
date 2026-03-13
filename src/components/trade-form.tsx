'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import type { Trade } from '@/lib/types';
import { getAvailableShares, getUniqueStocks } from '@/lib/engine';
import { formatCurrencyFull } from '@/lib/format';

interface TradeFormProps {
  trades: Trade[];
  onAddTrade: (trade: Trade) => void;
}

export function TradeForm({ trades, onAddTrade }: TradeFormProps) {
  const [open, setOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [stockName, setStockName] = useState('');
  const [ticker, setTicker] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const existingStocks = getUniqueStocks(trades);
  const totalAmount = (parseFloat(price) || 0) * (parseInt(quantity) || 0);

  const availableShares = tradeType === 'sell' && ticker
    ? getAvailableShares(trades, ticker)
    : 0;

  function resetForm() {
    setStockName('');
    setTicker('');
    setDate(new Date().toISOString().split('T')[0]);
    setPrice('');
    setQuantity('');
    setNotes('');
    setError('');
  }

  function handleSelectExisting(t: string) {
    const stock = existingStocks.find((s) => s.ticker === t);
    if (stock) {
      setStockName(stock.name);
      setTicker(stock.ticker);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!stockName.trim()) { setError('Stock name is required'); return; }
    if (!ticker.trim()) { setError('Ticker is required'); return; }
    if (!date) { setError('Date is required'); return; }
    if (!price || parseFloat(price) <= 0) { setError('Valid price is required'); return; }
    if (!quantity || parseInt(quantity) <= 0) { setError('Valid quantity is required'); return; }

    if (tradeType === 'sell') {
      const available = getAvailableShares(trades, ticker.toUpperCase());
      if (parseInt(quantity) > available) {
        setError(`Only ${available} shares available to sell`);
        return;
      }
    }

    const trade: Trade = {
      id: uuidv4(),
      stockName: stockName.trim(),
      ticker: ticker.toUpperCase().trim(),
      tradeType,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      date,
      notes: notes.trim() || undefined,
    };

    onAddTrade(trade);
    resetForm();
    setOpen(false);
  }

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
          <Plus className="h-4 w-4" />
          Log Trade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Log New Trade</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => { setTradeType('buy'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tradeType === 'buy'
                ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            BUY
          </button>
          <button
            type="button"
            onClick={() => { setTradeType('sell'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tradeType === 'sell'
                ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingDown className="h-4 w-4" />
            SELL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tradeType === 'sell' && existingStocks.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Select Stock</Label>
              <select
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={ticker}
                onChange={(e) => handleSelectExisting(e.target.value)}
              >
                <option value="">Choose a stock...</option>
                {existingStocks.map((s) => {
                  const avail = getAvailableShares(trades, s.ticker);
                  if (avail <= 0) return null;
                  return (
                    <option key={s.ticker} value={s.ticker}>
                      {s.name} ({s.ticker}) — {avail} shares
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Stock Name</Label>
              <Input
                value={stockName}
                onChange={(e) => setStockName(e.target.value)}
                placeholder="Reliance Industries"
                className="bg-secondary border-border"
                readOnly={tradeType === 'sell' && !!ticker}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Ticker</Label>
              <Input
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="RELIANCE"
                className="bg-secondary border-border font-mono"
                readOnly={tradeType === 'sell' && !!ticker}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              {tradeType === 'buy' ? 'Buy' : 'Sell'} Date
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Price per Share (₹)
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2,450.00"
                className="bg-secondary border-border font-mono"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Quantity
                {tradeType === 'sell' && availableShares > 0 && (
                  <span className="ml-1 text-emerald-400">(max: {availableShares})</span>
                )}
              </Label>
              <Input
                type="number"
                min="1"
                max={tradeType === 'sell' ? availableShares : undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                className="bg-secondary border-border font-mono"
              />
            </div>
          </div>

          {totalAmount > 0 && (
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <span className="text-xs text-muted-foreground">Total Amount</span>
              <p className="text-lg font-display font-semibold">
                {formatCurrencyFull(totalAmount)}
              </p>
            </div>
          )}

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Notes (optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Earnings play, long-term hold..."
              className="bg-secondary border-border"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button
            type="submit"
            className={`w-full font-semibold ${
              tradeType === 'buy'
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {tradeType === 'buy' ? 'Record Purchase' : 'Record Sale'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
