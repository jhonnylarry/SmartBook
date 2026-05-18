export type TipoReporte = 'NOTAS' | 'ANOTACIONES' | 'CURSO';

export interface Reporte {
  id: number;
  tipo: TipoReporte;
  idReferencia: number;
  datosJson: string;
  fechaGeneracion: string;
  idSolicitante: number;
}
