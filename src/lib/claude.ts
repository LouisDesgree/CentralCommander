import OpenAI from 'openai';

export function createClaudeClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export const CLAUDE_MODEL = 'gpt-4.1';
