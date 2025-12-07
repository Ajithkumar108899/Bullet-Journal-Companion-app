import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { timer } from 'rxjs';

@Component({
  selector: 'app-extract-data-view',
  imports: [CommonModule],
  templateUrl: './extract-data-view.html',
  styleUrl: './extract-data-view.css',
})
export class ExtractDataView {
 loading = false;
  result: any = null;

  /** Trigger Extraction */
  startExtraction() {
    this.loading = true;
    this.result = null;

    // Simulated API delay (dummy data)
    timer(2000).subscribe(() => {
      this.loading = false;

      this.result = {
        symbols: ["✔", "★", "⚠", "❗"],
        status: "Approved",
        categories: ["Task", "Priority", "Reminder"],

        normalized: {
          id: "TASK-001",
          title: "Buy Groceries",
          status: "Approved",
          priority: "High",
          createdAt: "2025-01-08T10:30:00Z",
          detectedSymbols: ["✔", "★"],
        }
      };
    });
  }

  /** Reset Data */
  reset() {
    this.result = null;
    this.loading = false;
  }

}
