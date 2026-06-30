import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnotacionDTO, AgregarAnotacion, ActualizarAnotacion } from '../models/anotacion.model';

interface ResumenEstudiante {
  estudiante: unknown;
  anotaciones: AnotacionDTO[];
  totalAnotaciones: number;
}

/**
 * API · Anotaciones conductuales → microservicio anotacion · puerto 5004 · DB smartbook_anotacion.
 * Gateway: /api/v1/anotaciones  (+ /api/v1/consulta-estudiante/{id}/resumen = vista consolidada del alumno).
 * Backend: carpeta anotacion/.
 */
@Injectable({ providedIn: 'root' })
export class AnotacionApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/anotaciones`;

  listar(): Observable<AnotacionDTO[]> {
    return this.http.get<AnotacionDTO[]>(this.base);
  }

  porEstudiante(idEstudiante: number): Observable<AnotacionDTO[]> {
    return this.http.get<AnotacionDTO[]>(`${this.base}/estudiante/${idEstudiante}`);
  }

  /** Anotaciones del estudiante autenticado (el backend resuelve el id desde el JWT). */
  mias(): Observable<AnotacionDTO[]> {
    return this.http.get<AnotacionDTO[]>(`${this.base}/mias`);
  }

  /** Anotaciones de un hijo del apoderado autenticado (el backend verifica el vínculo, anti-IDOR). */
  deHijo(idEstudiante: number): Observable<AnotacionDTO[]> {
    return this.http.get<AnotacionDTO[]>(`${this.base}/hijo/${idEstudiante}`);
  }

  crear(body: AgregarAnotacion): Observable<AnotacionDTO> {
    return this.http.post<AnotacionDTO>(this.base, body);
  }

  actualizar(id: number, body: ActualizarAnotacion): Observable<AnotacionDTO> {
    return this.http.put<AnotacionDTO>(`${this.base}/${id}`, body);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  resumen(idEstudiante: number): Observable<ResumenEstudiante> {
    return this.http.get<ResumenEstudiante>(`${environment.apiUrl}/consulta-estudiante/${idEstudiante}/resumen`);
  }
}
