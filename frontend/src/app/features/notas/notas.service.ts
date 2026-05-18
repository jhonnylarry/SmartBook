import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Nota, NotaRequest, Evaluacion, Asignatura, Curso } from '../../shared/models/nota.model';

@Injectable({ providedIn: 'root' })
export class NotasService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  listarNotas(): Observable<Nota[]> {
    return this.http.get<Nota[]>(`${this.base}/notas`);
  }

  listarNotasPorEstudiante(idEstudiante: number): Observable<Nota[]> {
    return this.http.get<Nota[]>(`${this.base}/notas/estudiante/${idEstudiante}`);
  }

  crearNota(data: NotaRequest): Observable<Nota> {
    return this.http.post<Nota>(`${this.base}/notas`, data);
  }

  eliminarNota(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/notas/${id}`);
  }

  listarCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.base}/cursos`);
  }

  listarAsignaturas(): Observable<Asignatura[]> {
    return this.http.get<Asignatura[]>(`${this.base}/asignaturas`);
  }

  listarEvaluaciones(): Observable<Evaluacion[]> {
    return this.http.get<Evaluacion[]>(`${this.base}/evaluaciones`);
  }
}
