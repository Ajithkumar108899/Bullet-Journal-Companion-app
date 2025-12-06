import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { JournalEntry } from '../models/journal-entry';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'bjc:entries';

@Injectable({ providedIn: 'root' })
export class JournalService {
   private isBrowser: boolean = typeof window !== 'undefined';
  private entries: JournalEntry[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.load();
  }

  private save() {
    if (!this.isBrowser) {
      return; // ❗ SSR MODE — skip localStorage
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
  }

  private load() {
    if (!this.isBrowser) {
      return; // ❗ SSR MODE — skip localStorage
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.entries = JSON.parse(raw) as JournalEntry[];
      } catch {
        this.entries = [];
      }
    } else {
      this.entries = this.seedDemo();
      this.save();
    }
  }

  private seedDemo(): JournalEntry[] {
    const now = new Date().toISOString();
    return [
      { id: '1', type: 'task', title: 'Morning run', notes: '3 km around park', completed: false, date: new Date().toISOString().slice(0,10), createdAt: now, tags: ['health'] },
      { id: '2', type: 'note', title: 'Ideas for app', notes: 'Add monthly review view', createdAt: now, tags: ['brainstorm'] },
      { id: '3', type: 'event', title: 'Doctor appointment', notes: '2pm clinic', date: new Date().toISOString().slice(0,10), createdAt: now, tags: ['health'] }
    ];
  }

  getAll(): JournalEntry[] {
    return [...this.entries].sort((a,b) => (b.createdAt.localeCompare(a.createdAt)));
  }

  getById(id: string): JournalEntry | undefined {
    return this.entries.find(e => e.id === id);
  }

  // add(entry: Omit<JournalEntry,'id'|'createdAt'|'updatedAt'>) {
  //   const now = new Date().toISOString();
  //   const newEntry: JournalEntry = { ...entry, id: this.uid(), createdAt: now, updatedAt: undefined };
  //   this.entries.unshift(newEntry);
  //   this.save();
  //   return newEntry;
  // }

   add(entry: Omit<JournalEntry,'id'|'createdAt'|'updatedAt'>) {
    const now = new Date().toISOString();
    const newEntry: JournalEntry = { ...entry, id: this.uid(), createdAt: now };
    this.entries.unshift(newEntry);
    this.save();
    return newEntry;
  }

  update(id: string, patch: Partial<JournalEntry>) {
    const idx = this.entries.findIndex(e => e.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    this.entries[idx] = { ...this.entries[idx], ...patch, updatedAt: now };
    this.save();
    return this.entries[idx];
  }

  remove(id: string) {
    const before = this.entries.length;
    this.entries = this.entries.filter(e => e.id !== id);
    const after = this.entries.length;
    if (before !== after) this.save();
    return before !== after;
  }

  // toggleComplete(id: string) {
  //   const e = this.getById(id);
  //   if (!e) return null;
  //   e.completed = !e.completed;
  //   e.updatedAt = new Date().toISOString();
  //   this.save();
  //   return e;
  // }
  toggleComplete(id: string) {
    const e = this.getById(id);
    if (!e) return null;
    return this.update(id, { completed: !e.completed });
  }

  private uid() {
    return Math.random().toString(36).slice(2,10);
  }
}
