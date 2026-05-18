export interface HojaVida {
  id: number;
  idEstudiante: number;
  observaciones?: string;
  fechaActualizacion: string;
}

export interface AntecedenteMedico {
  id: number;
  idHojaVida: number;
  descripcion: string;
  fechaRegistro: string;
}

export interface AntecedenteAcademico {
  id: number;
  idHojaVida: number;
  establecimiento: string;
  anio: number;
  observaciones?: string;
}
