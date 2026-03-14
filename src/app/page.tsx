'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useMounted, useLocalStorage } from '@/hooks';
import type { Trade, CurrentPrices, FilterState } from '@/lib/types';
import { addTrade, getTrades, saveTrades, getCurrentPrices, updateCurrentPrice, saveCurrentPrices } from '@/lib/storage';
import {
  getOpenPositions,
  getClosedTrades,
  calculateTaxSummary,
  getPortfolioMetrics,
  getYearlyPerformance,
  getStockPerformance,
  getUniqueStocks,
  getTradeYears,
  filterTrades,
  filterClosedTrades,
} from '@/lib/engine';
import {
  exportTrades,
  exportClosedTrades,
  exportOpenPositions,
  exportTaxSummary,
} from '@/lib/csv-export';

import { generateSampleTrades, generateSampleCurrentPrices } from '@/lib/sample-data';
import { fetchLivePrices, setLastPriceUpdate, getLastPriceUpdate } from '@/lib/price-fetcher';
import { TradeForm } from '@/components/trade-form';
import { PortfolioOverview } from '@/components/portfolio-overview';
import { OpenPositions } from '@/components/open-positions';
import { ClosedTradesTable } from '@/components/closed-trades';
import { TradeTimeline } from '@/components/trade-timeline';
import { TaxDashboard } from '@/components/tax-dashboard';
import { PerformanceAnalytics } from '@/components/performance-analytics';
import { YearlyPerformance } from '@/components/yearly-performance';
import { StockInsights } from '@/components/stock-insights';
import { PortfolioAllocation } from '@/components/portfolio-allocation';
import { HoldingInsights } from '@/components/holding-insights';
import { GlobalFilters } from '@/components/global-filters';
import { ThemeSwitcher } from '@/components/theme-switcher';

import {
  LayoutDashboard,
  Briefcase,
  ArrowRightLeft,
  Clock,
  Receipt,
  BarChart3,
  Calendar,
  PieChart,
  Download,
  TrendingUp,
  Menu,
  X,
  Database,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type TabId =
  | 'overview'
  | 'positions'
  | 'closed'
  | 'timeline'
  | 'tax'
  | 'analytics'
  | 'yearly'
  | 'stocks'
  | 'allocation';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'positions', label: 'Positions', icon: Briefcase },
  { id: 'closed', label: 'Closed Trades', icon: ArrowRightLeft },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'tax', label: 'Tax', icon: Receipt },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'yearly', label: 'Yearly', icon: Calendar },
  { id: 'stocks', label: 'Stocks', icon: TrendingUp },
  { id: 'allocation', label: 'Allocation', icon: PieChart },
];

export default function Dashboard() {
  const mounted = useMounted();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentPrices, setCurrentPrices] = useState<CurrentPrices>({});
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    year: '',
    quarter: '',
    month: '',
    stock: '',
  });
  const [initialized, setInitialized] = useState(false);
  const [pricesFetching, setPricesFetching] = useState(false);
  const [lastPriceUpdateTime, setLastPriceUpdateTime] = useState<string | null>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from localStorage on mount
  if (mounted && !initialized) {
    const storedTrades = getTrades();
    const storedPrices = getCurrentPrices();
    setTrades(storedTrades);
    setCurrentPrices(storedPrices);
    setLastPriceUpdateTime(getLastPriceUpdate());
    setInitialized(true);
  }

  const handleAddTrade = useCallback(
    (trade: Trade) => {
      const updated = addTrade(trade);
      setTrades([...updated]);
    },
    []
  );

  const handleUpdatePrice = useCallback(
    (ticker: string, price: number) => {
      const updated = updateCurrentPrice(ticker, price);
      setCurrentPrices({ ...updated });
    },
    []
  );

  const handleLoadSampleData = useCallback(() => {
    const sampleTrades = generateSampleTrades();
    const samplePrices = generateSampleCurrentPrices();
    saveTrades(sampleTrades);
    saveCurrentPrices(samplePrices);
    setTrades(sampleTrades);
    setCurrentPrices(samplePrices);
  }, []);

  const handleClearAllData = useCallback(() => {
    saveTrades([]);
    saveCurrentPrices({});
    setTrades([]);
    setCurrentPrices({});
  }, []);

  // --- Dynamic price fetching ---
  const handleRefreshPrices = useCallback(async () => {
    const currentTrades = getTrades();
    const tickerSet = new Set<string>();
    for (const t of currentTrades) {
      if (t.tradeType === 'buy') tickerSet.add(t.ticker);
    }
    // Only fetch for tickers with open positions
    const openTickers = Array.from(tickerSet);
    if (openTickers.length === 0) return;

    setPricesFetching(true);
    try {
      const result = await fetchLivePrices(openTickers);
      if (Object.keys(result.prices).length > 0) {
        const existingPrices = getCurrentPrices();
        const merged = { ...existingPrices, ...result.prices };
        saveCurrentPrices(merged);
        setCurrentPrices(merged);
        setLastPriceUpdate(result.fetchedAt);
        setLastPriceUpdateTime(result.fetchedAt);
      }
    } catch (err) {
      console.error('Price fetch error:', err);
    } finally {
      setPricesFetching(false);
    }
  }, []);

  // Auto-refresh prices every 5 minutes when tab is visible
  useEffect(() => {
    if (!initialized) return;

    const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

    function startInterval() {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = setInterval(() => {
        handleRefreshPrices();
      }, INTERVAL_MS);
    }

    function stopInterval() {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        // Refresh immediately when tab becomes visible again
        handleRefreshPrices();
        startInterval();
      } else {
        stopInterval();
      }
    }

    // Initial fetch on load
    handleRefreshPrices();
    startInterval();

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initialized, handleRefreshPrices]);

  // Compute derived data
  const filteredTrades = useMemo(
    () => filterTrades(trades, filters),
    [trades, filters]
  );
  const openPositions = useMemo(
    () => getOpenPositions(trades, currentPrices),
    [trades, currentPrices]
  );
  const allClosedTrades = useMemo(() => getClosedTrades(trades), [trades]);
  const filteredClosedTrades = useMemo(
    () => filterClosedTrades(allClosedTrades, filters),
    [allClosedTrades, filters]
  );
  const taxSummary = useMemo(
    () => calculateTaxSummary(filteredClosedTrades),
    [filteredClosedTrades]
  );
  const metrics = useMemo(
    () => getPortfolioMetrics(trades, currentPrices),
    [trades, currentPrices]
  );
  const yearlyData = useMemo(
    () => getYearlyPerformance(filteredClosedTrades),
    [filteredClosedTrades]
  );
  const stockPerformance = useMemo(
    () => getStockPerformance(filteredClosedTrades),
    [filteredClosedTrades]
  );
  const uniqueStocks = useMemo(() => getUniqueStocks(trades), [trades]);
  const tradeYears = useMemo(() => getTradeYears(trades), [trades]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-mono">Loading StockVault...</p>
        </div>
      </div>
    );
  }

  const hasFilters =
    filters.dateFrom || filters.dateTo || filters.year || filters.quarter ||
    filters.month || filters.stock;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-[220px] border-r border-border bg-sidebar flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-display font-bold tracking-tight">StockVault</h1>
              <p className="text-[10px] text-muted-foreground">Portfolio Tracker</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            <p className="text-[10px] text-muted-foreground mb-1">Indian Stock Market</p>
            <p className="text-xs text-muted-foreground">
              STCG: 20% · LTCG: 12.5%
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              LTCG exempt up to ₹1.25L
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 md:px-6 h-14">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-1.5 rounded-lg hover:bg-muted"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
              <h2 className="text-base font-display font-semibold">
                {TABS.find((t) => t.id === activeTab)?.label}
              </h2>
              {hasFilters && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                  Filtered
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Sample data buttons */}
              {trades.length === 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                  onClick={handleLoadSampleData}
                >
                  <Database className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Load Samples</span>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  onClick={handleClearAllData}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              )}
              {/* CSV Export dropdown */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs text-muted-foreground"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-popover shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-1">
                    <button
                      onClick={() => exportTrades(filteredTrades)}
                      className="w-full text-left px-3 py-2 text-xs rounded-md hover:bg-muted transition-colors"
                    >
                      Export All Trades
                    </button>
                    <button
                      onClick={() => exportClosedTrades(filteredClosedTrades)}
                      className="w-full text-left px-3 py-2 text-xs rounded-md hover:bg-muted transition-colors"
                    >
                      Export Closed Trades
                    </button>
                    <button
                      onClick={() => exportOpenPositions(openPositions)}
                      className="w-full text-left px-3 py-2 text-xs rounded-md hover:bg-muted transition-colors"
                    >
                      Export Open Positions
                    </button>
                    <button
                      onClick={() => exportTaxSummary(taxSummary)}
                      className="w-full text-left px-3 py-2 text-xs rounded-md hover:bg-muted transition-colors"
                    >
                      Export Tax Summary
                    </button>
                  </div>
                </div>
              </div>
              <ThemeSwitcher />
              <TradeForm trades={trades} onAddTrade={handleAddTrade} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 md:p-6 space-y-5 max-w-[1400px]">
          {/* Global filters */}
          <GlobalFilters
            filters={filters}
            setFilters={setFilters}
            years={tradeYears}
            stocks={uniqueStocks}
          />

          {/* Tab content */}
          {activeTab === 'overview' && (
            <PortfolioOverview
              metrics={metrics}
              closedTrades={filteredClosedTrades}
            />
          )}

          {activeTab === 'positions' && (
            <div className="space-y-5">
              <OpenPositions
                positions={openPositions}
                onUpdatePrice={handleUpdatePrice}
                onRefreshPrices={handleRefreshPrices}
                pricesFetching={pricesFetching}
                lastPriceUpdate={lastPriceUpdateTime}
              />
              <PortfolioAllocation positions={openPositions} />
            </div>
          )}

          {activeTab === 'closed' && (
            <ClosedTradesTable
              closedTrades={filteredClosedTrades}
              uniqueStocks={uniqueStocks}
            />
          )}

          {activeTab === 'timeline' && (
            <TradeTimeline trades={filteredTrades} />
          )}

          {activeTab === 'tax' && (
            <TaxDashboard
              taxSummary={taxSummary}
              closedTrades={filteredClosedTrades}
            />
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-5">
              <PerformanceAnalytics closedTrades={filteredClosedTrades} />
              <HoldingInsights closedTrades={filteredClosedTrades} />
            </div>
          )}

          {activeTab === 'yearly' && (
            <YearlyPerformance yearlyData={yearlyData} />
          )}

          {activeTab === 'stocks' && (
            <StockInsights stockPerformance={stockPerformance} />
          )}

          {activeTab === 'allocation' && (
            <div className="space-y-5">
              <PortfolioAllocation positions={openPositions} />
              <HoldingInsights closedTrades={filteredClosedTrades} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
