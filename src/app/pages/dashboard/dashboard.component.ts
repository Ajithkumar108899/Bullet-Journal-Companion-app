import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JournalService } from '../../core/services/journal.service';
import { JournalEntry, EntryType } from '../../core/models/journal-entry';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  entries = signal<JournalEntry[]>([]);

  stats = computed(() => {
    const all = this.entries();
    return {
      total: all.length,
      tasks: all.filter(e => e.type === 'task').length,
      notes: all.filter(e => e.type === 'note').length,
      events: all.filter(e => e.type === 'event').length,
      habits: all.filter(e => e.type === 'habit').length,
      completed: all.filter(e => e.completed).length,
      pending: all.filter(e => !e.completed && e.type === 'task').length
    };
  });

  recentEntries: JournalEntry[] = [];
  upcomingEvents: JournalEntry[] = [];

  constructor(
    private authService: AuthService,
    private journalService: JournalService
  ) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  ngOnInit() {
    this.loadEntries();
  }

  loadEntries() {
    const allEntries = this.journalService.getAll();
    this.entries.set(allEntries);
    
    this.recentEntries = [...allEntries]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const today = new Date();
    this.upcomingEvents = allEntries
      .filter(e => e.type === 'event' && e.date)
      .filter(e => {
        const eventDate = new Date(e.date!);
        return eventDate >= today;
      })
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
      .slice(0, 3);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
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
}

