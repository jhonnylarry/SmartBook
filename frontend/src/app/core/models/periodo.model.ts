// ── Periodo académico (trimestre/semestre) ──
export interface PeriodoAcademicoDto {
  id: number;
  nombre: string;
  anio: number;
  fechaInicio: string; // ISO LocalDate (YYYY-MM-DD)
  fechaFin: string;    // ISO LocalDate (YYYY-MM-DD)
}

export interface AgregarPeriodo {
  nombre: string;
  anio: number;
  fechaInicio: string;
  fechaFin: string;
}
export type ActualizarPeriodo = AgregarPeriodo;

// ── Cierre de asignatura por periodo ──
export interface EstadoCierreDto {
  idAsignatura: number;
  idPeriodo: number;
  cerrada: boolean;
  fechaCierre: string | null; // ISO LocalDateTime
}
