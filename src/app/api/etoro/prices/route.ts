import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('X-Etoro-Api-Key');
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
  }

  const tickers = request.nextUrl.searchParams.get('tickers');
  if (!tickers) {
    return NextResponse.json({ error: 'Missing tickers parameter' }, { status: 400 });
  }

  try {
    // eToro Public API - fetch market data for instruments
    const response = await fetch(`https://api.etoro.com/sapi/candles/desc.json/OneDay/1?Symbols=${encodeURIComponent(tickers)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `eToro API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Normalize price data
    const prices: Record<string, number> = {};
    if (Array.isArray(data)) {
      for (const item of data) {
        const symbol = item.SymbolFull ?? item.InstrumentName;
        const price = item.Close ?? item.CurrentRate ?? item.LastPrice;
        if (symbol && price) {
          prices[symbol] = price;
        }
      }
    }

    return NextResponse.json({ prices });
  } catch (error) {
    console.error('eToro prices fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}
