export interface Mensaje {
  id: number;
  idRemitente: number;
  idDestinatario: number;
  asunto: string;
  contenido: string;
  fechaEnvio: string;
  leido: boolean;
}

export interface MensajeRequest {
  idDestinatario: number;
  asunto: string;
  contenido: string;
}
