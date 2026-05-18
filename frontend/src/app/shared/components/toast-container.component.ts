import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  styles: [`
    :host {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 8px;
      background: #faf6f0;
      border: 1px solid rgba(43, 39, 34, 0.08);
      box-shadow: 0 4px 16px rgba(43, 39, 34, 0.10), 0 16px 48px rgba(43, 39, 34, 0.06);
      min-width: 280px;
      max-width: 380px;
      pointer-events: all;
      animation: slide-in-right 250ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .toast.saliendo {
      animation: slide-out-right 200ms ease forwards;
    }

    .toast__icon {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      margin-top: 1px;
    }

    .toast__body {
      flex: 1;
      min-width: 0;
    }

    .toast__mensaje {
      font-size: 0.875rem;
      line-height: 1.4;
      color: #2b2722;
      font-weight: 500;
    }

    .toast__close {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      color: #b8ad9a;
      cursor: pointer;
      transition: color 150ms ease;
      margin-top: 1px;
      background: none;
      border: none;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast__close:hover { color: #2b2722; }

    .toast--success { border-left: 3px solid #6b9272; }
    .toast--success .toast__icon { color: #6b9272; }

    .toast--error { border-left: 3px solid #b03a2e; }
    .toast--error .toast__icon { color: #b03a2e; }

    .toast--info { border-left: 3px solid #2a6b7d; }
    .toast--info .toast__icon { color: #2a6b7d; }

    .toast--warning { border-left: 3px solid #d9a441; }
    .toast--warning .toast__icon { color: #d9a441; }
  `],
  template: `
    @for (toast of toastService.toasts(); track toast.id) {
      <div
        [class]="'toast toast--' + toast.tipo + (toast.saliendo ? ' saliendo' : '')"
        role="status"
        [attr.aria-live]="toast.tipo === 'error' ? 'assertive' : 'polite'">

        <!-- Icono según tipo (SVG inline) -->
        <svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          @switch (toast.tipo) {
            @case ('success') {
              <polyline points="20 6 9 17 4 12"/>
            }
            @case ('error') {
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            }
            @case ('warning') {
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            }
            @default {
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            }
          }
        </svg>

        <div class="toast__body">
          <p class="toast__mensaje">{{ toast.mensaje }}</p>
        </div>

        <button
          type="button"
          (click)="cerrar(toast)"
          class="toast__close"
          [attr.aria-label]="'Cerrar notificacion'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    }
  `
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);

  cerrar(toast: Toast): void {
    this.toastService.removerManual(toast.id);
  }
}
