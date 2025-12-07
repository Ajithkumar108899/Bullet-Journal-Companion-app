import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { catchError, of, timeout, finalize } from 'rxjs';

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
export class ExtractDataView implements OnInit {
  loading = false;
  errorMsg: string | null = null;
  extractedItems: ExtractedItem[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Reset state
    this.loading = false;
    this.errorMsg = null;
    this.extractedItems = [];
    
    // Automatically load data when component initializes
    console.log('🔄 ExtractDataView component initialized, loading data...');
    this.loadExtractedData();
  }

  loadExtractedData() {
    this.loading = true;
    this.errorMsg = null;

    const token = this.authService.getToken();
    if (!token) {
      this.errorMsg = 'You must be logged in to view extracted data.';
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'accept': 'application/json'
    });

    // Get journalPageId from localStorage (set by scan API)
    const lastScanPageId = localStorage.getItem('bjc:lastScanPageId');
    let apiUrl = `${environment.apiBaseUrl}/journal/extractedData`;
    
    // If we have a journalPageId from the last scan, use it to get only that scan's data
    if (lastScanPageId) {
      apiUrl += `?journalPageId=${lastScanPageId}`;
      console.log('📄 Using journalPageId from last scan:', lastScanPageId);
    } else {
      console.log('📄 No journalPageId found, fetching all scanned entries');
    }
    
    console.log('Fetching extracted data from:', apiUrl);

    this.http.get<ExtractedItem[]>(apiUrl, { headers })
      .pipe(
        timeout(15000), // 15 second timeout
        catchError((error: any) => {
          console.error('❌ Error fetching extracted data:', error);
          
          // Check for timeout
          if (error.name === 'TimeoutError' || error.name === 'timeout') {
            this.errorMsg = 'Request timed out. The server is taking too long to respond. Please try again.';
            console.error('Timeout error - API took more than 15 seconds');
          } else if (error.status === 0) {
            this.errorMsg = 'Cannot connect to server. Please check if the backend API is running.';
            console.error('Connection error - server not reachable');
          } else if (error.status === 401) {
            this.errorMsg = 'Your session has expired. Please login again.';
            console.error('Authentication error - token expired');
          } else if (error.status === 403) {
            this.errorMsg = 'You do not have permission to view this data.';
            console.error('Authorization error - access denied');
          } else if (error.status === 404) {
            this.errorMsg = 'API endpoint not found. Please check backend configuration.';
            console.error('404 error - endpoint does not exist');
          } else if (error.status === 500) {
            this.errorMsg = 'Server error. Please try again later.';
            console.error('500 error - server internal error');
          } else {
            this.errorMsg = `Failed to load extracted data. Error: ${error.message || 'Unknown error'}`;
            console.error('Unknown error:', error);
          }
          return of([]);
        }),
        finalize(() => {
          // Always clear loading state in finalize (runs whether success or error)
          this.loading = false;
          this.cdr.detectChanges(); // Force change detection
          console.log('🔄 Loading state cleared');
        })
      )
      .subscribe({
        next: (data: ExtractedItem[]) => {
          console.log('✅ Extracted data received:', data.length, 'items');
          
          // Format the date for display
          this.extractedItems = data.map(item => ({
            ...item,
            createdDate: this.formatDate(item.createdDate)
          }));
          
          console.log('✅ Extracted data loaded and formatted:', this.extractedItems.length, 'items');
          
          if (data.length === 0 && !this.errorMsg) {
            // No error but no data - this is fine, just show empty state
            console.log('ℹ️ No extracted data found from scanned images.');
          }
          
          // Force change detection after data update
          this.cdr.detectChanges();
        },
        error: (error) => {
          // This should not be reached if catchError returns of([])
          console.error('❌ Unexpected error in subscribe:', error);
          this.errorMsg = 'An unexpected error occurred. Please try again.';
          this.cdr.detectChanges();
        }
      });
  }

  startExtraction() {
    // Reload data
    this.loadExtractedData();
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      // Parse ISO date string (e.g., "2025-12-07T13:31:42.003Z")
      const date = new Date(dateString);
      
      // Format as "Dec 7, 10:32 AM"
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const day = date.getDate();
      
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      
      return `${month} ${day}, ${hours}:${minutesStr} ${ampm}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original if parsing fails
    }
  }
}
