export interface Nota {
  id: number;
  idEvaluacion: number;
  idEstudiante: number;
  calificacion: number;
}

export interface NotaRequest {
  idEvaluacion: number;
  idEstudiante: number;
  calificacion: number;
}

export interface Evaluacion {
  id: number;
  nombre: string;
  fecha: string;
  idAsignatura: number;
  ponderacion: number;
}

export interface Asignatura {
  id: number;
  nombre: string;
  idCurso: number;
  idDocente: number;
}

export interface Curso {
  id: number;
  nombre: string;
  anio: number;
  idDocenteJefe: number;
}
