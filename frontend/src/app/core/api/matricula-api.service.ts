import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MatriculaCompletaRequest, MatriculaCompletaResponse } from '../models/matricula-completa.model';
import { Matricula } from '../models/estudiante.model';

/**
 * API · Matrículas → microservicio gestion-estudiante · puerto 5002 · DB smartbook_estudiante.
 * Gateway: /api/v1/matriculas  ·  `/completa` = crea estudiante + apoderados + matrícula en un acto.
 * Backend: carpeta gestion-estudiante/.
 */
@Injectable({ providedIn: 'root' })
export class MatriculaApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/matriculas`;

  listar(): Observable<Matricula[]> {
    return this.http.get<Matricula[]>(this.base);
  }

  matricularCompleta(request: MatriculaCompletaRequest): Observable<MatriculaCompletaResponse> {
    return this.http.post<MatriculaCompletaResponse>(`${this.base}/completa`, request);
  }
}
