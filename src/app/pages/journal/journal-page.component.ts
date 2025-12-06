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
    if (this.filter === 'all') return this.entries;
    return this.entries.filter(e => e.type === this.filter);
  }

  cancelEdit() {
    this.editing = null;
    this.form.reset({ type: 'task' });
  }
}