import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JournalService } from '../../core/services/journal.service';
import { JournalEntry, EntryType } from '../../core/models/journal-entry';

@Component({
  standalone: true,
  selector: 'app-journal-page',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './journal-page.component.html',
  styleUrls: ['./journal-page.component.css']
})
export class JournalPageComponent implements OnInit {
  entries: JournalEntry[] = [];
  form: FormGroup;
  editing: JournalEntry | null = null;
  filter: EntryType | 'all' = 'all';
  searchQuery: string = '';
  showForm: boolean = false;

  constructor(private js: JournalService, private fb: FormBuilder) {
    this.form = this.fb.group({
      type: ['task', Validators.required],
      title: ['', [Validators.required, Validators.minLength(2)]],
      notes: [''],
      date: [''],
      tags: ['']
    });
  }

  ngOnInit() {
    this.load();
    // Subscribe to list to ensure entries are loaded from API on init
    this.js.list().subscribe(entries => {
      if (Array.isArray(entries)) {
        this.entries = entries;
        console.log('JournalPageComponent: Entries loaded from API on init:', this.entries);
      }
    });
  }

  load() {
    // This method is primarily for local storage fallback or initial sync
    const loadedEntries = this.js.getAll();
    this.entries = Array.isArray(loadedEntries) ? loadedEntries : [];
    console.log('JournalPageComponent: Entries loaded from local storage (or initial):', this.entries);
  }

  submit() {
    if (this.form.invalid) {
      console.warn('Form is invalid, not submitting.');
      this.markFormGroupTouched();
      return;
    }
    const value = this.form.value;
    const payload = {
      type: value.type as EntryType,
      title: value.title.trim(),
      notes: value.notes?.trim() || undefined,
      completed: false, // Default for new entries, can be overridden by API
      date: value.date || undefined,
      tags: value.tags ? value.tags.split(',').map((t:string)=>t.trim()).filter(Boolean) : undefined
    };

    if (this.editing) {
      console.log('Updating entry:', this.editing.id, payload);
      this.js.update(this.editing.id, payload as Partial<JournalEntry>);
      this.editing = null;
      this.load(); // Optimistic update
      // Reload from API after update
      setTimeout(() => {
        this.js.list().subscribe(entries => {
          if (Array.isArray(entries)) {
            this.entries = entries;
            console.log('JournalPageComponent: Entries reloaded from API after update:', this.entries);
          }
        });
      }, 500);
    } else {
      console.log('Adding new entry:', payload);
      this.js.add(payload);
      this.load(); // Optimistic update
      
      // Also try to fetch from API after a short delay to sync
      setTimeout(() => {
        this.js.list().subscribe(entries => {
          if (Array.isArray(entries)) {
            this.entries = entries;
            console.log('JournalPageComponent: Entries reloaded from API after add:', this.entries);
          }
        });
      }, 1000);
    }
    this.form.reset({ type: 'task' });
    this.showForm = false;
  }

  edit(e: JournalEntry) {
    console.log('Editing entry:', e);
    this.editing = e;
    this.showForm = true; // Ensure form is shown when editing
    this.form.patchValue({ type: e.type, title: e.title, notes: e.notes, date: e.date, tags: e.tags?.join(', ') });
    // Scroll to form after a short delay to ensure it's rendered
    setTimeout(() => {
      const formElement = document.querySelector('.form-section');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  }

  remove(id: string) {
    if (!confirm('Delete this entry?')) return;
    console.log('Removing entry:', id);
    this.js.remove(id);
    this.load(); // Optimistic update
    // Reload from API after deletion
    setTimeout(() => {
      this.js.list().subscribe(entries => {
        if (Array.isArray(entries)) {
          this.entries = entries;
          console.log('JournalPageComponent: Entries reloaded from API after delete:', this.entries);
        }
      });
    }, 500);
  }

  toggle(id: string) {
    console.log('Toggling entry:', id);
    this.js.toggleComplete(id);
    this.load(); // Optimistic update
    // Reload from API after toggle
    setTimeout(() => {
      this.js.list().subscribe(entries => {
        if (Array.isArray(entries)) {
          this.entries = entries;
          console.log('JournalPageComponent: Entries reloaded from API after toggle:', this.entries);
        }
      });
    }, 500);
  }

  filtered() {
    // Ensure entries is always an array
    const allEntries = Array.isArray(this.entries) ? this.entries : [];
    console.log(`Filtering entries. Total: ${allEntries.length} Filter: ${this.filter} Search: "${this.searchQuery}"`);
    let filtered = allEntries;
    
    // Filter by type (case-insensitive comparison)
    if (this.filter !== 'all') {
      filtered = filtered.filter(e => e.type.toLowerCase() === this.filter.toLowerCase());
      console.log(`After type filter (${this.filter}): ${allEntries.length} -> ${filtered.length}`);
    }
    
    // Filter by search query
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.notes?.toLowerCase().includes(query) ||
        e.tags?.some(tag => tag.toLowerCase().includes(query))
      );
      console.log(`After search filter ("${this.searchQuery}"): ${allEntries.length} -> ${filtered.length}`);
    }
    
    console.log('Filtered entries:', filtered);
    return filtered;
  }

  getStats() {
    const all = Array.isArray(this.entries) ? this.entries : [];
    return {
      total: all.length,
      tasks: all.filter(e => e.type.toLowerCase() === 'task').length,
      notes: all.filter(e => e.type.toLowerCase() === 'note').length,
      events: all.filter(e => e.type.toLowerCase() === 'event').length,
      habits: all.filter(e => e.type.toLowerCase() === 'habit').length,
      emotions: all.filter(e => e.type.toLowerCase() === 'emotion').length, // Added emotions stat
      completed: all.filter(e => e.completed).length,
      pending: all.filter(e => !e.completed && e.type.toLowerCase() === 'task').length
    };
  }

  getEntryTypeIcon(type: EntryType): string {
    const icons: Record<EntryType, string> = {
      task: '✓',
      note: '📝',
      event: '📅',
      habit: '🔄',
      emotion: '😊' // Added emotion icon
    };
    return icons[type] || '•';
  }

  getEntryTypeColor(type: EntryType): string {
    const colors: Record<EntryType, string> = {
      task: '#3b82f6',
      note: '#10b981',
      event: '#f59e0b',
      habit: '#8b5cf6',
      emotion: '#ef4444' // Added emotion color
    };
    return colors[type] || '#6b7280';
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.editing = null; // Clear editing state when opening new form
      this.form.reset({ type: 'task' }); // Reset form for new entry
      // Scroll to form
      setTimeout(() => {
        const formElement = document.querySelector('.form-section');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 0);
    } else {
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.editing = null;
    this.showForm = false;
    this.form.reset({ type: 'task' });
  }

  clearSearch() {
    this.searchQuery = '';
  }

  private markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      this.form.controls[key].markAsTouched();
    });
  }
}