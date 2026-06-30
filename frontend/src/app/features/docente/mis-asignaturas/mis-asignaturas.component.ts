import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { AsignaturaDTO, CursoDTO } from '../../../core/models/academico.model';

interface AsignaturaCard {
  id: number;
  nombre: string;
  idCurso: number;
  cursoNombre: string;
  cursoAnio: number | null;
}

/**
 * Listado de las asignaturas del docente autenticado (filtradas por idDocente).
 * Cada tarjeta lleva al detalle donde registra notas y sube documentos.
 */
@Component({
  selector: 'app-mis-asignaturas',
  standalone: true,
  imports: [SkeletonComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h1 class="page-title">Mis Asignaturas</h1>
          <p class="text-slate-500 text-sm mt-1">Registra notas y sube documentos de tus asignaturas.</p>
        </div>
        @if (!loading() && !error()) {
          <div class="flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-xl self-start sm:self-auto">
            <span class="text-2xl font-bold text-primary-900">{{ asignaturas().length }}</span>
            <span class="text-sm text-primary-600 font-medium">asignaturas</span>
          </div>
        }
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1,2,3]; track i) {
            <app-skeleton variant="card" />
          }
        </div>
      } @else if (error()) {
        <div class="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
          <p class="text-slate-600 font-medium">No se pudieron cargar tus asignaturas.</p>
          <button (click)="cargar()" class="btn-secondary text-sm">Reintentar</button>
        </div>
      } @else if (asignaturas().length === 0) {
        <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
          <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg class="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p class="text-slate-600 font-medium">No tienes asignaturas asignadas</p>
            <p class="text-slate-400 text-sm mt-1">Cuando el Director te asigne una asignatura, aparecerá aquí.</p>
          </div>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (a of asignaturas(); track a.id) {
            <div class="group text-left card p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <!-- Área principal → navega al detalle -->
              <button
                type="button"
                (click)="abrir(a)"
                class="flex items-start gap-3 w-full text-left"
              >
                <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110"
                  style="background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);">
                  <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-bold text-slate-900 truncate">{{ a.nombre }}</h3>
                  <p class="text-xs text-slate-500 mt-0.5">{{ a.cursoNombre }}@if (a.cursoAnio) { · {{ a.cursoAnio }} }</p>
                </div>
              </button>
              <!-- Barra inferior: label + botón Calendario -->
              <div class="flex items-center justify-between text-xs text-slate-400 mt-auto">
                <span>Notas y documentos</span>
                <button
                  type="button"
                  (click)="abrirCalendario($event, a)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                         bg-slate-50 text-slate-600 border border-slate-200
                         hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200
                         transition-colors duration-150"
                  title="Ver calendario de la asignatura"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Calendario
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MisAsignaturasComponent implements OnInit {
  private readonly api = inject(AcademicoApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly asignaturas = signal<AsignaturaCard[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const idDocente = this.auth.currentUser()?.id;
    if (!idDocente) {
      this.error.set(true);
      return;
    }
    this.loading.set(true);
    this.error.set(false);

    forkJoin({
      asignaturas: this.api.asignaturasMias().pipe(catchError(() => of(null))),
      cursos: this.api.cursos().pipe(catchError(() => of([] as CursoDTO[]))),
    }).subscribe(({ asignaturas, cursos }) => {
      if (asignaturas === null) {
        this.error.set(true);
        this.loading.set(false);
        return;
      }
      const cursoPorId = new Map<number, CursoDTO>(cursos.map((c) => [c.id, c]));
      const cards: AsignaturaCard[] = asignaturas.map((a: AsignaturaDTO) => {
        const curso = cursoPorId.get(a.idCurso);
        return {
          id: a.id,
          nombre: a.nombre,
          idCurso: a.idCurso,
          cursoNombre: curso?.nombre ?? `Curso #${a.idCurso}`,
          cursoAnio: curso?.anio ?? null,
        };
      });
      this.asignaturas.set(cards);
      this.loading.set(false);
    });
  }

  abrir(a: AsignaturaCard): void {
    this.router.navigate(['/docente/asignatura', a.id]);
  }

  abrirCalendario(event: Event, a: AsignaturaCard): void {
    event.stopPropagation();
    this.router.navigate(['/docente/asignatura', a.id, 'calendario']);
  }
}
