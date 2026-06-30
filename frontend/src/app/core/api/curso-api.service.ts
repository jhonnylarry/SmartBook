import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CursoDTO } from '../models/curso.model';

/**
 * API · Cursos (listado simple) → microservicio gestion-academica · puerto 5003 · DB smartbook_academica.
 * Gateway: /api/v1/cursos.  El CRUD completo de cursos vive en AcademicoApiService.
 * Backend: carpeta gestion-academica/.
 */
@Injectable({ providedIn: 'root' })
export class CursoApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/cursos`;

  listar(): Observable<CursoDTO[]> {
    return this.http.get<CursoDTO[]>(this.base);
  }
}
