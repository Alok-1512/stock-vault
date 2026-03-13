import type { Trade, ClosedTrade, OpenPosition, TaxSummary } from './types';

function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCSV(val: string | number): string {
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportTrades(trades: Trade[]) {
  const headers = ['Date', 'Type', 'Stock Name', 'Ticker', 'Quantity', 'Price (₹)', 'Total (₹)', 'Notes'];
  const rows = trades
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => [
      t.date,
      t.tradeType.toUpperCase(),
      escapeCSV(t.stockName),
      t.ticker,
      t.quantity,
      t.price.toFixed(2),
      (t.quantity * t.price).toFixed(2),
      escapeCSV(t.notes || ''),
    ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`stockvault_trades_${new Date().toISOString().split('T')[0]}.csv`, csv);
}

export function exportClosedTrades(closedTrades: ClosedTrade[]) {
  const headers = [
    'Stock',
    'Ticker',
    'Buy Date',
    'Sell Date',
    'Quantity',
    'Buy Price (₹)',
    'Sell Price (₹)',
    'Holding Days',
    'P&L (₹)',
    'Type',
  ];
  const rows = closedTrades.map((ct) => [
    escapeCSV(ct.stockName),
    ct.ticker,
    ct.buyDate,
    ct.sellDate,
    ct.quantity,
    ct.buyPrice.toFixed(2),
    ct.sellPrice.toFixed(2),
    ct.holdingDays,
    ct.profitLoss.toFixed(2),
    ct.tradeType,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`stockvault_closed_trades_${new Date().toISOString().split('T')[0]}.csv`, csv);
}

export function exportOpenPositions(positions: OpenPosition[]) {
  const headers = [
    'Stock',
    'Ticker',
    'Shares',
    'Avg Buy Price (₹)',
    'Total Invested (₹)',
    'Current Price (₹)',
    'Current Value (₹)',
    'Unrealized P&L (₹)',
    'Unrealized P&L (%)',
  ];
  const rows = positions.map((p) => [
    escapeCSV(p.stockName),
    p.ticker,
    p.totalShares,
    p.avgBuyPrice.toFixed(2),
    p.totalInvested.toFixed(2),
    p.currentPrice.toFixed(2),
    p.currentValue.toFixed(2),
    p.unrealizedPL.toFixed(2),
    p.unrealizedPLPercent.toFixed(2),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(`stockvault_positions_${new Date().toISOString().split('T')[0]}.csv`, csv);
}

export function exportTaxSummary(tax: TaxSummary) {
  const rows = [
    ['Metric', 'Amount (₹)'],
    ['Total STCG Profit', tax.totalSTCGProfit.toFixed(2)],
    ['Total LTCG Profit', tax.totalLTCGProfit.toFixed(2)],
    ['Total STCG Loss', tax.totalSTCGLoss.toFixed(2)],
    ['Total LTCG Loss', tax.totalLTCGLoss.toFixed(2)],
    ['Total Realized Losses', tax.totalRealizedLosses.toFixed(2)],
    ['Net STCG', tax.netSTCG.toFixed(2)],
    ['Net LTCG', tax.netLTCG.toFixed(2)],
    ['LTCG Exemption', tax.ltcgExemption.toFixed(2)],
    ['Net Realized Gains', tax.netRealizedGains.toFixed(2)],
    ['Estimated STCG Tax (20%)', tax.estimatedSTCGTax.toFixed(2)],
    ['Estimated LTCG Tax (12.5%)', tax.estimatedLTCGTax.toFixed(2)],
    ['Total Estimated Tax', tax.totalEstimatedTax.toFixed(2)],
  ];

  const csv = rows.map((r) => r.join(',')).join('\n');
  downloadCSV(`stockvault_tax_summary_${new Date().toISOString().split('T')[0]}.csv`, csv);
}
