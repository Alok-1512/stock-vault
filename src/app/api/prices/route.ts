import { NextRequest, NextResponse } from 'next/server';

interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number;
        symbol: string;
        currency: string;
      };
    }> | null;
    error: unknown;
  };
}

async function fetchYahooPrice(
  ticker: string
): Promise<{ ticker: string; price: number | null }> {
  // Add .NS suffix for NSE stocks if not already present
  const symbol = ticker.includes('.') ? ticker : `${ticker}.NS`;
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 60 }, // Cache for 60 seconds at edge
    });

    if (!res.ok) return { ticker, price: null };

    const data: YahooChartResponse = await res.json();
    const price =
      data?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;

    return { ticker, price };
  } catch {
    return { ticker, price: null };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tickers: string[] = body.tickers;

    if (!Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json(
        { error: 'tickers array required' },
        { status: 400 }
      );
    }

    // Limit to 30 tickers per request to avoid abuse
    const limited = tickers.slice(0, 30);

    // Fetch all prices in parallel
    const results = await Promise.allSettled(limited.map(fetchYahooPrice));

    const prices: Record<string, number> = {};
    const failed: string[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.price !== null) {
        prices[result.value.ticker] = result.value.price;
      } else if (result.status === 'fulfilled') {
        failed.push(result.value.ticker);
      }
    }

    return NextResponse.json({
      prices,
      failed,
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
