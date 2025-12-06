import { Component } from '@angular/core';
import { OcrService } from '../../core/services/ocr.service';
import { HttpClient } from '@angular/common/http';
import { timer } from 'rxjs';

@Component({
  selector: 'app-ocr-upload',
  imports: [],
  templateUrl: './ocr-upload.html',
  styleUrl: './ocr-upload.css',
})
export class OcrUpload {
  preview: string | null = null;
  validated = false;
  scanning = false;
  scannedText: string | null = null;
  errorMsg: string | null = null;
  file!: File;

  constructor(private http: HttpClient) {}

  /** -----------------------------
   *  Handle File Upload
   * ------------------------------ */
  onFile(event: any) {
    const file = event.target.files[0];
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
    reader.onload = () => {
      this.preview = reader.result as string;
      this.validated = true;
    };
    reader.readAsDataURL(file);
  }

  /** -----------------------------
   *  Simulated Scan Using Dummy API
   * ------------------------------ */
  scan() {
    if (!this.validated) return;

    this.scanning = true;
    this.errorMsg = null;

    // -------- SIMULATED OCR API CALL -----------
    timer(2000).subscribe(() => {
      this.scanning = false;
      this.scannedText =
        'Dummy OCR Result:\n- This is sample text.\n- The real API will return actual extracted text.';
    });

    // For real call:
    // const formData = new FormData();
    // formData.append('file', this.file);
    // this.http.post('https://your-ocr-api.com/scan', formData).subscribe(...)
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
  }
}
