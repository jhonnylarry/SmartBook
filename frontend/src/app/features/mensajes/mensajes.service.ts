import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Mensaje, MensajeRequest } from '../../shared/models/mensaje.model';

@Injectable({ providedIn: 'root' })
export class MensajesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/mensajes`;

  recibidos(): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.base}/recibidos`);
  }

  enviados(): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.base}/enviados`);
  }

  obtener(id: number): Observable<Mensaje> {
    return this.http.get<Mensaje>(`${this.base}/${id}`);
  }

  enviar(data: MensajeRequest): Observable<Mensaje> {
    return this.http.post<Mensaje>(this.base, data);
  }

  marcarLeido(id: number): Observable<Mensaje> {
    return this.http.put<Mensaje>(`${this.base}/${id}/leer`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
