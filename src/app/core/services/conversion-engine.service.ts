import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, timeout, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ConversionEngineService {
  private base = `${environment.apiBaseUrl}/journal/export`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain'
    };
  }

  getConvertedReport(): Observable<{ taskpaper: string; markdown: string }> {
    const token = this.authService.getToken();
    console.log('🔑 Token available:', token ? 'Yes' : 'No');
    console.log('📡 Calling export APIs:', {
      taskpaper: `${this.base}/taskpaper`,
      markdown: `${this.base}/markdown`
    });

    // Call both APIs in parallel
    const taskpaper$ = this.http.get(`${this.base}/taskpaper`, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      catchError(error => {
        console.error('❌ Error fetching TaskPaper:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        return of('# Tasks\n\nNo tasks found.\n');
      })
    );

    const markdown$ = this.http.get(`${this.base}/markdown`, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      catchError(error => {
        console.error('❌ Error fetching Markdown:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        return of('# Notes & Emotions\n\nNo notes or emotions found.\n');
      })
    );

    // Combine both responses
    return forkJoin({
      taskpaper: taskpaper$,
      markdown: markdown$
    });
  }
}
