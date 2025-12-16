import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

// ========== INTERFACES EXPORTÉES ==========
export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: any;
  role: string;
  expiresIn: number;
}

// ========== SERVICE ==========
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/v1';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  // ========== AUTH METHODS ==========
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data)
      .pipe(
        tap(response => this.setSession(response.user, response.token, response.refreshToken, response.role))
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data)
      .pipe(
        tap(response => this.setSession(response.user, response.token, response.refreshToken, response.role))
      );
  }



  logout(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/auth/logout`, { refreshToken }).subscribe({
        next: () => this.doLogout(),
        error: () => this.doLogout()
      });
    } else {
      this.doLogout();
    }
  }

  private doLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, data);
  }

  refreshToken(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh-token`, { refreshToken: token })
      .pipe(
        tap(response => this.setSession(response.user, response.token, response.refreshToken, response.role))
      );
  }

  resetPassword(data: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, data);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next({ ...user, role: this.getCurrentRole() });
          localStorage.setItem('user', JSON.stringify(user));
        })
      );
  }

  // ========== SESSION MANAGEMENT ==========
  private setSession(user: any, token: string, refreshToken: string, role: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', role);
    this.currentUserSubject.next({ ...user, role });
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const user = this.getCurrentUser();
    const role = this.getCurrentRole();

    if (token && user && role) {
      this.currentUserSubject.next({ ...user, role });
    }
  }

  // ========== GETTERS ==========
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getCurrentRole(): string | null {
    return localStorage.getItem('role');
  }

  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.id || null;
  }

  // ========== ROLE CHECKS ==========
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getCurrentRole() === 'admin';
  }

  isCollecteur(): boolean {
    return this.getCurrentRole() === 'collecteur';
  }

  isClient(): boolean {
    return this.getCurrentRole() === 'client';
  }

  // ========== ROLE BASED REDIRECT ==========
  redirectBasedOnRole(): void {
    const role = this.getCurrentRole();
    switch (role) {
      case 'admin': this.router.navigate(['/admin/dashboard']); break;
      case 'collecteur': this.router.navigate(['/collecteur/dashboard']); break;
      case 'client': this.router.navigate(['/client/dashboard']); break;
      default: this.router.navigate(['/login']);
    }
  }
}