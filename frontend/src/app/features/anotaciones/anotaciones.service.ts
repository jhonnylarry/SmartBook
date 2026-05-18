import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Anotacion, AnotacionRequest } from '../../shared/models/anotacion.model';

@Injectable({ providedIn: 'root' })
export class AnotacionesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/anotaciones`;

  listar(): Observable<Anotacion[]> {
    return this.http.get<Anotacion[]>(this.base);
  }

  listarPorEstudiante(idEstudiante: number): Observable<Anotacion[]> {
    return this.http.get<Anotacion[]>(`${this.base}/estudiante/${idEstudiante}`);
  }

  crear(data: AnotacionRequest): Observable<Anotacion> {
    return this.http.post<Anotacion>(this.base, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
