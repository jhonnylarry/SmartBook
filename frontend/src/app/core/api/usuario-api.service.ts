import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, CreateUsuarioRequest, UpdateUsuarioRequest, PerfilPublico } from '../models/usuario.model';

/**
 * API · Usuarios y perfiles → microservicio servicio-auth · puerto 5001 · DB smartbook_auth.
 * Gateway: /api/v1/usuarios  ·  crear/editar usuarios (docentes, administrativos…) y perfiles públicos.
 * Backend: carpeta servicio-auth/ (módulo de autenticación).
 */
@Injectable({ providedIn: 'root' })
export class UsuarioApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/usuarios`;

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.base);
  }

  obtener(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/${id}`);
  }

  crear(request: CreateUsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.base, request);
  }

  actualizar(id: number, request: UpdateUsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/${id}`, request);
  }

  /** Perfiles públicos de múltiples usuarios (query param: ids=1,2). */
  perfiles(ids: number[]): Observable<PerfilPublico[]> {
    const params = new HttpParams().set('ids', ids.join(','));
    return this.http.get<PerfilPublico[]>(`${this.base}/perfiles`, { params });
  }
}
