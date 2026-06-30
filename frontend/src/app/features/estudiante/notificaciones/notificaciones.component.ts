import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { EstudianteApiService } from '../../../core/api/estudiante-api.service';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { MensajeriaApiService } from '../../../core/api/mensajeria-api.service';
import { NotificacionesService } from '../../../core/notificaciones/notificaciones.service';
import { AsignaturaDTO } from '../../../core/models/academico.model';
import { Notificacion } from '../../../core/notificaciones/notificacion.model';
import { NotificacionesPanelComponent } from '../../../shared/ui/notificaciones-panel/notificaciones-panel.component';

/** Pestaña "Notificaciones" del estudiante: eventos, mensajes y avisos académicos. */
@Component({
  selector: 'app-estudiante-notificaciones',
  standalone: true,
  imports: [NotificacionesPanelComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">
      <div>
        <h1 class="page-title">Notificaciones</h1>
        <p class="text-slate-500 text-sm mt-1">Eventos próximos, mensajes y avisos de tu boletín.</p>
      </div>
      <div class="flex-1 min-h-0">
        <app-notificaciones-panel [items]="notificaciones()" [loading]="cargando()" (marcarLeido)="onMarcarLeido($event)" />
      </div>
    </div>
  `,
})
export class EstudianteNotificacionesComponent implements OnInit {
  private readonly estudianteApi = inject(EstudianteApiService);
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly mensajeriaApi = inject(MensajeriaApiService);
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly notificaciones = signal<Notificacion[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    this.estudianteApi.me().pipe(
      switchMap((detalle) => {
        const matricula = detalle.matriculas.find((m) => m.estado === 'VIGENTE') ?? detalle.matriculas[0];
        if (!matricula) return this.notificacionesService.paraEstudiante([]);
        return this.academicoApi.asignaturasPorCurso(matricula.idCurso).pipe(
          catchError(() => of([] as AsignaturaDTO[])),
          switchMap((asignaturas) => this.notificacionesService.paraEstudiante(asignaturas.map((a) => a.id))),
        );
      }),
      catchError(() => of([] as Notificacion[])),
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
