export type TipoAnotacion = 'POSITIVA' | 'NEGATIVA';
export type GravedadAnotacion = 'LEVE' | 'GRAVE' | 'MUY_GRAVE';

export interface AnotacionDTO {
  id: number;
  idEstudiante: number;
  idDocente: number;
  tipo: TipoAnotacion;
  gravedad: GravedadAnotacion;
  descripcion: string;
  fecha: string;          // ISO LocalDateTime
  fechaCreacion: string;  // ISO LocalDateTime
}

export interface AgregarAnotacion {
  idEstudiante: number;
  idDocente: number;
  tipo: TipoAnotacion;
  gravedad: GravedadAnotacion;
  descripcion: string;
  fecha?: string;         // ISO LocalDateTime (opcional)
}

export interface ActualizarAnotacion {
  tipo?: TipoAnotacion;
  gravedad?: GravedadAnotacion;
  descripcion?: string;
  fecha?: string;
}

export const TIPOS_ANOTACION: TipoAnotacion[] = ['POSITIVA', 'NEGATIVA'];
export const GRAVEDADES_ANOTACION: GravedadAnotacion[] = ['LEVE', 'GRAVE', 'MUY_GRAVE'];
