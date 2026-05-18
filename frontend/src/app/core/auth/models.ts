export type Rol =
  | 'ADMINISTRADOR'
  | 'DIRECTOR'
  | 'DOCENTE'
  | 'INSPECTOR'
  | 'ADMINISTRATIVO'
  | 'APODERADO'
  | 'ESTUDIANTE';

export interface Usuario {
  id: number;
  username: string;
  email: string;
  rol: Rol;
  activo: boolean;
  fechaCreacion: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiraEn: string;
  usuario: Usuario;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  rol: Rol;
}
