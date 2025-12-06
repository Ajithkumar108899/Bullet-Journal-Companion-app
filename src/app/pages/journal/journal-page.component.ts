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
    this.js.list().subscribe(entries => {
      this.entries = entries;
    });
  }

  load() {
    
    this.entries = this.js.getAll();
  }

  submit() {
    if (this.form.invalid) return;
    const value = this.form.value;
    const payload = {
      type: value.type as EntryType,
      title: value.title.trim(),
      notes: value.notes?.trim() || undefined,
      completed: false,
      date: value.date || undefined,
      tags: value.tags ? value.tags.split(',').map((t:string)=>t.trim()).filter(Boolean) : undefined
    };
    if (this.editing) {
      this.js.update(this.editing.id, payload as Partial<JournalEntry>);
      this.editing = null;
    } else {
      this.js.add(payload);
    }
    this.form.reset({ type: 'task' });
    this.load();
  }

  edit(e: JournalEntry) {
    this.editing = e;
    this.form.patchValue({ type: e.type, title: e.title, notes: e.notes, date: e.date, tags: e.tags?.join(', ') });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(id: string) {
    if (!confirm('Delete this entry?')) return;
    this.js.remove(id);
    this.load();
  }

  toggle(id: string) {
    this.js.toggleComplete(id);
    this.load();
  }

  filtered() {
    let filtered = this.entries;
    
    // Filter by type
    if (this.filter !== 'all') {
      filtered = filtered.filter(e => e.type === this.filter);
    }
    
    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.notes?.toLowerCase().includes(query) ||
        e.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }

  getStats() {
    const all = this.entries;
    return {
      total: all.length,
      tasks: all.filter(e => e.type === 'task').length,
      notes: all.filter(e => e.type === 'note').length,
      events: all.filter(e => e.type === 'event').length,
      habits: all.filter(e => e.type === 'habit').length,
      completed: all.filter(e => e.completed).length,
      pending: all.filter(e => !e.completed && e.type === 'task').length
    };
  }

  getEntryTypeIcon(type: EntryType): string {
    const icons: Record<EntryType, string> = {
      task: '✓',
      note: '📝',
      event: '📅',
      habit: '🔄'
    };
    return icons[type] || '•';
  }

  getEntryTypeColor(type: EntryType): string {
    const colors: Record<EntryType, string> = {
      task: '#3b82f6',
      note: '#10b981',
      event: '#f59e0b',
      habit: '#8b5cf6'
    };
    return colors[type] || '#6b7280';
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
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
}