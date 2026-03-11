import type { PortfolioPosition, PortfolioSnapshot, PortfolioSummary, AllocationSlice } from '@/types/investment';
import { calculatePortfolioSummary, calculateAllocations, formatCurrency, formatPercent } from './investment-utils';

export type InsightType = 'risk' | 'opportunity' | 'diversification' | 'performance' | 'rebalance' | 'milestone';
export type InsightSeverity = 'high' | 'medium' | 'low';

export interface PortfolioInsight {
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  body: string;
  action?: string;
}

export interface PortfolioAnalysis {
  insights: PortfolioInsight[];
  portfolioScore: number;
  summary: string;
}

export function buildAnalysisPrompt(
  positions: PortfolioPosition[],
  snapshots: PortfolioSnapshot[],
  summary: PortfolioSummary,
  allocations: AllocationSlice[]
): string {
  const positionLines = positions.map((p) => {
    const value = p.quantity * p.currentPrice;
    const cost = p.quantity * p.avgCostBasis;
    const pnl = value - cost;
    const pnlPct = cost > 0 ? ((pnl / cost) * 100).toFixed(1) : '0';
    return `- ${p.ticker} (${p.name}): ${p.quantity} units, cost ${formatCurrency(p.avgCostBasis)}, now ${formatCurrency(p.currentPrice)}, value ${formatCurrency(value)}, P&L ${formatCurrency(pnl)} (${pnlPct}%), type: ${p.assetType}`;
  }).join('\n');

  const allocationLines = allocations.map((a) =>
    `- ${a.label}: ${formatCurrency(a.value)} (${a.percent.toFixed(1)}%)`
  ).join('\n');

  const recentSnapshots = snapshots.slice(-30);
  const snapshotLines = recentSnapshots.length > 0
    ? recentSnapshots.map((s) => `- ${s.date}: ${formatCurrency(s.totalValue)}`).join('\n')
    : 'No historical data yet.';

  return `You are a smart portfolio analyst. Analyze this portfolio and provide actionable insights.

## Portfolio Summary
- Total Value: ${formatCurrency(summary.totalValue)}
- Total Cost Basis: ${formatCurrency(summary.totalCostBasis)}
- Total P&L: ${formatCurrency(summary.totalPnL)} (${formatPercent(summary.totalPnLPercent)})
- Number of Positions: ${summary.positionCount}
${summary.topGainer ? `- Top Gainer: ${summary.topGainer.ticker} (${formatPercent(summary.topGainer.pnlPercent)})` : ''}
${summary.topLoser ? `- Top Loser: ${summary.topLoser.ticker} (${formatPercent(summary.topLoser.pnlPercent)})` : ''}

## Positions
${positionLines || 'No positions.'}

## Allocation by Asset Type
${allocationLines || 'No allocations.'}

## Recent Value History (last 30 days)
${snapshotLines}

## Instructions
Analyze the portfolio and return a JSON object with:
1. **insights**: Array of 3-6 insight objects. Each insight has:
   - type: one of "risk", "opportunity", "diversification", "performance", "rebalance", "milestone"
   - severity: "high", "medium", or "low"
   - title: Short headline (5-10 words)
   - body: 1-2 sentence explanation
   - action: Optional 1-sentence recommendation

2. **portfolioScore**: Integer 0-100 rating the portfolio health:
   - 80-100: Well diversified, balanced, good returns
   - 60-79: Decent but has some issues
   - 40-59: Needs attention
   - 0-39: High risk / problems

3. **summary**: 2-3 sentence overview of the portfolio state

Focus on:
- Concentration risk (too much in one stock or asset type)
- Diversification quality (asset types, number of holdings)
- Performance trends (from snapshots)
- Winners/losers that might need attention
- Rebalancing opportunities
- Any milestones (e.g., portfolio passed a round number)

Respond ONLY with valid JSON, no markdown or explanation outside the JSON.`;
}

export function parseInsightsResponse(raw: string): PortfolioAnalysis {
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json?\s*/gi, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      insights: Array.isArray(parsed.insights) ? parsed.insights.slice(0, 8) : [],
      portfolioScore: typeof parsed.portfolioScore === 'number'
        ? Math.max(0, Math.min(100, Math.round(parsed.portfolioScore)))
        : 50,
      summary: typeof parsed.summary === 'string' ? parsed.summary : 'Unable to generate summary.',
    };
  } catch {
    return {
      insights: [],
      portfolioScore: 50,
      summary: 'Could not parse analysis. Try again.',
    };
  }
}
