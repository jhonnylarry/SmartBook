import { Component, DestroyRef, HostListener, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MensajeriaApiService } from '../../../core/api/mensajeria-api.service';
import { MensajeDto } from '../../../core/models/mensajeria.model';

/**
 * Campana de notificaciones reutilizable por todos los shells. Muestra un badge con el
 * número de mensajes recibidos sin leer y, al hacer clic, un dropdown con los últimos
 * mensajes (con "marcar leído" inline) y un enlace opcional "Ver todo".
 */
@Component({
  selector: 'app-campana-notificaciones',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="relative">
      <button
        (click)="toggle()"
        class="relative flex w-9 h-9 rounded-xl items-center justify-center text-slate-500
               hover:text-primary-700 hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all duration-150
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        [attr.aria-expanded]="open()"
        aria-haspopup="true"
        aria-label="Notificaciones"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        @if (noLeidos() > 0) {
          <span class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center animate-scaleIn">
            {{ noLeidos() > 9 ? '9+' : noLeidos() }}
          </span>
        }
      </button>

      @if (open()) {
        <div
          class="absolute right-0 top-full mt-2 w-80 max-w-[88vw] rounded-2xl py-2 z-40 animate-slideDown overflow-hidden"
          style="background: rgba(255,255,255,0.98); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 16px 48px rgba(2,6,23,0.18);"
          role="menu"
        >
          <div class="flex items-center justify-between px-4 py-2 border-b border-slate-100">
            <p class="text-sm font-bold text-slate-800">Notificaciones</p>
            @if (noLeidos() > 0) {
              <span class="text-[11px] font-semibold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full">{{ noLeidos() }} sin leer</span>
            }
          </div>

          @if (mensajes().length === 0) {
            <div class="px-4 py-6 text-center">
              <p class="text-sm text-slate-500">Sin mensajes</p>
            </div>
          } @else {
            <ul class="max-h-80 overflow-y-auto py-1">
              @for (m of recientes(); track m.id; let i = $index) {
                <li
                  class="px-3 py-2 mx-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-2.5"
                  [style.animation]="'rowIn 0.3s cubic-bezier(0.22,1,0.36,1) ' + (i * 40) + 'ms both'"
                  (click)="marcarLeido(m)"
                >
                  <span class="mt-1.5 w-2 h-2 rounded-full shrink-0" [class]="m.leido ? 'bg-slate-200' : 'bg-accent-500'"></span>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm text-slate-800 truncate" [class.font-semibold]="!m.leido">{{ m.asunto }}</p>
                    <p class="text-xs text-slate-400 truncate">{{ m.contenido }}</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">{{ cuando(m.fechaEnvio) }}</p>
                  </div>
                </li>
              }
            </ul>
          }

          @if (inicioLink()) {
            <div class="border-t border-slate-100 px-2 pt-1.5">
              <a [routerLink]="inicioLink()" (click)="open.set(false)"
                class="block text-center text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-xl py-2 transition-colors">
                Ver todo
              </a>
            </div>
          }
        </div>
        <div class="fixed inset-0 z-30" (click)="open.set(false)" aria-hidden="true"></div>
      }
    </div>
  `,
})
export class CampanaNotificacionesComponent {
  private readonly mensajeriaApi = inject(MensajeriaApiService);
  private readonly destroyRef = inject(DestroyRef);

  /** Enlace opcional "Ver todo" (p. ej. al Inicio del workspace). */
  readonly inicioLink = input<string | undefined>(undefined);

  readonly mensajes = signal<MensajeDto[]>([]);
  readonly open = signal(false);
  readonly noLeidos = computed(() => this.mensajes().filter((m) => !m.leido).length);
  readonly recientes = computed(() => this.mensajes().slice(0, 6));

  constructor() {
    // Carga inicial para el badge de no leídos (sin abrir el dropdown).
    this.cargar();
  }

  toggle(): void {
    const abriendo = !this.open();
    this.open.set(abriendo);
    if (abriendo) this.cargar();
  }

  private cargar(): void {
    this.mensajeriaApi.recibidos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (m) => this.mensajes.set(m),
      error: () => this.mensajes.set([]),
    });
  }

  marcarLeido(m: MensajeDto): void {
    if (m.leido) return;
    this.mensajeriaApi.marcarLeido(m.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.mensajes.update((list) => list.map((x) => (x.id === m.id ? { ...x, leido: true } : x))),
      error: () => {},
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.open.set(false);
  }

  cuando(fecha: string): string {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '';
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Recién';
    if (min < 60) return `Hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `Hace ${h} h`;
    const dias = Math.floor(h / 24);
    if (dias < 7) return `Hace ${dias} d`;
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
  }
}
