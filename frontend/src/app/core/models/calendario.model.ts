export type TipoEvento = 'CLASE' | 'REUNION' | 'EVALUACION' | 'FERIADO' | 'OTRO';

export interface EventoDto {
  id: number;
  titulo: string;
  descripcion: string | null;
  fechaInicio: string;   // ISO LocalDateTime
  fechaFin: string;      // ISO LocalDateTime
  tipo: TipoEvento;
  idCreador: number | null;
  fechaCreacion: string;
  idAsignatura: number | null;
}

export interface AgregarEvento {
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: TipoEvento;
  idCreador?: number;
  idAsignatura?: number | null;
}

export type ActualizarEvento = Partial<AgregarEvento>;

export const TIPOS_EVENTO: TipoEvento[] = ['CLASE', 'REUNION', 'EVALUACION', 'FERIADO', 'OTRO'];
