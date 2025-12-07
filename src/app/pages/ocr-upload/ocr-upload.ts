import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OcrService } from '../../core/services/ocr.service';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ocr-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ocr-upload.html',
  styleUrl: './ocr-upload.css',
})
export class OcrUpload implements AfterViewInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  preview: string | null = null;
  validated = false;
  scanning = false;
  scannedText: string | null = null;
  errorMsg: string | null = null;
  file!: File;
  pageNumber: number = 1;
  threadId: string = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

  constructor(
    private http: HttpClient, 
    private ocrService: OcrService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    // ViewChild is now available
  }

  /** -----------------------------
   *  Handle File Upload
   * ------------------------------ */
  onFile(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    this.errorMsg = null;
    this.preview = null;
    this.validated = false;
    this.scannedText = null;

    if (!file) return;

    // Allowed types
    const allowed = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    if (!allowed.includes(file.type)) {
      this.errorMsg = 'Only JPG, PNG, HEIC images allowed.';
      return;
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      this.errorMsg = 'File size must be below 5MB.';
      return;
    }

    this.file = file;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        this.preview = e.target.result as string;
        this.validated = true;
        // Force change detection to ensure image displays immediately
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      }
    };
    reader.onerror = () => {
      this.errorMsg = 'Error reading file. Please try again.';
      this.preview = null;
      this.validated = false;
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    };
    reader.readAsDataURL(file);
  }

  /** -----------------------------
   *  Simulated Scan Using Dummy API
   * ------------------------------ */
  // scan() {
  //   if (!this.validated) return;

  //   this.scanning = true;
  //   this.errorMsg = null;

  //   // -------- SIMULATED OCR API CALL -----------
  //   timer(2000).subscribe(() => {
  //     this.scanning = false;
  //     this.scannedText =
  //       'Dummy OCR Result:\n- This is sample text.\n- The real API will return actual extracted text.';
  //   });

  //   // For real call:
  //   // const formData = new FormData();
  //   // formData.append('file', this.file);
  //   // this.http.post('https://your-ocr-api.com/scan', formData).subscribe(...)
  // }

  scan() {
    if (!this.validated || !this.file) {
      this.errorMsg = 'Please upload an image first.';
      return;
    }

    // Get authentication token
    const token = this.authService.getToken();
    if (!token) {
      this.errorMsg = 'You must be logged in to scan images.';
      return;
    }

    // Verify user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.errorMsg = 'Your session has expired. Please login again.';
      return;
    }

    // Debug: Log token (first 20 chars only for security)
    console.log('Token exists:', !!token, 'Token length:', token.length);
    console.log('Token preview:', token.substring(0, 20) + '...');
    console.log('User authenticated:', this.authService.isAuthenticated());
    console.log('Current user:', this.authService.currentUser());

    this.scanning = true;
    this.errorMsg = null;
    this.scannedText = null;

    // Create FormData with required fields
    const formData = new FormData();
    formData.append('image', this.file);
    formData.append('pageNumber', this.pageNumber.toString());
    formData.append('threadId', this.threadId);

    // Debug: Log FormData contents
    console.log('FormData contents:');
    console.log('- image:', this.file.name, this.file.type, this.file.size);
    console.log('- pageNumber:', this.pageNumber);
    console.log('- threadId:', this.threadId);

    // Set headers with Authorization token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'accept': 'application/json'
      // Note: Don't set Content-Type for FormData, browser will set it automatically with boundary
    });

    const apiUrl = `${environment.apiBaseUrl}/journal/scan`;
    console.log('API URL:', apiUrl);
    console.log('Request headers:', {
      'Authorization': `Bearer ${token.substring(0, 20)}...`,
      'accept': 'application/json'
    });

    // Call the API
    this.http.post<any>(apiUrl, formData, { headers })
      .pipe(
        catchError((err: any) => {
          console.error('Journal scan API error - Full error:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
          console.error('Error error:', err.error);
          
          let errorMessage = 'Scan failed. Please try again.';
          
          if (err.error) {
            if (err.error.message) {
              errorMessage = err.error.message;
            } else if (err.error.error) {
              errorMessage = err.error.error;
            } else if (typeof err.error === 'string') {
              errorMessage = err.error;
            } else if (err.error.status) {
              errorMessage = `Server error: ${err.error.status}`;
            }
          }
          
          if (err.status === 401) {
            errorMessage = 'Authentication failed. Your session may have expired. Please login again.';
            // Optionally redirect to login
            // this.router.navigate(['/login']);
          } else if (err.status === 403) {
            errorMessage = 'Access forbidden. You may not have permission to perform this action. Please check your account permissions or contact support.';
            console.error('403 Forbidden - Possible causes:');
            console.error('1. Token expired or invalid');
            console.error('2. User does not have required permissions');
            console.error('3. CORS issue');
            console.error('4. Server-side authorization failure');
          } else if (err.status === 0) {
            errorMessage = 'Cannot connect to server. Please check if the API is running at ' + environment.apiBaseUrl;
          } else if (err.status) {
            errorMessage = `Server error (${err.status}): ${errorMessage}`;
          }
          
          this.errorMsg = errorMessage;
          return of(null);
        }),
        finalize(() => {
          this.scanning = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(response => {
        if (response) {
          // Handle different possible response formats
          if (response.text) {
            this.scannedText = response.text;
          } else if (response.data?.text) {
            this.scannedText = response.data.text;
          } else if (response.extractedText) {
            this.scannedText = response.extractedText;
          } else if (typeof response === 'string') {
            this.scannedText = response;
          } else {
            // If response is an object, try to stringify it
            this.scannedText = JSON.stringify(response, null, 2);
          }
          
          // Update step indicator
          if (this.scannedText) {
            this.cdr.detectChanges();
          }
        } else if (!this.errorMsg) {
          this.errorMsg = 'No response from server.';
        }
      });
  }  

  /** -----------------------------
   *  Clear Everything
   * ------------------------------ */
  clearAll() {
    this.preview = null;
    this.errorMsg = null;
    this.validated = false;
    this.scanning = false;
    this.scannedText = null;
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
