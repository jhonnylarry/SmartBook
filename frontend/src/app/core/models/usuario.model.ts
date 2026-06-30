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
  expiraEn: number;
  usuario: Usuario;
}

export interface CreateUsuarioRequest {
  username: string;
  email: string;
  password: string;
  rol: Rol;
}

export interface UpdateUsuarioRequest {
  email?: string;
  password?: string;
  rol?: Rol;
  activo?: boolean;
}

export interface PerfilPublico {
  id: number;
  username: string;
  rol: Rol;
}

export interface JwtPayload {
  sub: string;
  username: string;
  rol: Rol;
  exp: number;
  iat: number;
}
