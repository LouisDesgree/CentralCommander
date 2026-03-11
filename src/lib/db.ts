import Dexie, { type Table } from 'dexie';
import type { Workspace, TodoItem, WorkspaceFile, WritingStyleProfile } from '@/types/workspace';
import type { PortfolioPosition, PortfolioSnapshot, InvestmentSettings } from '@/types/investment';

export class CentralCommanderDB extends Dexie {
  workspaces!: Table<Workspace, string>;
  todos!: Table<TodoItem, string>;
  files!: Table<WorkspaceFile, string>;
  fileBlobs!: Table<{ id: string; blob: Blob }, string>;
  writingStyles!: Table<WritingStyleProfile, string>;
  portfolioPositions!: Table<PortfolioPosition, string>;
  portfolioSnapshots!: Table<PortfolioSnapshot, string>;
  investmentSettings!: Table<InvestmentSettings, string>;

  constructor() {
    super('CentralCommanderDB');
    this.version(1).stores({
      workspaces: 'id, name, isPinned, sortOrder, updatedAt',
      todos: 'id, workspaceId, status, priority, dueDate, sourceEmailId',
      files: 'id, workspaceId, type, updatedAt',
      fileBlobs: 'id',
      writingStyles: 'id, userId',
    });
    this.version(2).stores({
      workspaces: 'id, name, isPinned, sortOrder, updatedAt',
      todos: 'id, workspaceId, status, priority, dueDate, sourceEmailId',
      files: 'id, workspaceId, type, updatedAt',
      fileBlobs: 'id',
      writingStyles: 'id, userId',
      portfolioPositions: 'id, ticker, assetType, source, updatedAt',
      portfolioSnapshots: 'id, date',
      investmentSettings: 'id',
    });
  }
}

export const db = new CentralCommanderDB();

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
