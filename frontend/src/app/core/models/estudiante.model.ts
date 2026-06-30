export type EstadoMatricula = 'VIGENTE' | 'RETIRADO' | 'EGRESADO' | 'SUSPENDIDO';

export interface Matricula {
  id: number;
  idEstudiante: number;
  idCurso: number;
  fechaMatricula: string;
  estado: EstadoMatricula;
}

export interface EstudianteDTO {
  id: number;
  idUsuario: number;
  nombre: string;
  apellido: string;
  rut: string;
  fechaNacimiento: string;
}

export interface EstudianteDetalleDTO extends EstudianteDTO {
  matriculas: Matricula[];
}
