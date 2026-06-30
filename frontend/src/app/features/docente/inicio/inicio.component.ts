import { Component, OnInit, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { HorarioApiService } from '../../../core/api/horario-api.service';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { NotificacionesService } from '../../../core/notificaciones/notificaciones.service';
import { BloqueHorarioDto, DiaSemana, DIA_LABEL } from '../../../core/models/horario.model';
import { AsignaturaDTO } from '../../../core/models/academico.model';
import { Notificacion } from '../../../core/notificaciones/notificacion.model';
import { proximaClase } from '../../../shared/util/proxima-clase';

/** Inicio del Docente: resumen de bienvenida (próxima clase + últimos avisos). */
@Component({
  selector: 'app-docente-inicio',
  standalone: true,
  imports: [RouterLink],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- Saludo -->
      <div class="shrink-0">
        <h1 class="page-title">Hola, {{ auth.currentUser()?.username }}</h1>
        <p class="text-slate-500 text-sm mt-1">Un vistazo a tu día.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <!-- Próxima clase -->
        <section class="card p-5 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h2 class="font-bold text-slate-900">Próxima clase</h2>
            <a routerLink="/docente/horario" class="text-sm font-medium text-primary-700 hover:underline">Ver horario</a>
          </div>
          @if (cargandoHorario()) {
            <p class="text-sm text-slate-400">Cargando…</p>
          } @else {
            @if (proxima(); as c) {
              <div class="flex items-center gap-3.5">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style="background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);">
                  <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-slate-900 truncate">{{ c.nombreAsignatura }}</p>
                  <p class="text-sm text-slate-500">
                    {{ diaLabel(c.diaSemana) }} · {{ c.horaInicio }}–{{ c.horaFin }}{{ c.sala ? ' · Sala ' + c.sala : '' }}
                  </p>
                </div>
              </div>
            } @else {
              <p class="text-sm text-slate-400">No tienes clases en tu horario.</p>
            }
          }
        </section>

        <!-- Últimos avisos -->
        <section class="card p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h2 class="font-bold text-slate-900">Últimos avisos</h2>
            <a routerLink="/docente/notificaciones" class="text-sm font-medium text-primary-700 hover:underline">Ver todas</a>
          </div>
          @if (cargandoNotifs()) {
            <p class="text-sm text-slate-400">Cargando…</p>
          } @else if (resumenAvisos().length === 0) {
            <p class="text-sm text-slate-400">Sin avisos recientes.</p>
          } @else {
            <ul class="flex flex-col divide-y divide-slate-100">
              @for (n of resumenAvisos(); track $index) {
                <li class="py-2.5 flex items-start gap-2.5">
                  <span class="mt-1.5 w-2 h-2 rounded-full shrink-0" [class]="punto(n)"></span>
                  <div class="min-w-0">
                    <p class="text-sm text-slate-800 truncate">{{ n.titulo }}</p>
                    @if (n.subtitulo) { <p class="text-xs text-slate-400 truncate">{{ n.subtitulo }}</p> }
                  </div>
                </li>
              }
            </ul>
          }
        </section>
      </div>
    </div>
  `,
})
export class DocenteInicioComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly horarioApi = inject(HorarioApiService);
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly bloques = signal<BloqueHorarioDto[]>([]);
  readonly notificaciones = signal<Notificacion[]>([]);
  readonly cargandoHorario = signal(true);
  readonly cargandoNotifs = signal(true);

  readonly proxima = computed(() => proximaClase(this.bloques()));
  readonly resumenAvisos = computed(() => this.notificaciones().slice(0, 4));

  ngOnInit(): void {
    const idDocente = this.auth.currentUser()?.id;
    if (!idDocente) {
      this.cargandoHorario.set(false);
      this.cargandoNotifs.set(false);
      return;
    }

    forkJoin({
      horario: this.horarioApi.porDocente(idDocente).pipe(catchError(() => of([] as BloqueHorarioDto[]))),
      asignaturas: this.academicoApi.asignaturasMias().pipe(catchError(() => of([] as AsignaturaDTO[]))),
    })
      .pipe(
        tap(({ horario }) => {
          this.bloques.set(horario);
          this.cargandoHorario.set(false);
        }),
        switchMap(({ asignaturas }) => this.notificacionesService.paraDocente(asignaturas.map((a) => a.id))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((n) => {
        this.notificaciones.set(n);
        this.cargandoNotifs.set(false);
      });
  }

  diaLabel(d: DiaSemana): string {
    return DIA_LABEL[d];
  }

  punto(n: Notificacion): string {
    switch (n.tipo) {
      case 'evento': return 'bg-sky-400';
      case 'nota': return 'bg-emerald-400';
      case 'anotacion': return 'bg-amber-400';
      default: return n.leido ? 'bg-slate-200' : 'bg-accent-500';
    }
  }
}
