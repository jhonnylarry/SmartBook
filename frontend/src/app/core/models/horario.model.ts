export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';

export interface BloqueHorarioDto {
  id: number;
  idAsignatura: number;
  nombreAsignatura: string;
  diaSemana: DiaSemana;
  horaInicio: string; // "HH:mm"
  horaFin: string;    // "HH:mm"
  sala: string | null;
}

export interface AgregarBloqueHorario {
  idAsignatura: number;
  diaSemana: DiaSemana;
  horaInicio: string; // "HH:mm"
  horaFin: string;    // "HH:mm"
  sala?: string | null;
}

export type ActualizarBloqueHorario = AgregarBloqueHorario;

export const DIAS_SEMANA: DiaSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

export const DIA_LABEL: Record<DiaSemana, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
};

export const DIA_CORTO: Record<DiaSemana, string> = {
  LUNES: 'Lun',
  MARTES: 'Mar',
  MIERCOLES: 'Mié',
  JUEVES: 'Jue',
  VIERNES: 'Vie',
  SABADO: 'Sáb',
};
