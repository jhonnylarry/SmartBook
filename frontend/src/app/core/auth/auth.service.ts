import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, Usuario } from './models';

const STORAGE_TOKEN_KEY = 'smartbook_token';
const STORAGE_USER_KEY = 'smartbook_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<Usuario | null>(this.loadUser());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, req)
      .pipe(
        tap(res => {
          localStorage.setItem(STORAGE_TOKEN_KEY, res.token);
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(res.usuario));
          this._currentUser.set(res.usuario);
        })
      );
  }

  register(req: RegisterRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/register`, req)
      .pipe(
        tap(res => {
          localStorage.setItem(STORAGE_TOKEN_KEY, res.token);
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(res.usuario));
          this._currentUser.set(res.usuario);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  }

  hasRole(...roles: string[]): boolean {
    const user = this._currentUser();
    if (!user) return false;
    return roles.includes(user.rol);
  }

  private loadUser(): Usuario | null {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      return null;
    }
  }
}
