import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Add token to request if available
    const token = this.authService.getToken();
    if (token) {
      request = this.addTokenHeader(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // If 401 Unauthorized and we have a refresh token, try to refresh
        if (error.status === 401 && this.authService.getRefreshToken()) {
          return this.handle401Error(request, next);
        }

        return throwError(() => error);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();
      if (!refreshToken) {
        // No refresh token, logout immediately
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => new Error('No refresh token available'));
      }

      return this.authService.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          const newToken = response.accessToken || response.token;
          this.refreshTokenSubject.next(newToken);
          
          // Retry the original request with new token
          return next.handle(this.addTokenHeader(request, newToken));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);
          // Refresh failed, logout and redirect to home
          this.authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      // If already refreshing, wait for the new token
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => {
          return next.handle(this.addTokenHeader(request, token));
        }),
        catchError((error) => {
          // If waiting for token fails, logout
          this.authService.logout();
          return throwError(() => error);
        })
      );
    }
  }
}

