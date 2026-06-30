import { Component, OnInit, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { ApoderadoApiService } from '../../../core/api/apoderado-api.service';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { NotificacionesService } from '../../../core/notificaciones/notificaciones.service';
import { PupiloDto } from '../../../core/models/apoderado.model';
import { CursoDTO } from '../../../core/models/academico.model';
import { Notificacion } from '../../../core/notificaciones/notificacion.model';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-apoderado-inicio',
  standalone: true,
  imports: [RouterLink, SkeletonComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">
      <div>
        <h1 class="page-title">Hola, {{ auth.currentUser()?.username }}</h1>
        <p class="text-slate-500 text-sm mt-1">Revisa la información académica de tus pupilos.</p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-5 flex-1 min-h-0">
        <!-- Pupilos -->
        <section class="xl:col-span-2 flex flex-col gap-3 min-h-0">
          <h2 class="font-bold text-slate-900">Mis pupilos</h2>
          @if (cargandoPupilos()) {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              @for (i of [1,2]; track i) { <app-skeleton variant="card" /> }
            </div>
          } @else if (pupilos().length === 0) {
            <div class="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12 card">
              <p class="text-slate-600 font-medium">No tienes pupilos asociados</p>
              <p class="text-slate-400 text-sm">Si crees que es un error, contacta con el colegio.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              @for (p of pupilos(); track p.idEstudiante) {
                <button type="button" (click)="abrir(p)"
                  class="group card p-5 text-left flex items-start gap-3.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-bold shadow-sm transition-transform duration-200 group-hover:scale-110"
                    style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">
                    {{ iniciales(p) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="font-bold text-slate-900 truncate">{{ p.nombreEstudiante }} {{ p.apellidoEstudiante }}</h3>
                    <p class="text-xs text-slate-500 mt-0.5">{{ cursoNombre(p.idCurso) }}</p>
                    <div class="flex items-center gap-2 mt-2">
                      <span class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                        [class]="p.tipo === 'TITULAR' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">
                        {{ p.tipo === 'TITULAR' ? 'Apoderado titular' : 'Tutor' }}
                      </span>
                      @if (p.parentesco) { <span class="text-[11px] text-slate-400">{{ p.parentesco }}</span> }
                    </div>
                  </div>
                  <svg class="w-4 h-4 text-slate-300 self-center group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              }
            </div>
          }
        </section>

        <!-- Últimos avisos -->
        <aside class="xl:col-span-1 min-h-0">
          <section class="card p-5 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-slate-900">Últimos avisos</h2>
              <a routerLink="/apoderado/notificaciones" class="text-sm font-medium text-primary-700 hover:underline">Ver todas</a>
            </div>
            @if (cargandoNotifs()) {
              <p class="text-sm text-slate-400">Cargando…</p>
            } @else if (resumenAvisos().length === 0) {
              <p class="text-sm text-slate-400">Sin avisos recientes.</p>
            } @else {
              <ul class="flex flex-col divide-y divide-slate-100">
                @for (n of resumenAvisos(); track $index) {
                  <li class="py-2.5 flex items-start gap-2.5">
                    <span class="mt-1.5 w-2 h-2 rounded-full shrink-0" [class]="n.leido ? 'bg-slate-200' : 'bg-accent-500'"></span>
                    <div class="min-w-0">
                      <p class="text-sm text-slate-800 truncate">{{ n.titulo }}</p>
                      @if (n.subtitulo) { <p class="text-xs text-slate-400 truncate">{{ n.subtitulo }}</p> }
                    </div>
                  </li>
                }
              </ul>
            }
          </section>
        </aside>
      </div>
    </div>
  `,
})
export class ApoderadoInicioComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly apoderadoApi = inject(ApoderadoApiService);
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly pupilos = signal<PupiloDto[]>([]);
  readonly notificaciones = signal<Notificacion[]>([]);
  readonly cargandoPupilos = signal(true);
  readonly cargandoNotifs = signal(true);
  private readonly cursos = signal<Map<number, string>>(new Map());

  readonly resumenAvisos = computed(() => this.notificaciones().slice(0, 5));

  ngOnInit(): void {
    this.apoderadoApi.misPupilos().pipe(
      catchError(() => of([] as PupiloDto[])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((pupilos) => {
      this.pupilos.set(pupilos);
      this.cargandoPupilos.set(false);
      this.cargarCursos(pupilos);
    });

    this.notificacionesService.paraApoderado().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((n) => {
      this.notificaciones.set(n);
      this.cargandoNotifs.set(false);
    });
  }

  private cargarCursos(pupilos: PupiloDto[]): void {
    const ids = [...new Set(pupilos.map((p) => p.idCurso).filter((id): id is number => id != null))];
    if (ids.length === 0) return;
    forkJoin(ids.map((id) => this.academicoApi.curso(id).pipe(catchError(() => of(null)))))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cursos) => {
        const m = new Map<number, string>();
        cursos.forEach((c: CursoDTO | null) => { if (c) m.set(c.id, c.nombre); });
        this.cursos.set(m);
      });
  }

  cursoNombre(idCurso: number | null): string {
    if (idCurso == null) return 'Sin curso';
    return this.cursos().get(idCurso) ?? `Curso #${idCurso}`;
  }

  iniciales(p: PupiloDto): string {
    return `${p.nombreEstudiante?.charAt(0) ?? ''}${p.apellidoEstudiante?.charAt(0) ?? ''}`.toUpperCase();
  }

  abrir(p: PupiloDto): void {
    this.router.navigate(['/apoderado/pupilo', p.idEstudiante]);
  }
}
