import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CursoDTO, AgregarCurso, ActualizarCurso,
  AsignaturaDTO, AgregarAsignatura, ActualizarAsignatura,
  EvaluacionDTO, AgregarEvaluacion, ActualizarEvaluacion,
  NotaDTO, AgregarNota, ActualizarNota,
  DocumentoEvaluacionDTO,
} from '../models/academico.model';
import { BoletinAsignaturaDto, PromedioEstudianteDto } from '../models/boletin.model';
import { PeriodoAcademicoDto, AgregarPeriodo, ActualizarPeriodo, EstadoCierreDto } from '../models/periodo.model';

/**
 * API · Núcleo académico → microservicio gestion-academica · puerto 5003 · DB smartbook_academica.
 * Un mismo servicio cubre varios recursos del gateway (/api/v1/...):
 *   periodos · cursos · asignaturas · evaluaciones · notas · boletín/promedios · documentos de evaluación.
 * Backend: carpeta gestion-academica/ (un módulo modulo_xxx/ por recurso).
 */
@Injectable({ providedIn: 'root' })
export class AcademicoApiService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  // ── Periodos académicos ──
  periodos(): Observable<PeriodoAcademicoDto[]> {
    return this.http.get<PeriodoAcademicoDto[]>(`${this.api}/periodos`);
  }
  crearPeriodo(body: AgregarPeriodo): Observable<PeriodoAcademicoDto> {
    return this.http.post<PeriodoAcademicoDto>(`${this.api}/periodos`, body);
  }
  actualizarPeriodo(id: number, body: ActualizarPeriodo): Observable<PeriodoAcademicoDto> {
    return this.http.put<PeriodoAcademicoDto>(`${this.api}/periodos/${id}`, body);
  }
  eliminarPeriodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/periodos/${id}`);
  }

  // ── Cierre de asignaturas por periodo ──
  cierresDeAsignatura(idAsignatura: number): Observable<EstadoCierreDto[]> {
    return this.http.get<EstadoCierreDto[]>(`${this.api}/asignaturas/${idAsignatura}/cierres`);
  }
  estadoCierre(idAsignatura: number, idPeriodo: number): Observable<EstadoCierreDto> {
    return this.http.get<EstadoCierreDto>(`${this.api}/asignaturas/${idAsignatura}/cierre?periodo=${idPeriodo}`);
  }
  cerrarAsignatura(idAsignatura: number, idPeriodo: number): Observable<EstadoCierreDto> {
    return this.http.post<EstadoCierreDto>(`${this.api}/asignaturas/${idAsignatura}/cerrar?periodo=${idPeriodo}`, {});
  }
  reabrirAsignatura(idAsignatura: number, idPeriodo: number): Observable<EstadoCierreDto> {
    return this.http.post<EstadoCierreDto>(`${this.api}/asignaturas/${idAsignatura}/reabrir?periodo=${idPeriodo}`, {});
  }

  // ── Cursos ──
  cursos(): Observable<CursoDTO[]> {
    return this.http.get<CursoDTO[]>(`${this.api}/cursos`);
  }
  curso(id: number): Observable<CursoDTO> {
    return this.http.get<CursoDTO>(`${this.api}/cursos/${id}`);
  }
  crearCurso(body: AgregarCurso): Observable<CursoDTO> {
    return this.http.post<CursoDTO>(`${this.api}/cursos`, body);
  }
  actualizarCurso(id: number, body: ActualizarCurso): Observable<CursoDTO> {
    return this.http.put<CursoDTO>(`${this.api}/cursos/${id}`, body);
  }
  eliminarCurso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/cursos/${id}`);
  }

  // ── Asignaturas ──
  asignaturasPorCurso(idCurso: number): Observable<AsignaturaDTO[]> {
    return this.http.get<AsignaturaDTO[]>(`${this.api}/asignaturas/curso/${idCurso}`);
  }
  asignaturasPorDocente(idDocente: number): Observable<AsignaturaDTO[]> {
    return this.http.get<AsignaturaDTO[]>(`${this.api}/asignaturas/docente/${idDocente}`);
  }
  /** Asignaturas del docente autenticado (self; el backend deriva el id del JWT). */
  asignaturasMias(): Observable<AsignaturaDTO[]> {
    return this.http.get<AsignaturaDTO[]>(`${this.api}/asignaturas/mias`);
  }
  asignatura(id: number): Observable<AsignaturaDTO> {
    return this.http.get<AsignaturaDTO>(`${this.api}/asignaturas/${id}`);
  }
  crearAsignatura(body: AgregarAsignatura): Observable<AsignaturaDTO> {
    return this.http.post<AsignaturaDTO>(`${this.api}/asignaturas`, body);
  }
  actualizarAsignatura(id: number, body: ActualizarAsignatura): Observable<AsignaturaDTO> {
    return this.http.put<AsignaturaDTO>(`${this.api}/asignaturas/${id}`, body);
  }
  eliminarAsignatura(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/asignaturas/${id}`);
  }

  // ── Evaluaciones ──
  evaluacionesPorAsignatura(idAsignatura: number): Observable<EvaluacionDTO[]> {
    return this.http.get<EvaluacionDTO[]>(`${this.api}/evaluaciones/asignatura/${idAsignatura}`);
  }
  crearEvaluacion(body: AgregarEvaluacion): Observable<EvaluacionDTO> {
    return this.http.post<EvaluacionDTO>(`${this.api}/evaluaciones`, body);
  }
  actualizarEvaluacion(id: number, body: ActualizarEvaluacion): Observable<EvaluacionDTO> {
    return this.http.put<EvaluacionDTO>(`${this.api}/evaluaciones/${id}`, body);
  }
  eliminarEvaluacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/evaluaciones/${id}`);
  }

  // ── Notas ──
  notasPorEvaluacion(idEvaluacion: number): Observable<NotaDTO[]> {
    return this.http.get<NotaDTO[]>(`${this.api}/notas/evaluacion/${idEvaluacion}`);
  }
  notasPorEstudiante(idEstudiante: number): Observable<NotaDTO[]> {
    return this.http.get<NotaDTO[]>(`${this.api}/notas/estudiante/${idEstudiante}`);
  }
  /** Notas del estudiante autenticado (el backend resuelve el id desde el JWT). */
  notasMias(): Observable<NotaDTO[]> {
    return this.http.get<NotaDTO[]>(`${this.api}/notas/mias`);
  }
  /** Notas de un hijo del apoderado autenticado (el backend verifica el vínculo, anti-IDOR). */
  notasDeHijo(idEstudiante: number): Observable<NotaDTO[]> {
    return this.http.get<NotaDTO[]>(`${this.api}/notas/hijo/${idEstudiante}`);
  }

  // ── Boletín con promedio ponderado ──
  /** Mi boletín (estudiante autenticado). */
  miBoletin(): Observable<BoletinAsignaturaDto[]> {
    return this.http.get<BoletinAsignaturaDto[]>(`${this.api}/notas/mi-boletin`);
  }
  /** Boletín de un hijo (apoderado autenticado, anti-IDOR). */
  boletinDeHijo(idEstudiante: number): Observable<BoletinAsignaturaDto[]> {
    return this.http.get<BoletinAsignaturaDto[]>(`${this.api}/notas/boletin/hijo/${idEstudiante}`);
  }
  /** Boletín de un estudiante (staff). */
  boletinDeEstudiante(idEstudiante: number): Observable<BoletinAsignaturaDto[]> {
    return this.http.get<BoletinAsignaturaDto[]>(`${this.api}/notas/boletin/estudiante/${idEstudiante}`);
  }
  /** Promedios ponderados por estudiante en una asignatura (libro de notas del docente). */
  promediosDeAsignatura(idAsignatura: number): Observable<PromedioEstudianteDto[]> {
    return this.http.get<PromedioEstudianteDto[]>(`${this.api}/notas/promedios/asignatura/${idAsignatura}`);
  }
  crearNota(body: AgregarNota): Observable<NotaDTO> {
    return this.http.post<NotaDTO>(`${this.api}/notas`, body);
  }
  actualizarNota(id: number, body: ActualizarNota): Observable<NotaDTO> {
    return this.http.put<NotaDTO>(`${this.api}/notas/${id}`, body);
  }
  eliminarNota(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/notas/${id}`);
  }

  // ── Documentos de evaluación (PDF de prueba física) ──
  documentosDeEvaluacion(idEvaluacion: number): Observable<DocumentoEvaluacionDTO[]> {
    return this.http.get<DocumentoEvaluacionDTO[]>(`${this.api}/evaluaciones/${idEvaluacion}/documentos`);
  }
  subirDocumentoEvaluacion(idEvaluacion: number, file: File): Observable<DocumentoEvaluacionDTO> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    // No fijar Content-Type: el navegador agrega el boundary del multipart.
    return this.http.post<DocumentoEvaluacionDTO>(`${this.api}/evaluaciones/${idEvaluacion}/documentos`, fd);
  }
  descargarDocumentoEvaluacion(idDoc: number): Observable<Blob> {
    return this.http.get(`${this.api}/evaluaciones/documentos/${idDoc}`, { responseType: 'blob' });
  }
  eliminarDocumentoEvaluacion(idDoc: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/evaluaciones/documentos/${idDoc}`);
  }
}
