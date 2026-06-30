// ── Hoja de Vida ──
export interface HojaVidaEstudianteDTO {
  id: number;
  idEstudiante: number;
  anioAcademico: string;
  observaciones: string | null;
  fechaCreacion: string;
}
export interface AgregarHojaVida {
  idEstudiante: number;
  anioAcademico: string;
  observaciones?: string;
}
export interface ActualizarHojaVida {
  anioAcademico?: string;
  observaciones?: string;
}

// ── Antecedente Académico ──
export interface AntecedenteAcademicoDTO {
  id: number;
  idHojaVida: number;
  colegioProcedencia: string | null;
  fechaIngreso: string | null;   // ISO LocalDate
  viveCon: string | null;
  promedioGeneral: number | null;
}
export interface AgregarAntecedenteAcademico {
  idHojaVida: number;
  colegioProcedencia?: string;
  fechaIngreso?: string;
  viveCon?: string;
  promedioGeneral?: number;
}
export type ActualizarAntecedenteAcademico = Omit<AgregarAntecedenteAcademico, 'idHojaVida'>;

// ── Antecedente Familiar ──
export interface AntecedenteFamiliarDTO {
  id: number;
  idHojaVida: number;
  nombre: string;
  parentesco: string;
  telefono: string | null;
  ocupacion: string | null;
  esContactoEmergencia: boolean;
}
export interface AgregarAntecedenteFamiliar {
  idHojaVida: number;
  nombre: string;
  parentesco: string;
  telefono?: string;
  ocupacion?: string;
  esContactoEmergencia?: boolean;
}
export type ActualizarAntecedenteFamiliar = Omit<AgregarAntecedenteFamiliar, 'idHojaVida'>;

// ── Antecedente Médico ──
export interface AntecedenteMedicoDTO {
  id: number;
  idHojaVida: number;
  tipoSangre: string | null;
  alergias: string | null;
  enfermedadesCronicas: string | null;
  medicacion: string | null;
  previsionSalud: string | null;
}
export interface AgregarAntecedenteMedico {
  idHojaVida: number;
  tipoSangre?: string;
  alergias?: string;
  enfermedadesCronicas?: string;
  medicacion?: string;
  previsionSalud?: string;
}
export type ActualizarAntecedenteMedico = Omit<AgregarAntecedenteMedico, 'idHojaVida'>;

// ── Documento Adjunto (solo metadata) ──
export interface DocumentoAdjuntoDTO {
  id: number;
  idHojaVida: number;
  nombre: string;
  tipoMime: string | null;
  url: string | null;
  subidoPor: number | null;
  fechaCarga: string;
}
export interface AgregarDocumentoAdjunto {
  idHojaVida: number;
  nombre: string;
  tipoMime?: string;
  url?: string;
  subidoPor?: number;
}
export type ActualizarDocumentoAdjunto = Omit<AgregarDocumentoAdjunto, 'idHojaVida'>;
