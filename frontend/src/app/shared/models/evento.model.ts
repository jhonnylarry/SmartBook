export type TipoEvento = 'CLASE' | 'REUNION' | 'EVALUACION' | 'FERIADO' | 'OTRO';

export interface Evento {
  id: number;
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: TipoEvento;
  idCreador: number;
}

export interface EventoRequest {
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: TipoEvento;
}
