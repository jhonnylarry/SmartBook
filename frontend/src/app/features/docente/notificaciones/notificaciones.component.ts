import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { MensajeriaApiService } from '../../../core/api/mensajeria-api.service';
import { NotificacionesService } from '../../../core/notificaciones/notificaciones.service';
import { AsignaturaDTO } from '../../../core/models/academico.model';
import { Notificacion } from '../../../core/notificaciones/notificacion.model';
import { NotificacionesPanelComponent } from '../../../shared/ui/notificaciones-panel/notificaciones-panel.component';

/** Pestaña "Notificaciones" del docente: próximos eventos de sus asignaturas y mensajes. */
@Component({
  selector: 'app-docente-notificaciones',
  standalone: true,
  imports: [NotificacionesPanelComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">
      <div>
        <h1 class="page-title">Notificaciones</h1>
        <p class="text-slate-500 text-sm mt-1">Eventos próximos de tus asignaturas y mensajes recibidos.</p>
      </div>
      <div class="flex-1 min-h-0">
        <app-notificaciones-panel [items]="notificaciones()" [loading]="cargando()" (marcarLeido)="onMarcarLeido($event)" />
      </div>
    </div>
  `,
})
export class DocenteNotificacionesComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly mensajeriaApi = inject(MensajeriaApiService);
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly notificaciones = signal<Notificacion[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    const idDocente = this.auth.currentUser()?.id;
    if (!idDocente) {
      this.cargando.set(false);
      return;
    }
    this.academicoApi.asignaturasMias().pipe(
      catchError(() => of([] as AsignaturaDTO[])),
      switchMap((asignaturas) => this.notificacionesService.paraDocente(asignaturas.map((a) => a.id))),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((n) => {
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
