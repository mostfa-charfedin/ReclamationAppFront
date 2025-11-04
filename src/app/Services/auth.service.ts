import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse } from '../Models/authResponse';
import { LoginRequest } from '../Models/loginRequest';
import { RegisterRequest } from '../Models/register-request';
import { User } from '../Models/user';



@Injectable({
  providedIn: 'root'
})

export class AuthService {
  //private apiUrl = 'https://sicam-app.onrender.com/api/auth';
  private apiUrl = 'http://localhost:8083/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }


  private storageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private safeGet(key: string): string | null {
    return this.storageAvailable() ? localStorage.getItem(key) : null;
  }

  private safeSet(key: string, value: string): void {
    if (this.storageAvailable()) {
      localStorage.setItem(key, value);
    }
  }

  private safeRemove(key: string): void {
    if (this.storageAvailable()) {
      localStorage.removeItem(key);
    }
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData)
      .pipe(
        tap(response => {
          if (response.token) {
            this.setSession(response);
          }
        })
      );
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          if (response.token) {
            this.setSession(response);
          }
        })
      );
  }

  logout(): void {
    this.safeRemove('token');
    this.safeRemove('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.safeGet('token');
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  isTechnicien(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'TECHNICIEN';
  }

  isUser(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'USER';
  }

  validateToken(): Observable<AuthResponse> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/validate`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(response => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
          this.safeSet('user', JSON.stringify(response.user));
        }
      })
    );
  }

  private setSession(authResult: AuthResponse) {
    this.safeSet('token', authResult.token);
    this.safeSet('user', JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
  }

  private loadUserFromStorage() {
    const token = this.safeGet('token');
    const userStr = this.safeGet('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from localStorage', error);
      }
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch (e) {
      return true;
    }
  }

  hasRole(requiredRoles: string[]): boolean {
  const userRole = this.getCurrentUser()?.role;
  return requiredRoles.includes(userRole || '');
}
hasAnyRole(...roles: string[]): boolean {
  const userRole = this.getCurrentUser()?.role;
  return roles.includes(userRole || '');
}
}
