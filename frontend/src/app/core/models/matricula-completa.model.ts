export interface EstudianteMatriculaRequest {
  nombre: string;
  apellido: string;
  rut: string;
  fechaNacimiento: string;
  email: string;
  password: string;
}

export interface ApoderadoMatriculaRequest {
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  telefono: string;
  parentesco: string;
  password: string;
}

export interface MatriculaCompletaRequest {
  estudiante: EstudianteMatriculaRequest;
  apoderadoTitular: ApoderadoMatriculaRequest;
  tutor: ApoderadoMatriculaRequest;
  idCurso: number;
}

export interface ApoderadoResponse {
  id: number;
  idEstudiante: number;
  idUsuario: number;
  tipo: 'TITULAR' | 'SUPLENTE';
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  telefono: string;
  parentesco: string;
}

export interface EstudianteResponseMatricula {
  id: number;
  idUsuario: number;
  nombre: string;
  apellido: string;
  rut: string;
  fechaNacimiento: string;
}

export interface MatriculaResponse {
  id: number;
  idEstudiante: number;
  idCurso: number;
  fechaMatricula: string;
  estado: string;
}

export interface Credencial {
  rol: string;
  username: string;
  email: string;
  passwordTemporal: string;
}

export interface MatriculaCompletaResponse {
  estudiante: EstudianteResponseMatricula;
  apoderadoTitular: ApoderadoResponse;
  tutor: ApoderadoResponse;
  matricula: MatriculaResponse;
  credenciales: Credencial[];
}
