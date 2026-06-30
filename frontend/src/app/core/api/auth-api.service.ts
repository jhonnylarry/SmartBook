import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/usuario.model';

/**
 * API · Autenticación (login) → microservicio servicio-auth · puerto 5001 · DB smartbook_auth.
 * Gateway: /api/v1/auth  ·  ruta PÚBLICA (el login no requiere JWT; emite el token del sistema).
 * Backend: carpeta servicio-auth/.  Todo el resto pasa por el api-gateway (localhost:5000).
 */
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auth`;

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, request);
  }
}
