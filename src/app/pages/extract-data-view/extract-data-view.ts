import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { timer } from 'rxjs';
interface ExtractedItem {
  title: string;
  type: string;
  symbol: string;
  status: string;
  createdDate: string;
}
@Component({
  selector: 'app-extract-data-view',
  imports: [CommonModule],
  templateUrl: './extract-data-view.html',
  styleUrl: './extract-data-view.css',
})
export class ExtractDataView {
 loading = false;

  extractedItems: ExtractedItem[] = [];

  startExtraction() {
    this.loading = true;

    setTimeout(() => {
      this.extractedItems = [
        {
          title: 'Feeling Happy',
          type: 'Emotion',
          symbol: '😊',
          status: 'None',
          createdDate: 'Dec 7, 10:32 AM',
        },
        {
          title: 'Hackathon Participation',
          type: 'Progress',
          symbol: '/',
          status: 'In Progress',
          createdDate: 'Dec 7, 09:10 AM',
        },
        {
          title: 'Pongal Event',
          type: 'Event',
          symbol: 'O',
          status: 'Upcoming',
          createdDate: 'Dec 7, 08:20 AM',
        },
        {
          title: 'Completed Report',
          type: 'Completed',
          symbol: 'X',
          status: 'Completed',
          createdDate: 'Dec 6, 06:30 PM',
        },
        {
          title: 'Buy Fruits',
          type: 'Note',
          symbol: '-',
          status: 'None',
          createdDate: 'Dec 6, 06:20 PM',
        },
        {
          title: 'Be Creative Today',
          type: 'Inspiration',
          symbol: '*',
          status: 'None',
          createdDate: 'Dec 6, 06:15 PM',
        },
      ];

      this.loading = false;
    }, 1200);
  }
}
