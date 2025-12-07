import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OcrService } from '../../core/services/ocr.service';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of, switchMap, timer } from 'rxjs';

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

  constructor(private http: HttpClient, private ocrService: OcrService) {}

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
      }
    };
     reader.onerror = () => {
      this.errorMsg = 'Error reading file. Please try again.';
      this.preview = null;
      this.validated = false;
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
    if (!this.validated || !this.file) return;

    this.scanning = true;
    this.errorMsg = null;
    this.scannedText = null;

    const formData = new FormData();
    formData.append('file', this.file);

    // Replace '/api/ocr/scan' with your server endpoint
    of(null).pipe(
      switchMap(() => this.http.post<{ text?: string }>('/api/ocr/scan', formData)),
      catchError(err => {
        console.error('OCR upload error', err);
        this.errorMsg = 'Upload failed. Please try again.';
        return of(null);
      }),
      finalize(() => {
        this.scanning = false;
      })
    ).subscribe(response => {
      if (response && response.text) {
        this.scannedText = response.text;
      } else if (!this.errorMsg) {
        this.errorMsg = 'No text returned from server.';
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
