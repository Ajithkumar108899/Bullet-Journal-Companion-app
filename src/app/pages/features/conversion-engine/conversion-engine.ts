import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ConversionEngineService } from '../../../core/services/conversion-engine.service';
import { CommonModule, NgIf } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-conversion-engine',
  imports: [CommonModule, NgIf],
  templateUrl: './conversion-engine.html',
  styleUrl: './conversion-engine.css',
})
export class ConversionEngine implements OnInit {
  loading = true;
  data: { taskpaper?: string; markdown?: string } = {};
  selectedProfile: string | null = null;
  showExportOptions = false;
  error: string | null = null;

  constructor(
    private conversionService: ConversionEngineService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Reset state
    this.loading = true;
    this.error = null;
    this.data = {};
    
    // Automatically load data when component initializes
    console.log('🔄 ConversionEngine component initialized, loading data...');
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = null;
    
    console.log('📡 Fetching conversion data from API...');
    
    this.conversionService.getConvertedReport().pipe(
      finalize(() => {
        // Ensure loading state is always cleared (fallback)
        if (this.loading) {
          this.loading = false;
        }
        if (this.cdr) {
          this.cdr.detectChanges();
        }
      })
    ).subscribe({
      next: (res) => {
        console.log('✅ Conversion data loaded successfully:', res);
        // Update state
        this.data = res;
        this.loading = false;
        // Force change detection
        if (this.cdr) {
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('❌ Error loading conversion data:', err);
        // Update state
        this.error = 'Failed to load conversion data. Please try again.';
        this.loading = false;
        // Set default empty data
        this.data = {
          taskpaper: '# Tasks\n\nNo tasks found.\n',
          markdown: '# Notes & Emotions\n\nNo notes or emotions found.\n'
        };
        // Force change detection
        if (this.cdr) {
          this.cdr.detectChanges();
        }
      }
    });
  }

    // Profile click handler
  onProfileClick(profileName: string) {
    this.selectedProfile = profileName;
    this.showExportOptions = true;
  }

  // Close export options
  closeExportOptions() {
    this.showExportOptions = false;
    this.selectedProfile = null;
  }

  // ---------------------------------------------
  // Download single format (Taskpaper / Markdown)
  // ---------------------------------------------
  downloadAs(type: 'taskpaper' | 'markdown') {
    const content = this.data[type];

    if (!content) return;

    const filename =
      type === 'taskpaper'
        ? `${this.selectedProfile || 'report'}.taskpaper`
        : `${this.selectedProfile || 'report'}.md`;

    const blob = new Blob([content], { type: 'text/plain' });
    this.triggerDownload(blob, filename);
    this.closeExportOptions();
  }

  // ---------------------------------------------
  // Download All Formats in one text file
  // ---------------------------------------------
  downloadAll() {
    const combinedReport =
      `--- TaskPaper ---\n${this.data.taskpaper}\n\n` +
      `--- Markdown ---\n${this.data.markdown}`;

    const blob = new Blob([combinedReport], {
      type: 'text/plain'
    });

    this.triggerDownload(blob, `${this.selectedProfile || 'complete'}-report.txt`);
    this.closeExportOptions();
  }

  // ---------------------------------------------
  // Helper: Auto File Download
  // ---------------------------------------------
  private triggerDownload(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
  }
}
