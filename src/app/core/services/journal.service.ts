import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { JournalEntry } from '../models/journal-entry';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'bjc:entries';
@Injectable({ providedIn: 'root' })
export class JournalService {
  private entries: JournalEntry[] = [];
  private isBrowser: boolean;
  private base = `${environment.apiBaseUrl}/journal`;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.load();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
    return headers;
  }

  private save() {
     if (!this.isBrowser) {
      return;   // prevents SSR crash
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
  }

  private load() {
    if (!this.isBrowser) {
      this.entries = []; // Initialize as empty array for SSR
      return;   // prevents SSR crash
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as JournalEntry[];
        // Ensure parsed data is an array
        this.entries = Array.isArray(parsed) ? parsed : [];
      } catch {
        this.entries = [];
      }
    } else {
      this.entries = this.seedDemo();
      this.save();
    }
    
    // Final safety check - ensure entries is always an array
    if (!Array.isArray(this.entries)) {
      this.entries = [];
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
    // Ensure entries is always an array
    if (!Array.isArray(this.entries)) {
      this.entries = [];
    }
    return [...this.entries].sort((a,b) => (b.createdAt.localeCompare(a.createdAt)));
  }

  getById(id: string): JournalEntry | undefined {
    return this.entries.find(e => e.id === id);
  }

  add(entry: Omit<JournalEntry,'id'|'createdAt'|'updatedAt'>): JournalEntry {
    // Create entry immediately in local storage for UI responsiveness
    const now = new Date().toISOString();
    const tempId = this.uid();
    const newEntry: JournalEntry = { 
      ...entry, 
      id: tempId, 
      createdAt: now, 
      updatedAt: undefined 
    };
    
    // Add to local entries immediately
    this.entries.unshift(newEntry);
    this.save();
    
    // Try API if authenticated (will update the entry with real ID from API)
    const token = this.authService.getToken();
    if (token && this.authService.isAuthenticated()) {
      this.create(entry).subscribe({
        next: (apiEntry) => {
          console.log('Journal entry created via API:', apiEntry);
          // Replace temporary entry with API entry
          const index = this.entries.findIndex(e => e.id === tempId);
          if (index !== -1) {
            this.entries[index] = apiEntry;
          } else {
            // If not found, add it
            this.entries.unshift(apiEntry);
          }
          this.save();
        },
        error: (error) => {
          console.error('API creation failed, keeping local entry:', error);
          // Keep the local entry - it's already added above
        }
      });
    }
    
    return newEntry;
  }

  update(id: string, patch: Partial<JournalEntry>): JournalEntry | null {
    const token = this.authService.getToken();
    if (token && this.authService.isAuthenticated()) {
      // Use API to update entry
      const headers = this.getHeaders();
      const apiPayload = {
        type: patch.type,
        title: patch.title,
        notes: patch.notes !== undefined ? (patch.notes || null) : undefined,
        completed: patch.completed,
        date: patch.date !== undefined ? (patch.date || null) : undefined,
        tags: patch.tags
      };

      // Remove undefined fields
      Object.keys(apiPayload).forEach(key => {
        if (apiPayload[key as keyof typeof apiPayload] === undefined) {
          delete apiPayload[key as keyof typeof apiPayload];
        }
      });

      // Use the new updateEntries endpoint that supports type changes
      this.http.put<JournalEntry>(`${this.base}/updateEntries/${id}`, apiPayload, { headers })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error updating journal entry:', error);
            // Fallback to local storage
            const idx = this.entries.findIndex(e => e.id === id);
            if (idx === -1) return of(null);
            const now = new Date().toISOString();
            this.entries[idx] = { ...this.entries[idx], ...patch, updatedAt: now };
            this.save();
            return of(this.entries[idx]);
          })
        )
        .subscribe((response: any) => {
          if (response) {
            const updatedEntry: JournalEntry = {
              id: response.id || id,
              type: response.type || patch.type!,
              title: response.title || patch.title!,
              notes: response.notes !== undefined ? response.notes : patch.notes,
              completed: response.completed !== undefined ? response.completed : patch.completed,
              date: response.date !== undefined ? response.date : patch.date,
              createdAt: response.createdAt || this.entries.find(e => e.id === id)?.createdAt || new Date().toISOString(),
              updatedAt: response.updatedAt || new Date().toISOString(),
              tags: response.tags || patch.tags || []
            };
            
            const idx = this.entries.findIndex(e => e.id === id);
            if (idx !== -1) {
              this.entries[idx] = updatedEntry;
            } else {
              this.entries.unshift(updatedEntry);
            }
            this.save();
          }
        });

      // Return local entry immediately (will be updated by API response)
      const idx = this.entries.findIndex(e => e.id === id);
      if (idx === -1) return null;
      const now = new Date().toISOString();
      this.entries[idx] = { ...this.entries[idx], ...patch, updatedAt: now };
      this.save();
      return this.entries[idx];
    } else {
      // Fallback to local storage
      const idx = this.entries.findIndex(e => e.id === id);
      if (idx === -1) return null;
      const now = new Date().toISOString();
      this.entries[idx] = { ...this.entries[idx], ...patch, updatedAt: now };
      this.save();
      return this.entries[idx];
    }
  }

  remove(id: string): boolean {
    const token = this.authService.getToken();
    if (token && this.authService.isAuthenticated()) {
      // Use API to delete entry - use the new deleteEntriesById endpoint
      const headers = this.getHeaders();
      this.http.delete(`${this.base}/deleteEntriesById/${id}`, { headers })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error deleting journal entry:', error);
            // Fallback to local storage
            const before = this.entries.length;
            this.entries = this.entries.filter(e => e.id !== id);
            const after = this.entries.length;
            if (before !== after) this.save();
            return of({ success: before !== after });
          })
        )
        .subscribe(() => {
          // Remove from local storage after successful API deletion
          const before = this.entries.length;
          this.entries = this.entries.filter(e => e.id !== id);
          const after = this.entries.length;
          if (before !== after) this.save();
        });

      // Optimistically remove from local storage
      const before = this.entries.length;
      this.entries = this.entries.filter(e => e.id !== id);
      const after = this.entries.length;
      if (before !== after) this.save();
      return before !== after;
    } else {
      // Fallback to local storage
      const before = this.entries.length;
      this.entries = this.entries.filter(e => e.id !== id);
      const after = this.entries.length;
      if (before !== after) this.save();
      return before !== after;
    }
  }

  toggleComplete(id: string): JournalEntry | null {
    const token = this.authService.getToken();
    const entry = this.getById(id);
    if (!entry) return null;

    if (token && this.authService.isAuthenticated()) {
      // Use API to toggle completion
      const headers = this.getHeaders();
      const newCompleted = !entry.completed;
      
      this.http.patch<JournalEntry>(`${this.base}/entries/${id}/toggle`, { completed: newCompleted }, { headers })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error toggling journal entry:', error);
            // Fallback to local storage
            entry.completed = newCompleted;
            entry.updatedAt = new Date().toISOString();
            this.save();
            return of(entry);
          })
        )
        .subscribe((response: any) => {
          if (response) {
            const updatedEntry: JournalEntry = {
              id: response.id || id,
              type: response.type || entry.type,
              title: response.title || entry.title,
              notes: response.notes !== undefined ? response.notes : entry.notes,
              completed: response.completed !== undefined ? response.completed : newCompleted,
              date: response.date !== undefined ? response.date : entry.date,
              createdAt: response.createdAt || entry.createdAt,
              updatedAt: response.updatedAt || new Date().toISOString(),
              tags: response.tags || entry.tags || []
            };
            
            const idx = this.entries.findIndex(e => e.id === id);
            if (idx !== -1) {
              this.entries[idx] = updatedEntry;
            }
            this.save();
          }
        });

      // Optimistically update local storage
      entry.completed = newCompleted;
      entry.updatedAt = new Date().toISOString();
      this.save();
      return entry;
    } else {
      // Fallback to local storage
      entry.completed = !entry.completed;
      entry.updatedAt = new Date().toISOString();
      this.save();
      return entry;
    }
  }

  private uid() {
    return Math.random().toString(36).slice(2,10);
  }
  list(): Observable<JournalEntry[]> {
    const token = this.authService.getToken();
    if (!token || !this.authService.isAuthenticated()) {
      // Return local entries if not authenticated
      return of(this.getAll());
    }

    const headers = this.getHeaders();
    console.log('Fetching entries from API:', `${this.base}/getAllEntries`);
    
    return this.http.get<any>(`${this.base}/getAllEntries`, { headers })
      .pipe(
        map((response: any) => {
          console.log('API Response received:', response);
          
          // Handle different response formats
          let entries: any[] = [];
          
          if (Array.isArray(response)) {
            // Direct array response
            entries = response;
          } else if (response && Array.isArray(response.data)) {
            // Wrapped in data
            entries = response.data;
          } else if (response && Array.isArray(response.entries)) {
            // Wrapped in entries
            entries = response.entries;
          } else if (response && response.content && Array.isArray(response.content)) {
            // Spring Boot Pageable response
            entries = response.content;
          } else {
            entries = [];
          }
          
          // Map API response to JournalEntry format
          const mappedEntries: JournalEntry[] = entries.map((entry: any) => {
            const mapped: JournalEntry = {
              id: String(entry.id || entry.entryId || this.uid()),
              type: (entry.type || 'note').toLowerCase(), // Ensure lowercase for consistency
              title: entry.title || entry.content || 'Untitled',
              notes: entry.notes || null,
              completed: entry.completed !== undefined ? entry.completed : false,
              date: entry.date || null,
              createdAt: entry.createdAt || new Date().toISOString(),
              updatedAt: entry.updatedAt || null,
              tags: entry.tags || []
            };
            console.log('Mapped entry:', { id: mapped.id, type: mapped.type, title: mapped.title });
            return mapped;
          });
          
          console.log('Mapped entries:', mappedEntries);
          
          // Update local storage with API entries (even if empty, to sync state)
          this.entries = mappedEntries;
          this.save();
          
          console.log(`Total entries loaded: ${mappedEntries.length}`);
          
          return mappedEntries;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching journal entries:', error);
          console.error('Error details:', error.error);
          // Fallback to local entries
          return of(this.getAll());
        })
      );
  }

  get(id: string): Observable<JournalEntry> {
    const token = this.authService.getToken();
    if (!token) {
      const localEntry = this.getById(id);
      return localEntry ? of(localEntry) : throwError(() => new Error('Entry not found'));
    }

    const headers = this.getHeaders();
    return this.http.get<JournalEntry>(`${this.base}/entries/${id}`, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching journal entry:', error);
          const localEntry = this.getById(id);
          return localEntry ? of(localEntry) : throwError(() => new Error('Entry not found'));
        })
      );
  }

  create(payload: Omit<JournalEntry,'id'|'createdAt'|'updatedAt'>): Observable<JournalEntry> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const headers = this.getHeaders();
    const apiPayload = {
      type: payload.type,
      title: payload.title,
      notes: payload.notes || null,
      completed: payload.completed || false,
      date: payload.date || null,
      tags: payload.tags || []
    };

    return this.http.post<JournalEntry>(`${this.base}/entries`, apiPayload, { headers })
      .pipe(
        map((response: any) => {
          const entry: JournalEntry = {
            id: String(response.id || response.entryId),
            type: response.type || payload.type!,
            title: response.title || payload.title!,
            notes: response.notes || payload.notes,
            completed: response.completed || false,
            date: response.date || payload.date,
            createdAt: response.createdAt || new Date().toISOString(),
            updatedAt: response.updatedAt,
            tags: response.tags || payload.tags || []
          };
          
          // Add to local entries
          this.entries.unshift(entry);
          this.save();
          
          return entry;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error creating journal entry:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to create entry'));
        })
      );
  }
}
