export interface MensajeDto {
  id: number;
  idRemitente: number;
  idDestinatario: number;
  asunto: string;
  contenido: string;
  fechaEnvio: string; // ISO LocalDateTime
  leido: boolean;
  loteDifusion: string | null;
}

export interface ContactoDto {
  idUsuario: number;
  nombre: string;
  rol: string;
  /** COMPAÑERO | DOCENTE | ALUMNO | APODERADO | STAFF | GENERAL */
  origen: string;
}

export interface GrupoDto {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface DifusionResultDto {
  loteDifusion: string;
  grupoId: string;
  enviados: number;
}

export interface EnviarMensajeRequest {
  idDestinatario: number;
  asunto: string;
  contenido: string;
}

export interface EnviarDifusionRequest {
  grupoId: string;
  asunto: string;
  contenido: string;
}
