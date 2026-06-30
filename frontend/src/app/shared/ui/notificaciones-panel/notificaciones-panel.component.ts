import { Component, computed, input, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Notificacion, TipoNotificacion } from '../../../core/notificaciones/notificacion.model';
import { SkeletonComponent } from '../skeleton/skeleton.component';

interface EstiloTipo {
  bg: string;
  fg: string;
  svg: string;
}

const ESTILOS: Record<TipoNotificacion, EstiloTipo> = {
  evento: {
    bg: '#eef2ff', fg: '#4f46e5',
    svg: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  mensaje: {
    bg: '#eff6ff', fg: '#2563eb',
    svg: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  nota: {
    bg: '#ecfdf5', fg: '#059669',
    svg: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0118 14.236',
  },
  anotacion: {
    bg: '#fffbeb', fg: '#d97706',
    svg: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  },
};

type Filtro = 'todos' | 'evento' | 'mensaje' | 'avisos';

/**
 * Panel de notificaciones del Inicio: chips de filtro, agrupación (Próximo / Reciente),
 * marcar mensajes como leídos inline y entrada escalonada.
 */
@Component({
  selector: 'app-notificaciones-panel',
  standalone: true,
  imports: [SkeletonComponent, NgTemplateOutlet],
  template: `
    <div class="card p-5 flex flex-col gap-4 h-full">
      <div class="flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center"
            style="background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.35);">
            <svg class="w-4.5 h-4.5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <h2 class="font-bold text-slate-900">Notificaciones</h2>
        </div>
        @if (!loading() && items().length > 0) {
          <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{{ items().length }}</span>
        }
      </div>

      <!-- Filtros -->
      @if (!loading() && items().length > 0) {
        <div class="flex flex-wrap gap-1.5 shrink-0">
          @for (f of filtros; track f.key) {
            <button
              (click)="filtro.set(f.key)"
              class="px-3 py-1 rounded-full text-xs font-medium transition-colors border"
              [class]="filtro() === f.key
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'"
            >{{ f.label }}</button>
          }
        </div>
      }

      @if (loading()) {
        <div class="space-y-2.5">
          @for (i of [1,2,3,4]; track i) { <app-skeleton variant="custom" height="3.25rem" radius="0.75rem" /> }
        </div>
      } @else if (filtrados().length === 0) {
        <div class="flex-1 flex flex-col items-center justify-center gap-2 text-center py-8">
          <svg class="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-sm font-medium text-slate-500">Estás al día</p>
          <p class="text-xs text-slate-400">No hay notificaciones en este filtro.</p>
        </div>
      } @else {
        <div class="flex flex-col gap-3 overflow-y-auto -mr-1 pr-1">
          @if (proximos().length > 0) {
            <div>
              <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400 px-1 mb-1">Próximo</p>
              <ul class="flex flex-col gap-1.5">
                @for (n of proximos(); track $index) {
                  <ng-container [ngTemplateOutlet]="fila" [ngTemplateOutletContext]="{ $implicit: n, i: $index }" />
                }
              </ul>
            </div>
          }
          @if (recientes().length > 0) {
            <div>
              <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400 px-1 mb-1">Reciente</p>
              <ul class="flex flex-col gap-1.5">
                @for (n of recientes(); track $index) {
                  <ng-container [ngTemplateOutlet]="fila" [ngTemplateOutletContext]="{ $implicit: n, i: $index }" />
                }
              </ul>
            </div>
          }
        </div>
      }
    </div>

    <ng-template #fila let-n let-i="i">
      <li
        class="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
        [style.animation]="'rowIn 0.35s cubic-bezier(0.22,1,0.36,1) ' + (i * 50) + 'ms both'"
      >
        <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" [style.background]="estilo(n.tipo).bg">
          <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" [style.color]="estilo(n.tipo).fg">
            <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="estilo(n.tipo).svg" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold text-slate-800 truncate">{{ n.titulo }}</p>
            @if (n.tipo === 'mensaje' && n.leido === false) {
              <span class="w-2 h-2 rounded-full bg-accent-500 shrink-0" title="No leído"></span>
            }
          </div>
          @if (n.subtitulo) { <p class="text-xs text-slate-500 truncate mt-0.5">{{ n.subtitulo }}</p> }
        </div>
        <div class="flex flex-col items-end gap-1 shrink-0">
          @if (cuando(n)) { <span class="text-[11px] text-slate-400 whitespace-nowrap">{{ cuando(n) }}</span> }
          @if (n.tipo === 'mensaje' && n.leido === false && n.mensajeId) {
            <button (click)="marcarLeido.emit(n.mensajeId)"
              class="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-medium text-primary-600 hover:text-primary-800">
              Marcar leído
            </button>
          }
        </div>
      </li>
    </ng-template>
  `,
  styles: [`.w-4\\.5 { width: 1.125rem; } .h-4\\.5 { height: 1.125rem; }`],
})
export class NotificacionesPanelComponent {
  readonly items = input<Notificacion[]>([]);
  readonly loading = input<boolean>(false);
  readonly marcarLeido = output<number>();

  readonly filtro = signal<Filtro>('todos');
  readonly filtros: { key: Filtro; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'evento', label: 'Eventos' },
    { key: 'mensaje', label: 'Mensajes' },
    { key: 'avisos', label: 'Avisos' },
  ];

  readonly filtrados = computed<Notificacion[]>(() => {
    const f = this.filtro();
    return this.items().filter((n) => {
      if (f === 'todos') return true;
      if (f === 'avisos') return n.tipo === 'nota' || n.tipo === 'anotacion';
      return n.tipo === f;
    });
  });

  readonly proximos = computed(() => this.filtrados().filter((n) => n.futuro));
  readonly recientes = computed(() => this.filtrados().filter((n) => !n.futuro));

  estilo(tipo: TipoNotificacion): EstiloTipo {
    return ESTILOS[tipo];
  }

  cuando(n: Notificacion): string {
    if (!n.fecha) return '';
    const d = new Date(n.fecha);
    if (isNaN(d.getTime())) return '';
    const ahora = new Date();
    const dia = 24 * 60 * 60 * 1000;
    const hhmm = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    const mismoDia = d.toDateString() === ahora.toDateString();

    if (n.futuro) {
      if (mismoDia) return `Hoy ${hhmm}`;
      const maniana = new Date(ahora.getTime() + dia);
      if (d.toDateString() === maniana.toDateString()) return `Mañana ${hhmm}`;
      return d.toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit', month: '2-digit' });
    }

    const diff = ahora.getTime() - d.getTime();
    if (diff < 60 * 60 * 1000) return 'Recién';
    if (mismoDia) return `Hoy ${hhmm}`;
    const ayer = new Date(ahora.getTime() - dia);
    if (d.toDateString() === ayer.toDateString()) return 'Ayer';
    const dias = Math.floor(diff / dia);
    if (dias < 7) return `Hace ${dias} días`;
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
  }
}
