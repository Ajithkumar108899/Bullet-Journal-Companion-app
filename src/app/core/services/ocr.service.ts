// src/app/features/ocr-upload/ocr.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OcrService {
  private base = '/api/ocr';

  constructor(private http: HttpClient) {}

  scanBase64(imageBase64: string): Observable<{ text: string }> {
    return this.http.post<{ text: string }>(`${this.base}/scan`, { imageBase64 });
  }
}
