import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EventoDto, AgregarEvento, ActualizarEvento, TipoEvento } from '../models/calendario.model';

/**
 * API · Eventos del calendario → microservicio servicio-calendario · puerto 5006 · DB smartbook_calendario.
 * Gateway: /api/v1/eventos  ·  listar / rango / tipo / asignatura / feed.
 * Backend: carpeta servicio-calendario/.
 */
@Injectable({ providedIn: 'root' })
export class CalendarioApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/eventos`;

  listar(): Observable<EventoDto[]> {
    return this.http.get<EventoDto[]>(this.base);
  }

  /** Eventos en un rango. `desde`/`hasta` en ISO LocalDateTime (YYYY-MM-DDTHH:mm:ss). */
  porRango(desde: string, hasta: string): Observable<EventoDto[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<EventoDto[]>(`${this.base}/rango`, { params });
  }

  porTipo(tipo: TipoEvento): Observable<EventoDto[]> {
    return this.http.get<EventoDto[]>(`${this.base}/tipo/${tipo}`);
  }

  crear(body: AgregarEvento): Observable<EventoDto> {
    return this.http.post<EventoDto>(this.base, body);
  }

  actualizar(id: number, body: ActualizarEvento): Observable<EventoDto> {
    return this.http.put<EventoDto>(`${this.base}/${id}`, body);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** Eventos de una asignatura específica. */
  porAsignatura(idAsignatura: number): Observable<EventoDto[]> {
    return this.http.get<EventoDto[]>(`${this.base}/asignatura/${idAsignatura}`);
  }

  /** Feed de eventos de varias asignaturas (query param: asignaturas=1,2,3). */
  feedAsignaturas(ids: number[]): Observable<EventoDto[]> {
    const params = new HttpParams().set('asignaturas', ids.join(','));
    return this.http.get<EventoDto[]>(`${this.base}/feed`, { params });
  }
}
