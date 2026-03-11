import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createClaudeClient, CLAUDE_MODEL } from '@/lib/claude';
import { buildAnalysisPrompt, parseInsightsResponse } from '@/lib/portfolio-analysis';
import { calculatePortfolioSummary, calculateAllocations } from '@/lib/investment-utils';
import type { PortfolioPosition, PortfolioSnapshot } from '@/types/investment';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { positions, snapshots } = (await request.json()) as {
      positions: PortfolioPosition[];
      snapshots: PortfolioSnapshot[];
    };

    if (!positions || positions.length === 0) {
      return NextResponse.json({
        insights: [],
        portfolioScore: 0,
        summary: 'Add positions to get AI-powered insights.',
      });
    }

    const summary = calculatePortfolioSummary(positions);
    const allocations = calculateAllocations(positions);
    const prompt = buildAnalysisPrompt(positions, snapshots, summary, allocations);

    const openai = createClaudeClient();
    const response = await openai.chat.completions.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.choices[0].message.content ?? '{}';
    const analysis = parseInsightsResponse(raw);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Portfolio analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze portfolio' },
      { status: 500 }
    );
  }
}
