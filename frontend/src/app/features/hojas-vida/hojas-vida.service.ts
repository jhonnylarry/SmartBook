import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HojaVida } from '../../shared/models/hoja-vida.model';

@Injectable({ providedIn: 'root' })
export class HojasVidaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/hojas-vida`;

  listar(): Observable<HojaVida[]> {
    return this.http.get<HojaVida[]>(this.base);
  }

  obtener(id: number): Observable<HojaVida> {
    return this.http.get<HojaVida>(`${this.base}/${id}`);
  }

  obtenerPorEstudiante(idEstudiante: number): Observable<HojaVida> {
    return this.http.get<HojaVida>(`${this.base}/estudiante/${idEstudiante}`);
  }
}
