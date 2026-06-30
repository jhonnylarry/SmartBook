import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BloqueHorarioDto, AgregarBloqueHorario, ActualizarBloqueHorario } from '../models/horario.model';

/**
 * API · Horario semanal → microservicio gestion-academica · puerto 5003 · DB smartbook_academica.
 * Gateway: /api/v1/horarios  ·  bloques por asignatura / curso / docente.
 * Backend: carpeta gestion-academica/ (módulo horario).
 */
@Injectable({ providedIn: 'root' })
export class HorarioApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/horarios`;

  porAsignatura(idAsignatura: number): Observable<BloqueHorarioDto[]> {
    return this.http.get<BloqueHorarioDto[]>(`${this.base}/asignatura/${idAsignatura}`);
  }

  /** Horario semanal de un curso (bloques de todas sus asignaturas). */
  porCurso(idCurso: number): Observable<BloqueHorarioDto[]> {
    return this.http.get<BloqueHorarioDto[]>(`${this.base}/curso/${idCurso}`);
  }

  /** Horario semanal de un docente (bloques de sus asignaturas). */
  porDocente(idDocente: number): Observable<BloqueHorarioDto[]> {
    return this.http.get<BloqueHorarioDto[]>(`${this.base}/docente/${idDocente}`);
  }

  crear(body: AgregarBloqueHorario): Observable<BloqueHorarioDto> {
    return this.http.post<BloqueHorarioDto>(this.base, body);
  }

  actualizar(id: number, body: ActualizarBloqueHorario): Observable<BloqueHorarioDto> {
    return this.http.put<BloqueHorarioDto>(`${this.base}/${id}`, body);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
