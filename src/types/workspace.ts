export interface Workspace {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  emailIds: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  sortOrder: number;
}

export type TodoPriority = 'high' | 'medium' | 'low';
export type TodoStatus = 'pending' | 'in_progress' | 'done';

export interface TodoItem {
  id: string;
  workspaceId: string; // 'general' for non-workspace tasks
  sourceEmailId?: string;
  sourceEmailSubject?: string;
  sourceEmailFrom?: string;
  title: string;
  description?: string;
  priority: TodoPriority;
  status: TodoStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isAutoExtracted: boolean;
}

export type WorkspaceFileType = 'note' | 'document' | 'image' | 'other';

export interface WorkspaceFile {
  id: string;
  workspaceId: string;
  name: string;
  type: WorkspaceFileType;
  mimeType: string;
  size: number;
  content?: string;
  blobKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WritingStyleProfile {
  id: string;
  userId: string;
  analyzedEmailCount: number;
  lastAnalyzedAt: string;
  styleFingerprint: {
    averageSentenceLength: number;
    formalityScore: number;
    greetingPatterns: string[];
    closingPatterns: string[];
    commonPhrases: string[];
    toneKeywords: string[];
    languages: string[];
    vocabularyLevel: 'simple' | 'moderate' | 'advanced';
  };
  rawStyleSummary: string;
  sampleExcerpts: string[];
  createdAt: string;
  updatedAt: string;
}
