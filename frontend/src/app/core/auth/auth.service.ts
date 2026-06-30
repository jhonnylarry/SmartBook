import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Usuario, Rol, JwtPayload } from '../models/usuario.model';

const TOKEN_KEY = 'smartbook_token';
const USER_KEY = 'smartbook_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<Usuario | null>(this.loadUserFromStorage());
  private readonly _token = signal<string | null>(this.loadTokenFromStorage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser() && !!this._token());

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        this.saveSession(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this._token.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  hasRole(...roles: Rol[]): boolean {
    const user = this._currentUser();
    if (!user) return false;
    return roles.includes(user.rol);
  }

  // ── Capacidades por rol (ver 02-Dominio/Roles y Permisos del vault) ──
  /** Ver el listado de usuarios: ADMINISTRADOR, DIRECTOR y ADMINISTRATIVO. */
  canViewUsuarios(): boolean {
    return this.hasRole('ADMINISTRADOR', 'DIRECTOR', 'ADMINISTRATIVO');
  }

  /** Gestión completa (editar/desactivar/eliminar) de usuarios: solo ADMINISTRADOR. */
  canManageUsuarios(): boolean {
    return this.hasRole('ADMINISTRADOR');
  }

  /** Crear cuentas: ADMINISTRADOR, DIRECTOR, ADMINISTRATIVO. */
  canCreateUsuarios(): boolean {
    return this.hasRole('ADMINISTRADOR', 'DIRECTOR', 'ADMINISTRATIVO');
  }

  /** Crear/editar anotaciones conductuales. */
  canManageAnotaciones(): boolean {
    return this.hasRole('DOCENTE', 'INSPECTOR', 'ADMINISTRADOR', 'DIRECTOR');
  }
  /** Eliminar anotaciones: solo ADMINISTRADOR. */
  canDeleteAnotaciones(): boolean {
    return this.hasRole('ADMINISTRADOR');
  }

  /** Gestionar hoja de vida, antecedentes académicos y documentos. */
  canManageHojaVida(): boolean {
    return this.hasRole('ADMINISTRADOR', 'DIRECTOR', 'ADMINISTRATIVO');
  }
  /** Gestionar antecedentes sensibles (familiares/médicos): ADMINISTRADOR/DIRECTOR. */
  canManageAntecedentesSensibles(): boolean {
    return this.hasRole('ADMINISTRADOR', 'DIRECTOR');
  }

  /** Gestionar la estructura académica (cursos/asignaturas/materias del catálogo): ADMINISTRADOR/DIRECTOR/ADMINISTRATIVO. */
  canManageAcademico(): boolean {
    return this.hasRole('ADMINISTRADOR', 'DIRECTOR', 'ADMINISTRATIVO');
  }
  /** Gestionar evaluaciones y objetivos: ADMINISTRADOR/DIRECTOR (tarea pedagógica, no administrativa). */
  canManageEvaluaciones(): boolean {
    return this.hasRole('ADMINISTRADOR', 'DIRECTOR');
  }
  /** Registrar/editar notas y bitácora: DOCENTE/ADMINISTRADOR/DIRECTOR. */
  canManageNotas(): boolean {
    return this.hasRole('DOCENTE', 'ADMINISTRADOR', 'DIRECTOR');
  }
  /** Eliminar recursos académicos: solo ADMINISTRADOR. */
  canDeleteAcademico(): boolean {
    return this.hasRole('ADMINISTRADOR');
  }

  /** Crear/editar eventos del calendario: DOCENTE/DIRECTOR/ADMINISTRADOR. */
  canManageCalendario(): boolean {
    return this.hasRole('DOCENTE', 'DIRECTOR', 'ADMINISTRADOR');
  }
  /** Eliminar eventos del calendario: solo ADMINISTRADOR. */
  canDeleteCalendario(): boolean {
    return this.hasRole('ADMINISTRADOR');
  }

  /** Etiqueta legible del rol del usuario actual. */
  roleLabel(): string {
    const labels: Record<Rol, string> = {
      ADMINISTRADOR: 'Administrador',
      DIRECTOR: 'Director',
      DOCENTE: 'Docente',
      INSPECTOR: 'Inspector',
      ADMINISTRATIVO: 'Administrativo',
      APODERADO: 'Apoderado',
      ESTUDIANTE: 'Estudiante',
    };
    const rol = this._currentUser()?.rol;
    return rol ? labels[rol] : '';
  }

  private saveSession(response: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.usuario));
    this._token.set(response.token);
    this._currentUser.set(response.usuario);
  }

  private loadTokenFromStorage(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private loadUserFromStorage(): Usuario | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as Usuario;
    } catch {
      return null;
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(payload) as JwtPayload;
    } catch {
      return null;
    }
  }
}
