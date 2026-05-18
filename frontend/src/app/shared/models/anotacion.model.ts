export type TipoAnotacion = 'POSITIVA' | 'NEGATIVA';
export type GravedadAnotacion = 'LEVE' | 'GRAVE' | 'MUY_GRAVE';

export interface Anotacion {
  id: number;
  idEstudiante: number;
  idDocente: number;
  tipo: TipoAnotacion;
  gravedad: GravedadAnotacion;
  descripcion: string;
  fecha: string;
}

export interface AnotacionRequest {
  idEstudiante: number;
  idDocente: number;
  tipo: TipoAnotacion;
  gravedad: GravedadAnotacion;
  descripcion: string;
}
