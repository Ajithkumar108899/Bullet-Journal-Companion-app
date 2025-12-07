import { Component } from '@angular/core';
import { ConversionEngineService } from '../../../core/services/conversion-engine.service';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-conversion-engine',
  imports: [CommonModule,NgIf],
  templateUrl: './conversion-engine.html',
  styleUrl: './conversion-engine.css',
})
export class ConversionEngine {
 loading = true;
  data: any = {};
  selectedProfile: string | null = null;
  showExportOptions = false;

  constructor(private conversionService: ConversionEngineService) {}

  ngOnInit() {
    this.conversionService.getConvertedReport().subscribe((res) => {
      this.data = res;
      this.loading = false;
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
