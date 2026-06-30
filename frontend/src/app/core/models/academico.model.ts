import { NivelEnsenanza } from './materia.model';

// ── Curso ──
export interface CursoDTO {
  id: number;
  nombre: string;
  anio: number;
  idDocenteJefe: number;
  nivel?: NivelEnsenanza | null;
}
export interface AgregarCurso {
  nombre: string;
  anio: number;
  idDocenteJefe: number;
  nivel?: NivelEnsenanza;
}
export type ActualizarCurso = AgregarCurso;

// ── Asignatura ──
export interface AsignaturaDTO {
  id: number;
  nombre: string;
  idCurso: number;
  idDocente: number;
}
export interface AgregarAsignatura {
  nombre: string;
  idCurso: number;
  idDocente: number;
}
export type ActualizarAsignatura = AgregarAsignatura;

// ── Evaluación ──
export interface EvaluacionDTO {
  id: number;
  nombre: string;
  fecha: string;          // ISO LocalDate (YYYY-MM-DD)
  idAsignatura: number;
  ponderacion: number;    // 0.01 – 100.00
  idPeriodo: number | null; // periodo académico (asignado por la fecha)
}
export interface AgregarEvaluacion {
  nombre: string;
  fecha: string;
  idAsignatura: number;
  ponderacion: number;
}
export type ActualizarEvaluacion = AgregarEvaluacion;

// ── Nota ──
export interface NotaDTO {
  id: number;
  idEvaluacion: number;
  idEstudiante: number;
  calificacion: number;   // 1.0 – 7.0
}
export interface AgregarNota {
  idEvaluacion: number;
  idEstudiante: number;
  calificacion: number;
}
export type ActualizarNota = AgregarNota;

// ── Documento de evaluación (PDF, p.ej. prueba física) ──
export interface DocumentoEvaluacionDTO {
  id: number;
  idEvaluacion: number;
  nombreArchivo: string;
  tipoMime: string;
  tamanoBytes: number;
  subidoPor: number | null;
  fechaCarga: string; // ISO LocalDateTime
}
