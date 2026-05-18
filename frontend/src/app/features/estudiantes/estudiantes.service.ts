import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Estudiante, EstudianteRequest } from '../../shared/models/estudiante.model';

@Injectable({ providedIn: 'root' })
export class EstudiantesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/estudiantes`;

  listar(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(this.base);
  }

  obtener(id: number): Observable<Estudiante> {
    return this.http.get<Estudiante>(`${this.base}/${id}`);
  }

  crear(data: EstudianteRequest): Observable<Estudiante> {
    return this.http.post<Estudiante>(this.base, data);
  }

  actualizar(id: number, data: EstudianteRequest): Observable<Estudiante> {
    return this.http.put<Estudiante>(`${this.base}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
