import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MensajeDto,
  ContactoDto,
  GrupoDto,
  DifusionResultDto,
  EnviarMensajeRequest,
  EnviarDifusionRequest,
} from '../models/mensajeria.model';

/**
 * API · Mensajería interna → microservicio servicio-mensajeria · puerto 5007 · DB smartbook_mensajeria.
 * Gateway: /api/v1/mensajes  ·  recibidos/enviados · contactos/grupos (según la matriz de permisos) · difusión.
 * Backend: carpeta servicio-mensajeria/.
 */
@Injectable({ providedIn: 'root' })
export class MensajeriaApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/mensajes`;

  /** Mensajes recibidos por el usuario autenticado (orden: más recientes primero). */
  recibidos(): Observable<MensajeDto[]> {
    return this.http.get<MensajeDto[]>(`${this.base}/recibidos`);
  }

  /** Mensajes enviados por el usuario autenticado. */
  enviados(): Observable<MensajeDto[]> {
    return this.http.get<MensajeDto[]>(`${this.base}/enviados`);
  }

  /** Detalle de un mensaje por id (solo si el usuario es remitente o destinatario). */
  getById(id: number): Observable<MensajeDto> {
    return this.http.get<MensajeDto>(`${this.base}/${id}`);
  }

  /** Enviar un mensaje directo. Puede retornar 403 si la matriz de permisos lo bloquea. */
  enviar(body: EnviarMensajeRequest): Observable<MensajeDto> {
    return this.http.post<MensajeDto>(this.base, body);
  }

  /** Marca un mensaje como leído. */
  marcarLeido(id: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/leer`, {});
  }

  /** Contactos a los que el usuario autenticado puede escribir (filtrado por la matriz de permisos del backend). */
  contactos(): Observable<ContactoDto[]> {
    return this.http.get<ContactoDto[]>(`${this.base}/contactos`);
  }

  /** Grupos de difusión disponibles para el usuario (vacío para alumno/apoderado). */
  grupos(): Observable<GrupoDto[]> {
    return this.http.get<GrupoDto[]>(`${this.base}/grupos`);
  }

  /** Enviar mensaje de difusión a un grupo. */
  difusion(body: EnviarDifusionRequest): Observable<DifusionResultDto> {
    return this.http.post<DifusionResultDto>(`${this.base}/difusion`, body);
  }
}
