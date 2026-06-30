import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EstudianteApiService } from '../../../core/api/estudiante-api.service';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { CalendarioApiService } from '../../../core/api/calendario-api.service';
import { UsuarioApiService } from '../../../core/api/usuario-api.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

import { EstudianteDetalleDTO, Matricula } from '../../../core/models/estudiante.model';
import {
  CursoDTO,
  AsignaturaDTO,
  EvaluacionDTO,
  NotaDTO,
} from '../../../core/models/academico.model';
import { EventoDto, TipoEvento } from '../../../core/models/calendario.model';
import { Usuario } from '../../../core/models/usuario.model';

// ── Interfaces locales ──────────────────────────────────────────────────────

interface FilaEvaluacion {
  evaluacion: EvaluacionDTO;
  nota: number | null; // calificacion o null si no hay nota
}

interface AsignaturaConNotas {
  asignatura: AsignaturaDTO;
  nombreDocente: string;
  filas: FilaEvaluacion[];
  promedioPonderado: number | null; // null si ninguna evaluacion tiene nota
}

interface ItemAgenda {
  fechaISO: string;        // YYYY-MM-DD (para ordenar)
  fechaDisplay: string;    // texto formateado para mostrar
  titulo: string;
  tipo: TipoEvento | 'CLASE' | 'REUNION' | 'EVALUACION' | 'FERIADO' | 'OTRO';
  esPasado: boolean;
}

type EstadoCarga = 'inicial' | 'cargando' | 'ok' | 'error';

// ────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-ficha-academica',
  standalone: true,
  imports: [SkeletonComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- ── Barra de navegación ─────────────────────────────────────────── -->
      <div class="flex items-center gap-3">
        <button
          (click)="volver()"
          class="shrink-0 p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Volver al listado de estudiantes"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div class="min-w-0">
          <h1 class="page-title truncate">Ficha Academica del Estudiante</h1>
          <p class="text-slate-500 text-sm mt-0.5">Vista de solo lectura</p>
        </div>
      </div>

      <!-- ── Estado: cargando ────────────────────────────────────────────── -->
      @if (estado() === 'cargando') {
        <div class="flex flex-col gap-5">
          <!-- Skeleton cabecera -->
          <div class="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div class="flex-1 space-y-3">
              <div class="skeleton rounded-lg h-6 w-56"></div>
              <div class="skeleton rounded-lg h-4 w-32"></div>
            </div>
            <div class="skeleton rounded-full h-8 w-24"></div>
          </div>
          <!-- Skeleton secciones -->
          @for (i of [1, 2, 3]; track i) {
            <app-skeleton variant="card" />
          }
        </div>
      }

      <!-- ── Estado: error ───────────────────────────────────────────────── -->
      @if (estado() === 'error') {
        <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
          <div class="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <svg class="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p class="text-slate-700 font-semibold">No se pudo cargar la ficha</p>
            <p class="text-slate-400 text-sm mt-1">Verifica que el estudiante exista e intenta de nuevo.</p>
          </div>
          <button (click)="cargar()" class="btn-secondary text-sm">Reintentar</button>
        </div>
      }

      <!-- ── Contenido principal ─────────────────────────────────────────── -->
      @if (estado() === 'ok') {

        <!-- CABECERA del estudiante -->
        <div class="card p-5 flex flex-col sm:flex-row sm:items-start gap-4">
          <!-- Avatar inicial -->
          <div class="shrink-0 w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl select-none">
            {{ iniciales() }}
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-xl font-bold text-slate-800 leading-tight">
              {{ detalle()?.nombre }} {{ detalle()?.apellido }}
            </h2>
            <p class="text-slate-500 text-sm mt-0.5">
              RUT: <span class="font-medium text-slate-700">{{ detalle()?.rut }}</span>
            </p>
            <p class="text-slate-500 text-sm">
              Fecha de nacimiento:
              <span class="font-medium text-slate-700">{{ formatFecha(detalle()?.fechaNacimiento ?? '') }}</span>
            </p>
          </div>
          <!-- Chip de curso -->
          <div class="shrink-0">
            @if (curso()) {
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-primary-50 text-primary-800 border border-primary-200">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>
                {{ curso()!.nombre }} &mdash; {{ curso()!.anio }}
              </span>
            } @else {
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-500 border border-slate-200">
                Sin curso asignado
              </span>
            }
          </div>
        </div>

        <!-- AVISO: sin curso → ocultar secciones académicas -->
        @if (!curso()) {
          <div class="card p-5 border-l-4 border-amber-400 bg-amber-50">
            <p class="text-amber-800 font-medium text-sm">
              Este estudiante no tiene una matricula vigente.
              Las secciones de asignaturas, notas y evaluaciones no estan disponibles.
            </p>
          </div>
        }

        <!-- Secciones academicas (solo si tiene curso) -->
        @if (curso()) {

          <!-- ── PROMEDIO GENERAL ─────────────────────────────────────────── -->
          @if (promedioGeneral() !== null) {
            <div class="card p-5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div class="flex-1">
                <h3 class="section-title mb-0.5">Promedio General</h3>
                <p class="text-slate-500 text-sm">Promedio de todos los promedios por asignatura con nota</p>
              </div>
              <div
                class="shrink-0 text-3xl font-black tabular-nums"
                [class]="clasePromedio(promedioGeneral())"
              >
                {{ promedioGeneral()!.toFixed(1) }}
              </div>
            </div>
          }

          <!-- ── ASIGNATURAS HEREDADAS DEL CURSO ────────────────────────── -->
          <section aria-labelledby="titulo-asignaturas">
            <h2 id="titulo-asignaturas" class="section-title mb-3">
              Asignaturas del curso
            </h2>

            @if (asignaturasConNotas().length === 0) {
              <div class="card p-8 flex flex-col items-center justify-center gap-3 text-center">
                <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <p class="text-slate-600 font-medium">Sin asignaturas</p>
                <p class="text-slate-400 text-sm">El curso no tiene asignaturas registradas aun.</p>
              </div>
            } @else {
              <!-- Grid de tarjetas de asignatura -->
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                @for (item of asignaturasConNotas(); track item.asignatura.id) {
                  <div class="card p-4 flex flex-col gap-1">
                    <span class="font-semibold text-slate-800 text-sm leading-tight">
                      {{ item.asignatura.nombre }}
                    </span>
                    <span class="text-xs text-slate-500">
                      Docente: {{ item.nombreDocente }}
                    </span>
                  </div>
                }
              </div>
            }
          </section>

          <!-- ── NOTAS POR ASIGNATURA ───────────────────────────────────── -->
          @if (asignaturasConNotas().length > 0) {
            <section aria-labelledby="titulo-notas">
              <h2 id="titulo-notas" class="section-title mb-3">
                Notas por asignatura
              </h2>

              <div class="flex flex-col gap-4">
                @for (item of asignaturasConNotas(); track item.asignatura.id) {
                  <div class="card overflow-hidden">
                    <!-- Cabecera de la asignatura -->
                    <div class="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <div>
                        <span class="font-semibold text-slate-800 text-sm">{{ item.asignatura.nombre }}</span>
                        <span class="text-xs text-slate-500 ml-2">{{ item.nombreDocente }}</span>
                      </div>
                      <!-- Promedio de la asignatura -->
                      @if (item.promedioPonderado !== null) {
                        <div class="flex items-center gap-1.5">
                          <span class="text-xs text-slate-500 font-medium">Promedio:</span>
                          <span
                            class="text-sm font-black tabular-nums"
                            [class]="clasePromedio(item.promedioPonderado)"
                          >
                            {{ item.promedioPonderado.toFixed(1) }}
                          </span>
                        </div>
                      } @else {
                        <span class="text-xs text-slate-400 italic">Sin notas</span>
                      }
                    </div>

                    <!-- Tabla de evaluaciones -->
                    @if (item.filas.length === 0) {
                      <div class="px-4 py-6 text-center text-slate-400 text-sm">
                        No hay evaluaciones registradas para esta asignatura.
                      </div>
                    } @else {
                      <div class="overflow-x-auto">
                        <table class="w-full text-sm border-collapse">
                          <thead>
                            <tr class="border-b border-slate-100">
                              <th class="text-left py-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Evaluacion</th>
                              <th class="text-left py-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                              <th class="text-center py-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ponder.</th>
                              <th class="text-center py-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nota</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (fila of item.filas; track fila.evaluacion.id) {
                              <tr class="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                                <td class="py-2.5 px-4 font-medium text-slate-700">{{ fila.evaluacion.nombre }}</td>
                                <td class="py-2.5 px-4 text-slate-500 text-xs">{{ formatFecha(fila.evaluacion.fecha) }}</td>
                                <td class="py-2.5 px-4 text-center">
                                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                    {{ fila.evaluacion.ponderacion }}%
                                  </span>
                                </td>
                                <td class="py-2.5 px-4 text-center">
                                  @if (fila.nota !== null) {
                                    <span
                                      class="font-bold tabular-nums text-sm"
                                      [class]="claseNota(fila.nota)"
                                    >
                                      {{ fila.nota.toFixed(1) }}
                                    </span>
                                  } @else {
                                    <span class="text-slate-300 text-sm font-medium">—</span>
                                  }
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    }
                  </div>
                }
              </div>
            </section>
          }
        }

        <!-- ── AGENDA / CALENDARIO ───────────────────────────────────────── -->
        <section aria-labelledby="titulo-agenda">
          <h2 id="titulo-agenda" class="section-title mb-3">
            Agenda
          </h2>

          @if (agendaProximos().length === 0 && agendaPasados().length === 0) {
            <div class="card p-8 flex flex-col items-center justify-center gap-3 text-center">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
              <p class="text-slate-600 font-medium">Sin eventos</p>
              <p class="text-slate-400 text-sm">No hay eventos ni evaluaciones en el calendario.</p>
            </div>
          } @else {
            <div class="flex flex-col gap-6">

              <!-- Proximos -->
              @if (agendaProximos().length > 0) {
                <div>
                  <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 px-1">Proximos</h3>
                  <div class="flex flex-col gap-2">
                    @for (item of agendaProximos(); track item.fechaISO + item.titulo) {
                      <div class="card px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                        <div class="shrink-0 text-xs font-semibold text-slate-500 w-24">
                          {{ item.fechaDisplay }}
                        </div>
                        <div class="flex-1 text-sm font-medium text-slate-800 leading-snug">
                          {{ item.titulo }}
                        </div>
                        <div class="shrink-0">
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border"
                            [class]="claseBadgeTipo(item.tipo)">
                            {{ item.tipo }}
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Pasados -->
              @if (agendaPasados().length > 0) {
                <div>
                  <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Pasados</h3>
                  <div class="flex flex-col gap-2">
                    @for (item of agendaPasados(); track item.fechaISO + item.titulo) {
                      <div class="card px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 opacity-60">
                        <div class="shrink-0 text-xs font-semibold text-slate-500 w-24">
                          {{ item.fechaDisplay }}
                        </div>
                        <div class="flex-1 text-sm font-medium text-slate-600 leading-snug line-through decoration-slate-300">
                          {{ item.titulo }}
                        </div>
                        <div class="shrink-0">
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border"
                            [class]="claseBadgeTipo(item.tipo)">
                            {{ item.tipo }}
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

            </div>
          }
        </section>

      }
    </div>
  `,
})
export class FichaAcademicaComponent implements OnInit {
  private readonly estudianteApi = inject(EstudianteApiService);
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly calendarioApi = inject(CalendarioApiService);
  private readonly usuarioApi = inject(UsuarioApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  // ── Estado de carga ────────────────────────────────────────────────────────
  readonly estado = signal<EstadoCarga>('inicial');

  // ── Datos cargados ─────────────────────────────────────────────────────────
  readonly detalle = signal<EstudianteDetalleDTO | null>(null);
  readonly curso = signal<CursoDTO | null>(null);
  readonly asignaturasConNotas = signal<AsignaturaConNotas[]>([]);
  readonly agendaCompleta = signal<ItemAgenda[]>([]);

  // ── Derived ────────────────────────────────────────────────────────────────
  readonly iniciales = computed<string>(() => {
    const d = this.detalle();
    if (!d) return '?';
    const n = d.nombre.charAt(0).toUpperCase();
    const a = d.apellido.charAt(0).toUpperCase();
    return `${n}${a}`;
  });

  readonly promedioGeneral = computed<number | null>(() => {
    const items = this.asignaturasConNotas();
    const conNota = items.filter((i) => i.promedioPonderado !== null);
    if (conNota.length === 0) return null;
    const suma = conNota.reduce((acc, i) => acc + (i.promedioPonderado as number), 0);
    return Math.round((suma / conNota.length) * 10) / 10;
  });

  readonly agendaProximos = computed<ItemAgenda[]>(() =>
    this.agendaCompleta().filter((i) => !i.esPasado)
  );

  readonly agendaPasados = computed<ItemAgenda[]>(() =>
    this.agendaCompleta().filter((i) => i.esPasado)
  );

  private idEstudiante = 0;

  // ────────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.idEstudiante = idParam ? parseInt(idParam, 10) : 0;
    if (this.idEstudiante > 0) {
      this.cargar();
    } else {
      this.estado.set('error');
      this.toast.error('ID de estudiante no valido.');
    }
  }

  cargar(): void {
    this.estado.set('cargando');

    // Paso 1: obtener el detalle del estudiante
    this.estudianteApi.obtener(this.idEstudiante).subscribe({
      next: (d: EstudianteDetalleDTO) => {
        this.detalle.set(d);
        this.cargarDatosAcademicos(d);
      },
      error: () => {
        this.estado.set('error');
        this.toast.error('No se pudo cargar el estudiante.');
      },
    });
  }

  private cargarDatosAcademicos(detalle: EstudianteDetalleDTO): void {
    // Determinar matricula activa
    const matriculaVigente: Matricula | undefined =
      detalle.matriculas.find((m) => m.estado === 'VIGENTE') ?? detalle.matriculas[0];

    if (!matriculaVigente) {
      // Sin curso: solo cargamos eventos del calendario
      this.cargarCalendarioSinCurso();
      return;
    }

    const idCurso = matriculaVigente.idCurso;

    // Paso 2: carga paralela — curso, asignaturas, notas, eventos, docentes
    forkJoin({
      curso: this.academicoApi.curso(idCurso).pipe(
        catchError(() => of(null as CursoDTO | null))
      ),
      asignaturas: this.academicoApi.asignaturasPorCurso(idCurso).pipe(
        catchError(() => of([] as AsignaturaDTO[]))
      ),
      notas: this.academicoApi.notasPorEstudiante(this.idEstudiante).pipe(
        catchError(() => of([] as NotaDTO[]))
      ),
      eventos: this.calendarioApi.listar().pipe(
        catchError(() => of([] as EventoDto[]))
      ),
      docentes: this.usuarioApi.listar().pipe(
        catchError(() => of([] as Usuario[]))
      ),
    }).subscribe({
      next: ({ curso, asignaturas, notas, eventos, docentes }) => {
        this.curso.set(curso);
        this.cargarEvaluaciones(asignaturas, notas, docentes, eventos);
      },
      error: () => {
        this.estado.set('error');
        this.toast.error('Error al cargar datos academicos.');
      },
    });
  }

  private cargarCalendarioSinCurso(): void {
    this.calendarioApi.listar().pipe(
      catchError(() => of([] as EventoDto[]))
    ).subscribe({
      next: (eventos: EventoDto[]) => {
        this.agendaCompleta.set(this.construirAgenda(eventos, []));
        this.estado.set('ok');
      },
      error: () => {
        this.estado.set('ok'); // mostramos lo que tenemos aunque falle el calendario
      },
    });
  }

  private cargarEvaluaciones(
    asignaturas: AsignaturaDTO[],
    notas: NotaDTO[],
    docentes: Usuario[],
    eventos: EventoDto[]
  ): void {
    if (asignaturas.length === 0) {
      // Sin asignaturas: agenda + estado ok
      this.asignaturasConNotas.set([]);
      this.agendaCompleta.set(this.construirAgenda(eventos, []));
      this.estado.set('ok');
      return;
    }

    // Paso 3: evaluaciones por cada asignatura (en paralelo)
    const requests = asignaturas.map((a: AsignaturaDTO) =>
      this.academicoApi.evaluacionesPorAsignatura(a.id).pipe(
        catchError(() => of([] as EvaluacionDTO[]))
      )
    );

    forkJoin(requests).subscribe({
      next: (evaluacionesPorAsig: EvaluacionDTO[][]) => {
        // Mapa idEvaluacion → calificacion
        const mapaNotas = new Map<number, number>();
        for (const n of notas) {
          mapaNotas.set(n.idEvaluacion, n.calificacion);
        }

        // Mapa idUsuario → username (nombre del docente)
        const mapaDocentes = new Map<number, string>();
        for (const u of docentes) {
          mapaDocentes.set(u.id, u.username);
        }

        // Construir AsignaturaConNotas
        const items: AsignaturaConNotas[] = asignaturas.map(
          (asig: AsignaturaDTO, idx: number) => {
            const evals = evaluacionesPorAsig[idx] ?? [];
            const filas: FilaEvaluacion[] = evals.map((ev: EvaluacionDTO) => ({
              evaluacion: ev,
              nota: mapaNotas.has(ev.id) ? (mapaNotas.get(ev.id) as number) : null,
            }));

            // Promedio ponderado sobre evaluaciones con nota
            const conNota = filas.filter((f) => f.nota !== null);
            let promedioPonderado: number | null = null;
            if (conNota.length > 0) {
              const sumaPond = conNota.reduce(
                (acc, f) => acc + f.evaluacion.ponderacion, 0
              );
              if (sumaPond > 0) {
                const sumaNotaPond = conNota.reduce(
                  (acc, f) => acc + (f.nota as number) * f.evaluacion.ponderacion,
                  0
                );
                promedioPonderado = Math.round((sumaNotaPond / sumaPond) * 10) / 10;
              }
            }

            return {
              asignatura: asig,
              nombreDocente: mapaDocentes.get(asig.idDocente) ?? `#${asig.idDocente}`,
              filas,
              promedioPonderado,
            };
          }
        );

        this.asignaturasConNotas.set(items);

        // Construir agenda: eventos globales + evaluaciones de las asignaturas
        const todasEvals: Array<{ eval: EvaluacionDTO; nombreAsig: string }> = [];
        asignaturas.forEach((asig: AsignaturaDTO, idx: number) => {
          const evals = evaluacionesPorAsig[idx] ?? [];
          evals.forEach((ev: EvaluacionDTO) => {
            todasEvals.push({ eval: ev, nombreAsig: asig.nombre });
          });
        });

        this.agendaCompleta.set(this.construirAgenda(eventos, todasEvals));
        this.estado.set('ok');
      },
      error: () => {
        // Si fallan las evaluaciones mostramos lo que tenemos
        this.asignaturasConNotas.set([]);
        this.agendaCompleta.set(this.construirAgenda(eventos, []));
        this.estado.set('ok');
      },
    });
  }

  // ── Construccion de agenda ─────────────────────────────────────────────────

  private construirAgenda(
    eventos: EventoDto[],
    evaluaciones: Array<{ eval: EvaluacionDTO; nombreAsig: string }>
  ): ItemAgenda[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const items: ItemAgenda[] = [];

    // Eventos globales del calendario
    for (const ev of eventos) {
      const fechaISO = ev.fechaInicio.substring(0, 10); // YYYY-MM-DD
      const fecha = new Date(fechaISO + 'T00:00:00');
      items.push({
        fechaISO,
        fechaDisplay: this.formatFecha(fechaISO),
        titulo: ev.titulo,
        tipo: ev.tipo,
        esPasado: fecha < hoy,
      });
    }

    // Evaluaciones de las asignaturas del estudiante
    for (const { eval: ev, nombreAsig } of evaluaciones) {
      const fechaISO = ev.fecha; // ya es YYYY-MM-DD
      const fecha = new Date(fechaISO + 'T00:00:00');
      items.push({
        fechaISO,
        fechaDisplay: this.formatFecha(fechaISO),
        titulo: `${ev.nombre} — ${nombreAsig}`,
        tipo: 'EVALUACION' as TipoEvento,
        esPasado: fecha < hoy,
      });
    }

    // Ordenar por fecha ascendente
    items.sort((a, b) => a.fechaISO.localeCompare(b.fechaISO));

    return items;
  }

  // ── Helpers de vista ───────────────────────────────────────────────────────

  volver(): void {
    const base = this.router.url.startsWith('/administrativo') ? '/administrativo' : '/director';
    this.router.navigate([`${base}/estudiantes`]);
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '--';
    const [y, m, d] = fecha.substring(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }

  claseNota(nota: number): string {
    if (nota < 4.0) return 'text-red-600';
    if (nota < 5.5) return 'text-amber-600';
    return 'text-green-700';
  }

  clasePromedio(prom: number | null): string {
    if (prom === null) return 'text-slate-400';
    if (prom < 4.0) return 'text-red-600';
    if (prom < 5.5) return 'text-amber-600';
    return 'text-green-700';
  }

  claseBadgeTipo(tipo: TipoEvento | string): string {
    switch (tipo) {
      case 'EVALUACION': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CLASE':      return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'REUNION':    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'FERIADO':    return 'bg-green-50 text-green-700 border-green-200';
      default:           return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }
}
