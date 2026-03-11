import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('X-Etoro-Api-Key');
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
  }

  try {
    // eToro Public API - fetch portfolio positions
    // API docs: https://api-portal.etoro.com/
    const response = await fetch('https://api.etoro.com/sapi/trade-data-real/live/public/portfolios?format=json', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('eToro API error:', response.status, errorText);
      return NextResponse.json(
        { error: `eToro API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Normalize eToro positions to our format
    const positions = (data.AggregatedPositions ?? data.positions ?? []).map((pos: any) => ({
      etoroPositionId: String(pos.PositionID ?? pos.InstrumentID ?? ''),
      ticker: pos.SymbolFull ?? pos.InstrumentName ?? 'UNKNOWN',
      name: pos.InstrumentName ?? pos.SymbolFull ?? 'Unknown',
      quantity: pos.Amount ?? pos.Units ?? 0,
      avgCostBasis: pos.OpenRate ?? pos.AvgOpenRate ?? 0,
      currentPrice: pos.CurrentRate ?? pos.CloseRate ?? 0,
      direction: pos.Direction ?? 'Buy',
      pnl: pos.NetProfit ?? 0,
    }));

    return NextResponse.json({ positions, raw: data });
  } catch (error) {
    console.error('eToro portfolio fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch eToro portfolio' }, { status: 500 });
  }
}
