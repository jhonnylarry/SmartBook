import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reporte } from '../../shared/models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reportes`;

  notasPorEstudiante(idEstudiante: number): Observable<unknown> {
    return this.http.get<unknown>(`${this.base}/notas/${idEstudiante}`);
  }

  anotacionesPorEstudiante(idEstudiante: number): Observable<unknown> {
    return this.http.get<unknown>(`${this.base}/anotaciones/${idEstudiante}`);
  }

  reporteCurso(idCurso: number): Observable<unknown> {
    return this.http.get<unknown>(`${this.base}/curso/${idCurso}`);
  }

  historial(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(`${this.base}/historial`);
  }
}
