import { Component, computed, input, output } from '@angular/core';
import { BloqueHorarioDto, DiaSemana, DIA_CORTO } from '../../../core/models/horario.model';
import { SkeletonComponent } from '../skeleton/skeleton.component';

const ORDEN_DIAS: DiaSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

const PALETA: { bg: string; border: string; text: string }[] = [
  { bg: '#dbeafe', border: '#bfdbfe', text: '#1e40af' },
  { bg: '#dcfce7', border: '#bbf7d0', text: '#166534' },
  { bg: '#fef9c3', border: '#fde68a', text: '#854d0e' },
  { bg: '#f3e8ff', border: '#e9d5ff', text: '#6b21a8' },
  { bg: '#ffe4e6', border: '#fecdd3', text: '#9f1239' },
  { bg: '#cffafe', border: '#a5f3fc', text: '#155e75' },
  { bg: '#ffedd5', border: '#fed7aa', text: '#9a3412' },
];

/**
 * Grilla de horario semanal (Lun–Vie, + Sáb si hay bloques). Reutilizable en el Inicio
 * de Docente y Estudiante (solo lectura) y en la gestión (editable, emite `quitar`).
 */
@Component({
  selector: 'app-horario-semanal',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    @if (loading()) {
      <div class="space-y-2">
        @for (i of [1,2,3,4]; track i) { <app-skeleton variant="custom" height="2.75rem" radius="0.75rem" /> }
      </div>
    } @else if (bloques().length === 0) {
      <div class="flex flex-col items-center justify-center gap-2 text-center py-10 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
        <svg class="w-9 h-9 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-medium text-slate-500">Sin horario definido todavía</p>
        @if (editable()) { <p class="text-xs text-slate-400">Agrega bloques con el formulario de abajo.</p> }
      </div>
    } @else {
      <div class="overflow-x-auto">
        <div class="grid gap-1.5 min-w-[640px]"
          [style.grid-template-columns]="'56px repeat(' + dias().length + ', minmax(110px, 1fr))'">

          <!-- Cabecera -->
          <div></div>
          @for (d of dias(); track d) {
            <div class="text-center text-xs font-bold text-slate-600 uppercase tracking-wide py-1.5">
              {{ diaCorto(d) }}
            </div>
          }

          <!-- Filas por hora de inicio -->
          @for (hora of horas(); track hora) {
            <div class="flex items-start justify-end pr-2 pt-1 text-[11px] font-semibold text-slate-400 tabular-nums">
              {{ hora }}
            </div>
            @for (d of dias(); track d) {
              @let bloque = celda(d, hora);
              @if (bloque) {
                <div class="rounded-xl border px-2.5 py-2 relative group"
                  [style.background]="color(bloque.idAsignatura).bg"
                  [style.border-color]="color(bloque.idAsignatura).border">
                  <p class="text-xs font-bold leading-tight truncate" [style.color]="color(bloque.idAsignatura).text"
                    [title]="bloque.nombreAsignatura">{{ bloque.nombreAsignatura }}</p>
                  <p class="text-[10px] mt-0.5 tabular-nums" [style.color]="color(bloque.idAsignatura).text">
                    {{ bloque.horaInicio }}–{{ bloque.horaFin }}
                  </p>
                  @if (bloque.sala) {
                    <p class="text-[10px] text-slate-500 truncate">{{ bloque.sala }}</p>
                  }
                  @if (editable()) {
                    <button type="button" (click)="quitar.emit(bloque)"
                      class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-400
                             hover:text-red-600 hover:border-red-200 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Quitar bloque">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  }
                </div>
              } @else {
                <div class="rounded-xl border border-slate-100 bg-slate-50/40"></div>
              }
            }
          }
        </div>
      </div>
    }
  `,
})
export class HorarioSemanalComponent {
  readonly bloques = input<BloqueHorarioDto[]>([]);
  readonly loading = input<boolean>(false);
  readonly editable = input<boolean>(false);
  readonly quitar = output<BloqueHorarioDto>();

  /** Días con bloques: siempre Lun–Vie; Sáb solo si hay algún bloque ese día. */
  readonly dias = computed<DiaSemana[]>(() => {
    const haySabado = this.bloques().some((b) => b.diaSemana === 'SABADO');
    return ORDEN_DIAS.filter((d) => d !== 'SABADO' || haySabado);
  });

  /** Horas de inicio distintas, ordenadas. */
  readonly horas = computed<string[]>(() =>
    [...new Set(this.bloques().map((b) => b.horaInicio))].sort((a, b) => a.localeCompare(b)),
  );

  private readonly indice = computed<Map<string, BloqueHorarioDto>>(() => {
    const m = new Map<string, BloqueHorarioDto>();
    for (const b of this.bloques()) m.set(`${b.diaSemana}|${b.horaInicio}`, b);
    return m;
  });

  celda(dia: DiaSemana, hora: string): BloqueHorarioDto | undefined {
    return this.indice().get(`${dia}|${hora}`);
  }

  diaCorto(d: DiaSemana): string {
    return DIA_CORTO[d];
  }

  color(idAsignatura: number): { bg: string; border: string; text: string } {
    return PALETA[idAsignatura % PALETA.length];
  }
}
