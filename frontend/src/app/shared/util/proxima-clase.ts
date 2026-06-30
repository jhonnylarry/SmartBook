import { BloqueHorarioDto, DiaSemana } from '../../core/models/horario.model';

const DIA_INDEX: Record<DiaSemana, number> = {
  LUNES: 1, MARTES: 2, MIERCOLES: 3, JUEVES: 4, VIERNES: 5, SABADO: 6,
};

/**
 * Devuelve el bloque de horario que ocurre a continuación a partir de "ahora",
 * recorriendo la semana de forma cíclica (si ya pasaron todos los de hoy, toma el
 * primero de los días siguientes). Devuelve null si no hay bloques.
 */
export function proximaClase(bloques: BloqueHorarioDto[], ahora: Date = new Date()): BloqueHorarioDto | null {
  if (!bloques || bloques.length === 0) return null;
  const hoy = ahora.getDay() === 0 ? 7 : ahora.getDay(); // 1=Lunes … 7=Domingo
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

  let mejor: { dist: number; bloque: BloqueHorarioDto } | null = null;
  for (const b of bloques) {
    const dia = DIA_INDEX[b.diaSemana];
    if (dia == null) continue;
    const [h, m] = b.horaInicio.split(':').map(Number);
    const inicioMin = h * 60 + m;
    let dist = (dia - hoy) * 1440 + (inicioMin - minutosAhora);
    if (dist < 0) dist += 7 * 1440; // se mueve a la próxima semana
    if (!mejor || dist < mejor.dist) mejor = { dist, bloque: b };
  }
  return mejor?.bloque ?? null;
}
