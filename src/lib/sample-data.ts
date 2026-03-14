import type { Trade, CurrentPrices } from './types';
import { v4 as uuidv4 } from 'uuid';

// Realistic Indian stock market sample trades spanning 2023-2025
// Covers: multiple stocks, buys & sells, STCG & LTCG, profits & losses

export function generateSampleTrades(): Trade[] {
  return [
    // ========== RELIANCE INDUSTRIES ==========
    // Buy 50 shares in Jan 2023
    {
      id: uuidv4(),
      stockName: 'Reliance Industries',
      ticker: 'RELIANCE',
      tradeType: 'buy',
      quantity: 50,
      price: 2450.0,
      date: '2023-01-15',
      notes: 'Long-term core holding',
    },
    // Buy 30 more in Mar 2023
    {
      id: uuidv4(),
      stockName: 'Reliance Industries',
      ticker: 'RELIANCE',
      tradeType: 'buy',
      quantity: 30,
      price: 2320.0,
      date: '2023-03-10',
      notes: 'Averaging down on dip',
    },
    // Sell 40 in Feb 2024 (LTCG — held > 365 days, profit)
    {
      id: uuidv4(),
      stockName: 'Reliance Industries',
      ticker: 'RELIANCE',
      tradeType: 'sell',
      quantity: 40,
      price: 2890.0,
      date: '2024-02-20',
      notes: 'Partial profit booking after rally',
    },
    // Buy 20 in Aug 2024
    {
      id: uuidv4(),
      stockName: 'Reliance Industries',
      ticker: 'RELIANCE',
      tradeType: 'buy',
      quantity: 20,
      price: 3050.0,
      date: '2024-08-05',
    },

    // ========== TATA CONSULTANCY SERVICES ==========
    // Buy 25 in Feb 2023
    {
      id: uuidv4(),
      stockName: 'Tata Consultancy Services',
      ticker: 'TCS',
      tradeType: 'buy',
      quantity: 25,
      price: 3380.0,
      date: '2023-02-08',
      notes: 'IT sector bet',
    },
    // Buy 15 in Jul 2023
    {
      id: uuidv4(),
      stockName: 'Tata Consultancy Services',
      ticker: 'TCS',
      tradeType: 'buy',
      quantity: 15,
      price: 3520.0,
      date: '2023-07-22',
    },
    // Sell 25 in Mar 2024 (LTCG — held > 365 days, profit)
    {
      id: uuidv4(),
      stockName: 'Tata Consultancy Services',
      ticker: 'TCS',
      tradeType: 'sell',
      quantity: 25,
      price: 3950.0,
      date: '2024-03-15',
      notes: 'Pre-results profit booking',
    },
    // Sell 10 in Sep 2024 (LTCG — held > 365 days)
    {
      id: uuidv4(),
      stockName: 'Tata Consultancy Services',
      ticker: 'TCS',
      tradeType: 'sell',
      quantity: 10,
      price: 4100.0,
      date: '2024-09-10',
    },

    // ========== HDFC BANK ==========
    // Buy 60 in Apr 2023
    {
      id: uuidv4(),
      stockName: 'HDFC Bank',
      ticker: 'HDFCBANK',
      tradeType: 'buy',
      quantity: 60,
      price: 1620.0,
      date: '2023-04-12',
      notes: 'Post-merger entry',
    },
    // Sell 30 in Jun 2023 (STCG — held < 365 days, small loss)
    {
      id: uuidv4(),
      stockName: 'HDFC Bank',
      ticker: 'HDFCBANK',
      tradeType: 'sell',
      quantity: 30,
      price: 1555.0,
      date: '2023-06-28',
      notes: 'Stop loss triggered',
    },
    // Sell 20 in May 2024 (LTCG — held > 365 days, profit)
    {
      id: uuidv4(),
      stockName: 'HDFC Bank',
      ticker: 'HDFCBANK',
      tradeType: 'sell',
      quantity: 20,
      price: 1780.0,
      date: '2024-05-22',
    },

    // ========== INFOSYS ==========
    // Buy 40 in Jun 2023
    {
      id: uuidv4(),
      stockName: 'Infosys',
      ticker: 'INFY',
      tradeType: 'buy',
      quantity: 40,
      price: 1280.0,
      date: '2023-06-05',
      notes: 'Value pick at support',
    },
    // Sell 40 in Oct 2023 (STCG — held < 365 days, loss)
    {
      id: uuidv4(),
      stockName: 'Infosys',
      ticker: 'INFY',
      tradeType: 'sell',
      quantity: 40,
      price: 1190.0,
      date: '2023-10-18',
      notes: 'Weak results, exited position',
    },
    // Buy 30 in Jan 2024 (re-entry)
    {
      id: uuidv4(),
      stockName: 'Infosys',
      ticker: 'INFY',
      tradeType: 'buy',
      quantity: 30,
      price: 1560.0,
      date: '2024-01-10',
    },
    // Sell 30 in Nov 2024 (STCG — held ~300 days, profit)
    {
      id: uuidv4(),
      stockName: 'Infosys',
      ticker: 'INFY',
      tradeType: 'sell',
      quantity: 30,
      price: 1820.0,
      date: '2024-11-05',
      notes: 'Good run, booked full profit',
    },

    // ========== MAHINDRA & MAHINDRA ==========
    // Buy 35 in Sep 2023
    {
      id: uuidv4(),
      stockName: 'Mahindra & Mahindra',
      ticker: 'M&M',
      tradeType: 'buy',
      quantity: 35,
      price: 1580.0,
      date: '2023-09-14',
      notes: 'EV story + SUV dominance',
    },
    // Buy 15 in Dec 2023
    {
      id: uuidv4(),
      stockName: 'Mahindra & Mahindra',
      ticker: 'M&M',
      tradeType: 'buy',
      quantity: 15,
      price: 1650.0,
      date: '2023-12-05',
    },
    // Sell 25 in Dec 2024 (LTCG — held > 365 days, big profit)
    {
      id: uuidv4(),
      stockName: 'Mahindra & Mahindra',
      ticker: 'M&M',
      tradeType: 'sell',
      quantity: 25,
      price: 2850.0,
      date: '2024-12-10',
      notes: 'Massive rally, partial booking',
    },

    // ========== BHARTI AIRTEL ==========
    // Buy 45 in May 2023
    {
      id: uuidv4(),
      stockName: 'Bharti Airtel',
      ticker: 'BHARTIARTL',
      tradeType: 'buy',
      quantity: 45,
      price: 820.0,
      date: '2023-05-18',
      notes: '5G rollout play',
    },
    // Sell 45 in Jul 2024 (LTCG — held > 365 days, profit)
    {
      id: uuidv4(),
      stockName: 'Bharti Airtel',
      ticker: 'BHARTIARTL',
      tradeType: 'sell',
      quantity: 45,
      price: 1480.0,
      date: '2024-07-12',
      notes: 'Full exit at 80% profit',
    },

    // ========== ITC ==========
    // Buy 100 in Mar 2023
    {
      id: uuidv4(),
      stockName: 'ITC',
      ticker: 'ITC',
      tradeType: 'buy',
      quantity: 100,
      price: 395.0,
      date: '2023-03-20',
      notes: 'Dividend + rerating thesis',
    },
    // Sell 50 in Aug 2023 (STCG — held ~5 months, small profit)
    {
      id: uuidv4(),
      stockName: 'ITC',
      ticker: 'ITC',
      tradeType: 'sell',
      quantity: 50,
      price: 445.0,
      date: '2023-08-15',
    },
    // Sell 50 in Apr 2024 (LTCG — held > 365 days, profit)
    {
      id: uuidv4(),
      stockName: 'ITC',
      ticker: 'ITC',
      tradeType: 'sell',
      quantity: 50,
      price: 430.0,
      date: '2024-04-10',
      notes: 'Hotel demerger uncertainty',
    },

    // ========== ADANI ENTERPRISES ==========
    // Buy 20 in Nov 2023
    {
      id: uuidv4(),
      stockName: 'Adani Enterprises',
      ticker: 'ADANIENT',
      tradeType: 'buy',
      quantity: 20,
      price: 2680.0,
      date: '2023-11-08',
      notes: 'Post-Hindenburg recovery bet',
    },
    // Sell 20 in Mar 2024 (STCG — held ~4 months, loss)
    {
      id: uuidv4(),
      stockName: 'Adani Enterprises',
      ticker: 'ADANIENT',
      tradeType: 'sell',
      quantity: 20,
      price: 2420.0,
      date: '2024-03-25',
      notes: 'Cut losses, thesis not playing out',
    },

    // ========== BAJAJ FINANCE ==========
    // Buy 15 in Aug 2023
    {
      id: uuidv4(),
      stockName: 'Bajaj Finance',
      ticker: 'BAJFINANCE',
      tradeType: 'buy',
      quantity: 15,
      price: 7200.0,
      date: '2023-08-20',
      notes: 'Consumer credit growth story',
    },
    // Buy 10 in Feb 2024
    {
      id: uuidv4(),
      stockName: 'Bajaj Finance',
      ticker: 'BAJFINANCE',
      tradeType: 'buy',
      quantity: 10,
      price: 6800.0,
      date: '2024-02-14',
      notes: 'Buying the dip after RBI concerns',
    },
    // Sell 15 in Jan 2025 (LTCG — held > 365 days, profit)
    {
      id: uuidv4(),
      stockName: 'Bajaj Finance',
      ticker: 'BAJFINANCE',
      tradeType: 'sell',
      quantity: 15,
      price: 7950.0,
      date: '2025-01-08',
      notes: 'Partial profit at new highs',
    },

    // ========== TATA MOTORS ==========
    // Buy 80 in Jul 2023
    {
      id: uuidv4(),
      stockName: 'Tata Motors',
      ticker: 'TATAMOTORS',
      tradeType: 'buy',
      quantity: 80,
      price: 620.0,
      date: '2023-07-10',
      notes: 'JLR turnaround + EV push',
    },
    // Sell 50 in Jun 2024 (STCG — held ~11 months, big profit)
    {
      id: uuidv4(),
      stockName: 'Tata Motors',
      ticker: 'TATAMOTORS',
      tradeType: 'sell',
      quantity: 50,
      price: 980.0,
      date: '2024-06-18',
      notes: 'Massive run, taking profits',
    },
    // Sell 30 in Oct 2024 (LTCG — held > 365 days, profit)
    {
      id: uuidv4(),
      stockName: 'Tata Motors',
      ticker: 'TATAMOTORS',
      tradeType: 'sell',
      quantity: 30,
      price: 920.0,
      date: '2024-10-22',
      notes: 'Exited remaining position',
    },

    // ========== WIPRO (pure loss trade) ==========
    // Buy 50 in May 2024
    {
      id: uuidv4(),
      stockName: 'Wipro',
      ticker: 'WIPRO',
      tradeType: 'buy',
      quantity: 50,
      price: 480.0,
      date: '2024-05-05',
      notes: 'Turnaround bet on new CEO',
    },
    // Sell 50 in Sep 2024 (STCG — held ~4 months, loss)
    {
      id: uuidv4(),
      stockName: 'Wipro',
      ticker: 'WIPRO',
      tradeType: 'sell',
      quantity: 50,
      price: 425.0,
      date: '2024-09-20',
      notes: 'Thesis broken, full exit at loss',
    },

    // ========== OPEN POSITIONS (bought, not yet sold) ==========

    // SBI — bought in Oct 2024 (still holding)
    {
      id: uuidv4(),
      stockName: 'State Bank of India',
      ticker: 'SBIN',
      tradeType: 'buy',
      quantity: 70,
      price: 785.0,
      date: '2024-10-15',
      notes: 'PSU banking strength',
    },

    // ZOMATO — bought in Dec 2024 (still holding)
    {
      id: uuidv4(),
      stockName: 'Zomato',
      ticker: 'ZOMATO',
      tradeType: 'buy',
      quantity: 120,
      price: 265.0,
      date: '2024-12-02',
      notes: 'Blinkit growth story',
    },

    // ASIAN PAINTS — bought in Jan 2025 (still holding)
    {
      id: uuidv4(),
      stockName: 'Asian Paints',
      ticker: 'ASIANPAINT',
      tradeType: 'buy',
      quantity: 30,
      price: 2350.0,
      date: '2025-01-20',
      notes: 'Buying the dip, rural recovery bet',
    },

    // RELIANCE still has open shares (60 total bought - 40 sold = 20 from old lots, + 20 new = 40 open)
    // M&M still has open shares (50 bought - 25 sold = 25 open)
    // HDFCBANK still has open shares (60 bought - 50 sold = 10 open)
    // TCS still has open shares (40 bought - 35 sold = 5 open)
    // BAJFINANCE still has 10 open shares
  ];
}

export function generateSampleCurrentPrices(): CurrentPrices {
  return {
    RELIANCE: 2920.0,
    TCS: 4150.0,
    HDFCBANK: 1850.0,
    INFY: 1780.0,
    'M&M': 2980.0,
    BHARTIARTL: 1620.0,
    ITC: 465.0,
    ADANIENT: 2550.0,
    BAJFINANCE: 8200.0,
    TATAMOTORS: 750.0,
    WIPRO: 440.0,
    SBIN: 820.0,
    ZOMATO: 228.0,
    ASIANPAINT: 2180.0,
  };
}
