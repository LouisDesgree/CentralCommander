import Anthropic from '@anthropic-ai/sdk';

export function createClaudeClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
