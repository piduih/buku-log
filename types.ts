
export interface Logbook {
  id: string;
  name: string;
  createdAt: string;
}

export type EntryType = 'expense' | 'income';

export interface LogEntry {
  id: string;
  logbookId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  cost: number;
  // `type` indicates whether the entry is an expense or a recorded income. If missing, default to 'expense' for backward compatibility.
  type?: EntryType;
  notes?: string;
  attachment?: string; // Base64 encoded image
}

export type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all';

