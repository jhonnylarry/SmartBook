import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EstudianteApiService } from '../../../core/api/estudiante-api.service';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { UsuarioApiService } from '../../../core/api/usuario-api.service';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { AsignaturaDTO, CursoDTO } from '../../../core/models/academico.model';
import { PerfilPublico } from '../../../core/models/usuario.model';

type EstadoCarga = 'cargando' | 'ok' | 'error' | 'sin-ficha';

interface MateriaCard {
  id: number;
  nombre: string;
  usernameDocente: string;
}

/**
 * Lista las materias del estudiante autenticado.
 * Flujo: GET /estudiantes/me → matrícula VIGENTE → idCurso →
 *   forkJoin(curso, asignaturas) → perfiles de docentes → cards.
 */
@Component({
  selector: 'app-mis-materias',
  standalone: true,
  imports: [SkeletonComponent, RouterLink],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h1 class="page-title">Mis Materias</h1>
          @if (estado() === 'ok') {
            <p class="text-slate-500 text-sm mt-1">
              {{ cursoNombre() }}
              @if (jefeUsername()) {
                &mdash; Profesor jefe: <span class="font-medium text-slate-700">{{ jefeUsername() }}</span>
              }
            </p>
          } @else {
            <p class="text-slate-500 text-sm mt-1">Tus asignaturas del curso actual.</p>
          }
        </div>
        @if (estado() === 'ok') {
          <div class="flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-xl self-start sm:self-auto">
            <span class="text-2xl font-bold text-primary-900">{{ materias().length }}</span>
            <span class="text-sm text-primary-600 font-medium">materias</span>
          </div>
        }
      </div>

      <!-- Estado: cargando -->
      @if (estado() === 'cargando') {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1,2,3]; track i) {
            <app-skeleton variant="card" />
          }
        </div>
      }

      <!-- Estado: sin ficha (estudiante no encontrado en el servicio) -->
      @else if (estado() === 'sin-ficha') {
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
      }

      <!-- Estado: error genérico -->
      @else if (estado() === 'error') {
        <div class="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
          <p class="text-slate-600 font-medium">No se pudieron cargar tus materias.</p>
          <button (click)="cargar()" class="btn-secondary text-sm">Reintentar</button>
        </div>
      }

      <!-- Estado: ok — sin materias -->
      @else if (materias().length === 0) {
        <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
          <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg class="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p class="text-slate-600 font-medium">Sin materias asignadas</p>
            <p class="text-slate-400 text-sm mt-1">Tu curso aún no tiene asignaturas registradas.</p>
          </div>
        </div>
      }

      <!-- Estado: ok — grid de tarjetas -->
      @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (m of materias(); track m.id) {
            <div class="group card p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <!-- Cabecera de la materia -->
              <div class="flex items-start gap-3">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110"
                  style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">
                  <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-bold text-slate-900 truncate">{{ m.nombre }}</h3>
                  <p class="text-xs text-slate-500 mt-0.5">Profesor: {{ m.usernameDocente }}</p>
                </div>
              </div>

              <!-- Acciones -->
              <div class="flex items-center justify-end mt-auto">
                <a
                  [routerLink]="['/estudiante/materia', m.id, 'calendario']"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                         bg-slate-50 text-slate-600 border border-slate-200
                         hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200
                         transition-colors duration-150"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Ver calendario
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MisMateriasComponent implements OnInit {
  private readonly estudianteApi = inject(EstudianteApiService);
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly usuarioApi = inject(UsuarioApiService);

  readonly estado = signal<EstadoCarga>('cargando');
  readonly materias = signal<MateriaCard[]>([]);
  readonly cursoNombre = signal<string>('');
  readonly jefeUsername = signal<string>('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.estado.set('cargando');
    this.materias.set([]);

    this.estudianteApi.me().subscribe({
      next: (detalle) => {
        // Elegir matrícula VIGENTE; si no hay, tomar la primera
        const matricula =
          detalle.matriculas.find((m) => m.estado === 'VIGENTE') ??
          detalle.matriculas[0];

        if (!matricula) {
          // Sin matrícula → no tiene curso
          this.cursoNombre.set('Sin matrícula activa');
          this.estado.set('ok');
          return;
        }

        const idCurso = matricula.idCurso;

        forkJoin({
          curso: this.academicoApi.curso(idCurso).pipe(
            catchError(() => of(null as CursoDTO | null))
          ),
          asignaturas: this.academicoApi.asignaturasPorCurso(idCurso).pipe(
            catchError(() => of([] as AsignaturaDTO[]))
          ),
        }).subscribe(({ curso, asignaturas }) => {
          this.cursoNombre.set(curso?.nombre ?? `Curso #${idCurso}`);

          // Recopilar IDs de docentes únicos (asignaturas + jefe de curso)
          const docenteIds = new Set<number>(asignaturas.map((a) => a.idDocente));
          if (curso?.idDocenteJefe) docenteIds.add(curso.idDocenteJefe);

          const ids = [...docenteIds];
          if (ids.length === 0) {
            this.materias.set(asignaturas.map((a) => ({
              id: a.id,
              nombre: a.nombre,
              usernameDocente: `#${a.idDocente}`,
            })));
            this.estado.set('ok');
            return;
          }

          this.usuarioApi.perfiles(ids).pipe(
            catchError(() => of([] as PerfilPublico[]))
          ).subscribe((perfiles) => {
            const mapaPerfiles = new Map<number, string>(
              perfiles.map((p) => [p.id, p.username])
            );

            // Username del jefe de curso
            if (curso?.idDocenteJefe) {
              this.jefeUsername.set(
                mapaPerfiles.get(curso.idDocenteJefe) ?? `#${curso.idDocenteJefe}`
              );
            }

            const cards: MateriaCard[] = asignaturas.map((a) => ({
              id: a.id,
              nombre: a.nombre,
              usernameDocente: mapaPerfiles.get(a.idDocente) ?? `#${a.idDocente}`,
            }));

            this.materias.set(cards);
            this.estado.set('ok');
          });
        });
      },
      error: (err: unknown) => {
        // 404 = el usuario autenticado no tiene ficha de estudiante
        const status = (err as { status?: number }).status;
        if (status === 404) {
          this.estado.set('sin-ficha');
        } else {
          this.estado.set('error');
        }
      },
    });
  }
}
