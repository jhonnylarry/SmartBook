import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstudianteDTO, EstudianteDetalleDTO } from '../models/estudiante.model';

/**
 * API · Estudiantes → microservicio gestion-estudiante · puerto 5002 · DB smartbook_estudiante.
 * Gateway: /api/v1/estudiantes  ·  `/me` = estudiante del usuario autenticado (id desde el JWT).
 * Backend: carpeta gestion-estudiante/.
 */
@Injectable({ providedIn: 'root' })
export class EstudianteApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/estudiantes`;

  listar(): Observable<EstudianteDTO[]> {
    return this.http.get<EstudianteDTO[]>(this.base);
  }

  obtener(id: number): Observable<EstudianteDetalleDTO> {
    return this.http.get<EstudianteDetalleDTO>(`${this.base}/${id}`);
  }

  /** Devuelve el EstudianteDetalleDTO del usuario autenticado. 404 si no es estudiante. */
  me(): Observable<EstudianteDetalleDTO> {
    return this.http.get<EstudianteDetalleDTO>(`${this.base}/me`);
  }
}
