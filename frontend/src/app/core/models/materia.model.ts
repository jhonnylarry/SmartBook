export type NivelEnsenanza = 'BASICA' | 'MEDIA' | 'TECNICO';

export interface MateriaDTO {
  id: number;
  nombre: string;
  nivel: NivelEnsenanza;
  area: string | null;
  activo: boolean;
  fechaCreacion: string;
}

export interface AgregarMateria {
  nombre: string;
  nivel: NivelEnsenanza;
  area?: string;
}

export type ActualizarMateria = Partial<AgregarMateria> & { activo?: boolean };

export const NIVELES: { value: NivelEnsenanza; label: string }[] = [
  { value: 'BASICA', label: 'Básica' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'TECNICO', label: 'Técnico-Profesional' },
];
