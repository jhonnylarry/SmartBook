import { Component, input } from '@angular/core';
import { BoletinAsignaturaDto } from '../../../core/models/boletin.model';
import { SkeletonComponent } from '../skeleton/skeleton.component';

/**
 * Boletín de notas reutilizable (alumno, apoderado, staff). Recibe el boletín ya calculado
 * por el backend (promedio ponderado por asignatura) y lo renderiza por tarjetas.
 */
@Component({
  selector: 'app-boletin-notas',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    @if (loading()) {
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (i of [1,2,3,4]; track i) { <app-skeleton variant="custom" height="9rem" radius="1rem" /> }
      </div>
    } @else if (boletin().length === 0) {
      <div class="card p-10 flex flex-col items-center justify-center gap-2 text-center">
        <svg class="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-sm font-medium text-slate-500">Aún no hay calificaciones registradas</p>
      </div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (b of boletin(); track b.idAsignatura) {
          <div class="card p-4 flex flex-col gap-2">
            <div class="flex items-center justify-between gap-2">
              <h3 class="font-bold text-slate-800 truncate">{{ b.nombreAsignatura }}</h3>
              @if (b.promedio !== null) {
                <span class="text-sm font-bold px-2.5 py-1 rounded-lg shrink-0 tabular-nums" [class]="clasePromedio(b.promedio)">
                  {{ b.promedio.toFixed(1) }}
                </span>
              } @else {
                <span class="text-xs text-slate-400 shrink-0">Sin promedio</span>
              }
            </div>
            <ul class="divide-y divide-slate-100">
              @for (n of b.notas; track n.idEvaluacion) {
                <li class="flex items-center justify-between gap-2 py-1.5 text-sm">
                  <span class="text-slate-600 truncate">
                    {{ n.nombreEvaluacion }}
                    <span class="text-xs text-slate-400">· {{ n.ponderacion }}%</span>
                  </span>
                  <span class="font-semibold tabular-nums shrink-0" [class]="n.calificacion >= 4 ? 'text-slate-800' : 'text-red-600'">
                    {{ n.calificacion.toFixed(1) }}
                  </span>
                </li>
              }
            </ul>
          </div>
        }
      </div>
    }
  `,
})
export class BoletinNotasComponent {
  readonly boletin = input<BoletinAsignaturaDto[]>([]);
  readonly loading = input<boolean>(false);

  clasePromedio(p: number): string {
    return p >= 4 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700';
  }
}
