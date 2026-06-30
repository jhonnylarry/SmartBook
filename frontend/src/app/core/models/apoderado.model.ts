export type TipoApoderado = 'TITULAR' | 'SUPLENTE';

/** Vista que el apoderado tiene de uno de sus estudiantes a cargo (pupilo). */
export interface PupiloDto {
  idEstudiante: number;
  nombreEstudiante: string;
  apellidoEstudiante: string;
  rut: string | null;
  idCurso: number | null;
  tipo: TipoApoderado;
  parentesco: string | null;
}
