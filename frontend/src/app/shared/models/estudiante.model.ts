export interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  rut?: string;
  email?: string;
  fechaNacimiento?: string;
  idUsuario?: number;
}

export interface EstudianteRequest {
  nombre: string;
  apellido: string;
  rut?: string;
  email: string;
  password?: string;
  fechaNacimiento?: string;
}

export interface Matricula {
  id: number;
  idEstudiante: number;
  idCurso: number;
  anio: number;
  activa: boolean;
}
