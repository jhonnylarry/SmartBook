export type TipoNotificacion = 'evento' | 'mensaje' | 'nota' | 'anotacion';

export interface Notificacion {
  tipo: TipoNotificacion;
  titulo: string;
  subtitulo?: string;
  fecha?: string;     // ISO; usado para ordenar y etiquetar
  leido?: boolean;    // solo mensajes
  futuro?: boolean;   // evento próximo (se muestra primero)
  mensajeId?: number; // id del mensaje (para "marcar leído" inline)
}
