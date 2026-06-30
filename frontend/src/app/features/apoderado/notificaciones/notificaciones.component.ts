import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MensajeriaApiService } from '../../../core/api/mensajeria-api.service';
import { NotificacionesService } from '../../../core/notificaciones/notificaciones.service';
import { Notificacion } from '../../../core/notificaciones/notificacion.model';
import { NotificacionesPanelComponent } from '../../../shared/ui/notificaciones-panel/notificaciones-panel.component';

/** Pestaña "Notificaciones" del apoderado: mensajes recibidos (incluye los avisos de notas de sus pupilos). */
@Component({
  selector: 'app-apoderado-notificaciones',
  standalone: true,
  imports: [NotificacionesPanelComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">
      <div>
        <h1 class="page-title">Notificaciones</h1>
        <p class="text-slate-500 text-sm mt-1">Mensajes y avisos del colegio sobre tus pupilos.</p>
      </div>
      <div class="flex-1 min-h-0">
        <app-notificaciones-panel [items]="notificaciones()" [loading]="cargando()" (marcarLeido)="onMarcarLeido($event)" />
      </div>
    </div>
  `,
})
export class ApoderadoNotificacionesComponent implements OnInit {
  private readonly mensajeriaApi = inject(MensajeriaApiService);
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly notificaciones = signal<Notificacion[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    this.notificacionesService.paraApoderado().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((n) => {
      this.notificaciones.set(n);
      this.cargando.set(false);
    });
  }

  onMarcarLeido(mensajeId: number): void {
    this.mensajeriaApi.marcarLeido(mensajeId).subscribe({
      next: () => this.notificaciones.update((list) =>
        list.map((x) => (x.mensajeId === mensajeId ? { ...x, leido: true } : x))),
      error: () => {},
    });
  }
}
