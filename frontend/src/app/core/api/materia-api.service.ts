import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MateriaDTO, AgregarMateria, ActualizarMateria, NivelEnsenanza } from '../models/materia.model';

/**
 * API · Catálogo de materias → microservicio gestion-academica · puerto 5003 · DB smartbook_academica.
 * Gateway: /api/v1/materias  ·  catálogo por nivel (BASICA / MEDIA / TECNICO).
 * Backend: carpeta gestion-academica/ (módulo catálogo de materias).
 */
@Injectable({ providedIn: 'root' })
export class MateriaApiService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  listar(): Observable<MateriaDTO[]> {
    return this.http.get<MateriaDTO[]>(`${this.api}/materias`);
  }

  porNivel(nivel: NivelEnsenanza): Observable<MateriaDTO[]> {
    return this.http.get<MateriaDTO[]>(`${this.api}/materias/nivel/${nivel}`);
  }

  crear(body: AgregarMateria): Observable<MateriaDTO> {
    return this.http.post<MateriaDTO>(`${this.api}/materias`, body);
  }

  actualizar(id: number, body: ActualizarMateria): Observable<MateriaDTO> {
    return this.http.put<MateriaDTO>(`${this.api}/materias/${id}`, body);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/materias/${id}`);
  }
}
