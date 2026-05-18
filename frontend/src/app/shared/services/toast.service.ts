import { Injectable, signal, computed } from '@angular/core';

export type ToastTipo = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  mensaje: string;
  tipo: ToastTipo;
  saliendo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  private _nextId = 0;

  readonly toasts = computed(() => this._toasts());

  success(mensaje: string): void {
    this._mostrar(mensaje, 'success');
  }

  error(mensaje: string): void {
    this._mostrar(mensaje, 'error');
  }

  info(mensaje: string): void {
    this._mostrar(mensaje, 'info');
  }

  warning(mensaje: string): void {
    this._mostrar(mensaje, 'warning');
  }

  private _mostrar(mensaje: string, tipo: ToastTipo): void {
    const id = ++this._nextId;
    this._toasts.update(list => [...list, { id, mensaje, tipo }]);

    // Auto-dismiss: marcar como "saliendo" a los 3.7s, remover a los 4s
    setTimeout(() => this._iniciarSalida(id), 3700);
    setTimeout(() => this._remover(id), 4000);
  }

  private _iniciarSalida(id: number): void {
    this._toasts.update(list =>
      list.map(t => t.id === id ? { ...t, saliendo: true } : t)
    );
  }

  private _remover(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  removerManual(id: number): void {
    this._iniciarSalida(id);
    setTimeout(() => this._remover(id), 200);
  }
}
