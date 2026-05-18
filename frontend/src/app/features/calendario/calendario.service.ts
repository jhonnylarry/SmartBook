import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Evento, EventoRequest } from '../../shared/models/evento.model';

@Injectable({ providedIn: 'root' })
export class CalendarioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/eventos`;

  listar(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.base);
  }

  listarPorRango(desde: string, hasta: string): Observable<Evento[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<Evento[]>(`${this.base}/rango`, { params });
  }

  crear(data: EventoRequest): Observable<Evento> {
    return this.http.post<Evento>(this.base, data);
  }

  actualizar(id: number, data: EventoRequest): Observable<Evento> {
    return this.http.put<Evento>(`${this.base}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
