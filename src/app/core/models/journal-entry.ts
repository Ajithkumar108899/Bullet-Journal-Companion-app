export type EntryType = 'task' | 'note' | 'event' | 'habit';

export interface JournalEntry {
  id: string;
  type: EntryType;
  title: string;
  notes?: string;
  completed?: boolean;
  date?: string; // ISO date string for daily placement or event date
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
}
