import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { User, LoginCredentials, SignupData, SignupRequest, AuthResponse } from '../models/user';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'bjc:user';
const TOKEN_KEY = 'bjc:token';
const REFRESH_TOKEN_KEY = 'bjc:refreshToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isBrowser: boolean;
  currentUser = signal<User | null>(null);

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadUser();
  }

  private loadUser() {
    if (!this.isBrowser) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const user = JSON.parse(raw) as User;
        this.currentUser.set(user);
      } catch {
        this.currentUser.set(null);
      }
    }
  }

  private saveUser(user: User, accessToken?: string, refreshToken?: string) {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    this.currentUser.set(user);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  signup(data: SignupData): Observable<AuthResponse> {
    // Client-side validation
    if (data.password !== data.confirmPassword) {
      return throwError(() => new Error('Passwords do not match'));
    }

    if (data.password.length < 6) {
      return throwError(() => new Error('Password must be at least 6 characters'));
    }

    // Prepare API request
    const signupRequest: SignupRequest = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber
    };

    // Call API
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/users/auth/create`, signupRequest, {
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }
    }).pipe(
      map((response: any) => {
        // Transform API response to User
        const userData = response.user || response;
        const user: User = {
          id: userData.id?.toString() || userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          name: `${userData.firstName} ${userData.lastName}`.trim(),
          createdAt: userData.createdAt || new Date().toISOString()
        };

        // Save user and tokens (accessToken and refreshToken)
        const accessToken = response.accessToken || response.token;
        const refreshToken = response.refreshToken;
        this.saveUser(user, accessToken, refreshToken);

        return {
          success: true,
          message: response.message || 'Account created successfully',
          user: user,
          accessToken: accessToken,
          refreshToken: refreshToken,
          tokenType: response.tokenType,
          expiresIn: response.expiresIn,
          token: accessToken // For backward compatibility
        };
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Signup failed. Please try again.';
        
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
        }

        if (error.status === 400) {
          errorMessage = errorMessage || 'Invalid data. Please check your input.';
        } else if (error.status === 409) {
          errorMessage = 'Email already registered. Please use a different email.';
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check if the API is running.';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Call login API (assuming endpoint exists)
    // If login endpoint is different, update the URL
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/users/auth/login`, {
      email: credentials.email,
      password: credentials.password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }
    }).pipe(
      map((response: any) => {
        // Transform API response to User
        const userData = response.user || response;
        const user: User = {
          id: userData.id?.toString() || userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          name: `${userData.firstName} ${userData.lastName}`.trim(),
          createdAt: userData.createdAt
        };

        // Save user and tokens (accessToken and refreshToken)
        const accessToken = response.accessToken || response.token;
        const refreshToken = response.refreshToken;
        this.saveUser(user, accessToken, refreshToken);

        return {
          success: true,
          message: response.message || 'Login successful',
          user: user,
          accessToken: accessToken,
          refreshToken: refreshToken,
          tokenType: response.tokenType,
          expiresIn: response.expiresIn,
          token: accessToken // For backward compatibility
        };
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          }
        }

        if (error.status === 401 || error.status === 403) {
          errorMessage = 'Invalid email or password';
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check if the API is running.';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout() {
    if (!this.isBrowser) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/']); // Navigate to home page
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    // Try different possible refresh token endpoints
    // Backend might use: /users/auth/refresh, /auth/refresh, /refresh
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/users/auth/refresh`, {
      refreshToken: refreshToken
    }, {
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        // If first endpoint fails, try alternative endpoint
        if (error.status === 404) {
          return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/refresh`, {
            refreshToken: refreshToken
          }, {
            headers: {
              'Content-Type': 'application/json',
              'accept': 'application/json'
            }
          });
        }
        return throwError(() => error);
      }),
      map((response: any) => {
        // Update tokens
        const accessToken = response.accessToken || response.token;
        const newRefreshToken = response.refreshToken || refreshToken; // Keep old if new not provided
        
        if (accessToken) {
          localStorage.setItem(TOKEN_KEY, accessToken);
        }
        if (newRefreshToken && newRefreshToken !== refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }

        return {
          success: true,
          message: 'Token refreshed successfully',
          user: this.currentUser()!,
          accessToken: accessToken,
          refreshToken: newRefreshToken,
          tokenType: response.tokenType || 'Bearer',
          expiresIn: response.expiresIn,
          token: accessToken
        };
      }),
      catchError((error: HttpErrorResponse) => {
        // If refresh fails, logout user
        console.error('Token refresh failed:', error);
        this.logout();
        return throwError(() => new Error('Token refresh failed. Please login again.'));
      })
    );
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decode JWT token (simple base64 decode, no verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      // Check if token expires in less than 5 minutes (refresh before expiry)
      return now >= (exp - 5 * 60 * 1000);
    } catch {
      return true; // If token is invalid, consider it expired
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null && this.getToken() !== null;
  }

  getUserDisplayName(): string {
    const user = this.currentUser();
    if (!user) return 'User';
    
    if (user.name) {
      return user.name;
    }
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    return user.firstName || user.email || 'User';
  }
}

