import { Component, inject } from '@angular/core';
import { ToastService, Toast, ToastType } from './toast.service';

interface EstiloToast {
  wrapper: string;
  border: string;
  iconBg: string;
  iconColor: string;
  title: string;
  text: string;
  progress: string;
  icon: string;
}

const ESTILOS: Record<ToastType, EstiloToast> = {
  success: {
    wrapper: 'bg-white/95 border border-emerald-100', border: 'bg-emerald-500',
    iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', title: 'text-emerald-900', text: 'text-emerald-800', progress: 'bg-emerald-400',
    icon: 'M4.5 12.75l6 6 9-13.5',
  },
  error: {
    wrapper: 'bg-white/95 border border-red-100', border: 'bg-red-500',
    iconBg: 'bg-red-100', iconColor: 'text-red-600', title: 'text-red-900', text: 'text-red-800', progress: 'bg-red-400',
    icon: 'M6 18L18 6M6 6l12 12',
  },
  warning: {
    wrapper: 'bg-white/95 border border-amber-100', border: 'bg-amber-500',
    iconBg: 'bg-amber-100', iconColor: 'text-amber-600', title: 'text-amber-900', text: 'text-amber-800', progress: 'bg-amber-400',
    icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  },
  info: {
    wrapper: 'bg-white/95 border border-blue-100', border: 'bg-blue-500',
    iconBg: 'bg-blue-100', iconColor: 'text-blue-600', title: 'text-blue-900', text: 'text-blue-800', progress: 'bg-blue-400',
    icon: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
  },
  logro: {
    wrapper: 'bg-white/95 border border-emerald-100', border: 'bg-gradient-to-b from-emerald-400 to-teal-500',
    iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', title: 'text-emerald-900', text: 'text-emerald-800', progress: 'bg-emerald-400',
    icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
  },
};

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div
      class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [class]="claseWrapper(toast)"
          (mouseenter)="toastService.pause(toast.id)"
          (mouseleave)="toastService.resume(toast.id)"
          role="alert"
          style="box-shadow: 0 8px 24px rgba(0,0,0,0.12); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);"
        >
          <!-- Borde izquierdo de color -->
          <div class="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" [class]="estilo(toast.type).border"></div>

          <!-- Contenido -->
          <div class="flex items-start gap-3 px-4 py-3.5 pl-5">
            <!-- Icono -->
            <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" [class]="estilo(toast.type).iconBg">
              <svg class="w-4 h-4" [class]="estilo(toast.type).iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="estilo(toast.type).icon" />
              </svg>
            </div>

            <!-- Texto -->
            <div class="flex-1 min-w-0 pt-0.5">
              @if (toast.title) {
                <p class="text-sm font-bold leading-snug" [class]="estilo(toast.type).title">{{ toast.title }}</p>
              }
              <p class="text-sm leading-snug" [class]="estilo(toast.type).text" [class.font-medium]="!toast.title">{{ toast.message }}</p>
              @if (toast.action; as action) {
                <button
                  (click)="ejecutar(toast)"
                  class="mt-2 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors"
                  [class]="estilo(toast.type).iconColor"
                  style="border-color: currentColor;"
                >
                  {{ action.label }}
                </button>
              }
            </div>

            <!-- Botón cerrar -->
            <button
              (click)="toastService.remove(toast.id)"
              class="shrink-0 ml-1 mt-0.5 opacity-50 hover:opacity-100 transition-opacity rounded-lg p-0.5
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
              aria-label="Cerrar notificación"
            >
              <svg class="w-4 h-4" [class]="estilo(toast.type).text" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Barra de progreso (se pausa al hover) -->
          @if (toast.duration && toast.duration > 0 && !toast.leaving) {
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5">
              <div
                class="h-full rounded-full group-hover:[animation-play-state:paused]"
                [class]="estilo(toast.type).progress"
                [style]="progressStyle(toast)"
              ></div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-leaving { animation: toastOut 0.22s cubic-bezier(0.4, 0, 1, 1) both; }
    @keyframes toastOut {
      0%   { opacity: 1; transform: translateX(0) scale(1); }
      100% { opacity: 0; transform: translateX(28px) scale(0.96); }
    }
    @media (prefers-reduced-motion: reduce) {
      .toast-item, .toast-leaving { animation: none !important; }
    }
  `],
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  estilo(type: ToastType): EstiloToast {
    return ESTILOS[type] ?? ESTILOS.info;
  }

  /** Clase completa del contenedor en un solo binding (evita conflictos [class] + [class.x]). */
  claseWrapper(toast: Toast): string {
    const base = 'toast-item group pointer-events-auto relative overflow-hidden rounded-2xl';
    const anim = toast.leaving ? 'toast-leaving' : 'animate-slideInRight';
    return `${base} ${this.estilo(toast.type).wrapper} ${anim}`;
  }

  ejecutar(toast: Toast): void {
    toast.action?.handler();
    this.toastService.remove(toast.id);
  }

  progressStyle(toast: Toast): string {
    if (!toast.duration) return '';
    return `width: 100%; animation: progressShrink ${toast.duration}ms linear forwards;`;
  }
}
