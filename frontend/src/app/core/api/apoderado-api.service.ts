import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PupiloDto } from '../models/apoderado.model';

/**
 * API · Apoderados / pupilos → microservicio gestion-estudiante · puerto 5002 · DB smartbook_estudiante.
 * Gateway: /api/v1/apoderados  ·  `/me` = pupilos del apoderado autenticado (id desde el JWT).
 * Backend: carpeta gestion-estudiante/ (módulo apoderados).
 */
@Injectable({ providedIn: 'root' })
export class ApoderadoApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/apoderados`;

  /** Estudiantes a cargo del apoderado autenticado (resuelto desde el JWT en el backend). */
  misPupilos(): Observable<PupiloDto[]> {
    return this.http.get<PupiloDto[]>(`${this.base}/me`);
  }
}
