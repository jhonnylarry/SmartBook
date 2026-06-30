import { Component, OnInit, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { EstudianteApiService } from '../../../core/api/estudiante-api.service';
import { HorarioApiService } from '../../../core/api/horario-api.service';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { NotificacionesService } from '../../../core/notificaciones/notificaciones.service';
import { BloqueHorarioDto, DiaSemana, DIA_LABEL } from '../../../core/models/horario.model';
import { AsignaturaDTO } from '../../../core/models/academico.model';
import { Notificacion } from '../../../core/notificaciones/notificacion.model';
import { proximaClase } from '../../../shared/util/proxima-clase';

/** Inicio del Estudiante: resumen de bienvenida (próxima clase + últimos avisos). */
@Component({
  selector: 'app-estudiante-inicio',
  standalone: true,
  imports: [RouterLink],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- Saludo -->
      <div class="shrink-0">
        <h1 class="page-title">Hola, {{ auth.currentUser()?.username }}</h1>
        <p class="text-slate-500 text-sm mt-1">
          @if (cursoNombre()) { {{ cursoNombre() }} — } Un vistazo a tu día.
        </p>
      </div>

      @if (sinFicha()) {
        <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
          <div class="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
            <svg class="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p class="text-slate-700 font-semibold">No se encontró tu ficha de estudiante</p>
            <p class="text-slate-400 text-sm mt-1">Contacta con el colegio para que registren tus datos.</p>
          </div>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <!-- Próxima clase -->
          <section class="card p-5 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-slate-900">Próxima clase</h2>
              <a routerLink="/estudiante/horario" class="text-sm font-medium text-primary-700 hover:underline">Ver horario</a>
            </div>
            @if (cargandoHorario()) {
              <p class="text-sm text-slate-400">Cargando…</p>
            } @else {
              @if (proxima(); as c) {
                <div class="flex items-center gap-3.5">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">
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
              <a routerLink="/estudiante/notificaciones" class="text-sm font-medium text-primary-700 hover:underline">Ver todas</a>
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
      }
    </div>
  `,
})
export class EstudianteInicioComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly estudianteApi = inject(EstudianteApiService);
  private readonly horarioApi = inject(HorarioApiService);
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly bloques = signal<BloqueHorarioDto[]>([]);
  readonly notificaciones = signal<Notificacion[]>([]);
  readonly cursoNombre = signal<string>('');
  readonly cargandoHorario = signal(true);
  readonly cargandoNotifs = signal(true);
  readonly sinFicha = signal(false);

  readonly proxima = computed(() => proximaClase(this.bloques()));
  readonly resumenAvisos = computed(() => this.notificaciones().slice(0, 4));

  ngOnInit(): void {
    this.estudianteApi
      .me()
      .pipe(
        switchMap((detalle) => {
          const matricula = detalle.matriculas.find((m) => m.estado === 'VIGENTE') ?? detalle.matriculas[0];
          if (!matricula) {
            this.cargandoHorario.set(false);
            this.cargandoNotifs.set(false);
            return of([] as Notificacion[]);
          }
          const idCurso = matricula.idCurso;

          return forkJoin({
            horario: this.horarioApi.porCurso(idCurso).pipe(catchError(() => of([] as BloqueHorarioDto[]))),
            asignaturas: this.academicoApi.asignaturasPorCurso(idCurso).pipe(catchError(() => of([] as AsignaturaDTO[]))),
            curso: this.academicoApi.curso(idCurso).pipe(catchError(() => of(null))),
          }).pipe(
            tap(({ horario, curso }) => {
              this.bloques.set(horario);
              this.cursoNombre.set(curso?.nombre ?? '');
              this.cargandoHorario.set(false);
            }),
            switchMap(({ asignaturas }) => this.notificacionesService.paraEstudiante(asignaturas.map((a) => a.id))),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (n) => {
          this.notificaciones.set(n);
          this.cargandoNotifs.set(false);
        },
        error: (err: unknown) => {
          const status = (err as { status?: number }).status;
          this.cargandoHorario.set(false);
          this.cargandoNotifs.set(false);
          if (status === 404) this.sinFicha.set(true);
        },
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
