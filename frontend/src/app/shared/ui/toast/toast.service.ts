import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'logro';

export interface ToastAction {
  label: string;
  handler: () => void;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
  action?: ToastAction;
  /** Si es true, el toast no se cierra solo (requiere cerrar/actuar). */
  persist?: boolean;
}

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  action?: ToastAction;
  persist?: boolean;
  /** Marca de salida para animar el cierre antes de removerlo. */
  leaving?: boolean;
}

interface TimerState {
  handle: ReturnType<typeof setTimeout>;
  remaining: number;
  startedAt: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private readonly timers = new Map<string, TimerState>();

  success(message: string, opts?: number | ToastOptions): void {
    this.show('success', message, this.normalize(opts), 4000);
  }
  error(message: string, opts?: number | ToastOptions): void {
    this.show('error', message, this.normalize(opts), 5000);
  }
  warning(message: string, opts?: number | ToastOptions): void {
    this.show('warning', message, this.normalize(opts), 4500);
  }
  info(message: string, opts?: number | ToastOptions): void {
    this.show('info', message, this.normalize(opts), 4000);
  }
  /** Toast de logro / refuerzo positivo (p. ej. felicitar al alumno). */
  logro(message: string, opts?: number | ToastOptions): void {
    this.show('logro', message, this.normalize(opts), 5000);
  }

  private normalize(opts?: number | ToastOptions): ToastOptions {
    return typeof opts === 'number' ? { duration: opts } : (opts ?? {});
  }

  private show(type: ToastType, message: string, opts: ToastOptions, defaultDuration: number): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const duration = opts.persist ? 0 : (opts.duration ?? defaultDuration);
    const toast: Toast = {
      id, type, message,
      title: opts.title,
      action: opts.action,
      persist: opts.persist,
      duration,
    };
    this._toasts.update((list) => [...list, toast]);
    if (duration > 0) this.startTimer(id, duration);
  }

  private startTimer(id: string, ms: number): void {
    const handle = setTimeout(() => this.remove(id), ms);
    this.timers.set(id, { handle, remaining: ms, startedAt: Date.now() });
  }

  /** Pausa el auto-cierre (al pasar el mouse por encima). */
  pause(id: string): void {
    const t = this.timers.get(id);
    if (!t) return;
    clearTimeout(t.handle);
    t.remaining -= Date.now() - t.startedAt;
    t.startedAt = Date.now(); // defensivo: evita doble descuento si se vuelve a pausar sin reanudar
  }

  /** Reanuda el auto-cierre con el tiempo restante. */
  resume(id: string): void {
    const t = this.timers.get(id);
    if (!t) return;
    if (t.remaining <= 0) { this.remove(id); return; }
    this.startTimer(id, t.remaining);
  }

  /** Cierre animado: marca el toast como saliente y lo remueve tras la animación. */
  remove(id: string): void {
    const t = this.timers.get(id);
    if (t) { clearTimeout(t.handle); this.timers.delete(id); }
    this._toasts.update((list) => list.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    setTimeout(() => this._toasts.update((list) => list.filter((x) => x.id !== id)), 220);
  }
}
