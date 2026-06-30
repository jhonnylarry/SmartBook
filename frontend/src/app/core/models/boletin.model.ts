export interface NotaBoletinDto {
  idEvaluacion: number;
  nombreEvaluacion: string;
  ponderacion: number;   // %
  calificacion: number;  // 1.0–7.0
}

export interface BoletinAsignaturaDto {
  idAsignatura: number;
  nombreAsignatura: string;
  promedio: number | null; // promedio ponderado (null si no hay ponderación)
  notas: NotaBoletinDto[];
}

export interface PromedioEstudianteDto {
  idEstudiante: number;
  promedio: number | null;
  cantidadNotas: number;
}
