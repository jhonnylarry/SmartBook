import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { UsuarioApiService } from '../../../core/api/usuario-api.service';
import { MateriaApiService } from '../../../core/api/materia-api.service';
import { HorarioApiService } from '../../../core/api/horario-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { HorarioSemanalComponent } from '../../../shared/ui/horario-semanal/horario-semanal.component';
import { CursoDTO, AsignaturaDTO } from '../../../core/models/academico.model';
import { Usuario } from '../../../core/models/usuario.model';
import { MateriaDTO } from '../../../core/models/materia.model';
import { BloqueHorarioDto, DiaSemana, DIAS_SEMANA, DIA_LABEL } from '../../../core/models/horario.model';

@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, SkeletonComponent, SpinnerComponent, HorarioSemanalComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- Navegacion y cabecera -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <button
            (click)="volver()"
            class="shrink-0 p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Volver a cursos"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div class="min-w-0">
            @if (loadingCurso()) {
              <div class="h-6 w-40 bg-slate-200 rounded animate-pulse"></div>
            } @else {
              <h1 class="page-title truncate">{{ curso()?.nombre ?? 'Curso' }}</h1>
              <p class="text-slate-500 text-sm mt-0.5">Ano {{ curso()?.anio }} &mdash; Asignaturas del curso</p>
            }
          </div>
        </div>
        @if (auth.canManageAcademico()) {
          <div class="flex items-center gap-2 self-start sm:self-auto">
            <button (click)="abrirHorario()" class="btn-secondary">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Horario
            </button>
            <button (click)="abrirModalCrear()" class="btn-primary">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nueva asignatura
            </button>
          </div>
        }
      </div>

      <!-- Contenido -->
      @if (loadingAsignaturas()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <app-skeleton variant="card" />
          }
        </div>
      } @else if (errorAsignaturas()) {
        <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
          <div class="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p class="text-slate-600 font-medium">Error al cargar las asignaturas</p>
            <p class="text-slate-400 text-sm mt-1">{{ errorAsignaturas() }}</p>
          </div>
          <button (click)="cargarAsignaturas()" class="btn-secondary text-sm">Reintentar</button>
        </div>
      } @else if (asignaturas().length === 0) {
        <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <p class="text-slate-600 font-medium">Sin asignaturas registradas</p>
            <p class="text-slate-400 text-sm mt-1">Este curso aun no tiene asignaturas. Crea la primera.</p>
          </div>
        </div>
      } @else {
        <div class="flex-1 min-h-0 overflow-auto pr-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (asig of asignaturas(); track asig.id) {
              <div
                class="card p-5 cursor-pointer hover:shadow-md hover:border-primary-200 transition-all duration-200 group flex flex-col gap-3"
                (click)="irAAsignatura(asig)"
                role="button"
                [attr.aria-label]="'Ver detalle de la asignatura ' + asig.nombre"
              >
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-semibold text-slate-800 truncate group-hover:text-primary-700 transition-colors">{{ asig.nombre }}</h3>
                  <span class="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Asignatura
                  </span>
                </div>

                <p class="text-xs text-slate-400">
                  Docente: {{ nombreDocente(asig.idDocente) }}
                </p>

                <div class="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <span class="flex-1 text-xs text-slate-400 group-hover:text-primary-500 transition-colors">
                    Ver evaluaciones →
                  </span>
                  @if (auth.canManageAcademico()) {
                    <button
                      (click)="abrirModalEditar(asig, $event)"
                      class="text-xs px-2 py-1 rounded-lg bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-700 font-medium transition-colors border border-slate-200"
                    >
                      Editar
                    </button>
                  }
                  @if (auth.canDeleteAcademico()) {
                    <button
                      (click)="eliminarAsignatura(asig, $event)"
                      class="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors border border-red-200"
                    >
                      Eliminar
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

    </div>

    <!-- Modal Crear -->
    <app-modal
      [open]="modalCrear()"
      title="Nueva Asignatura"
      size="md"
      (closed)="cerrarModalCrear()"
    >
      <form [formGroup]="formAsignatura" (ngSubmit)="crearAsignatura()" class="space-y-4">
        <div>
          <label class="label">Nombre de la asignatura *</label>
          @if (loadingMaterias()) {
            <div class="flex items-center gap-2 text-sm text-slate-500 py-2">
              <app-spinner size="sm" />
              Cargando catálogo...
            </div>
          } @else if (materiasCatalogo().length > 0 && !nombreLibre()) {
            <select
              class="input-field"
              [class.error]="esInvalido('nombre')"
              [value]="formAsignatura.get('nombre')?.value"
              (change)="onSelectNombre($any($event.target).value)"
            >
              <option value="">Seleccione una materia...</option>
              @for (m of materiasCatalogo(); track m.id) {
                <option [value]="m.nombre">{{ m.nombre }}</option>
              }
              <option value="__otro__">Otra...</option>
            </select>
            @if (esInvalido('nombre')) { <p class="error-text">Seleccione una materia.</p> }
          } @else {
            <div class="flex gap-2">
              <input
                type="text"
                formControlName="nombre"
                class="input-field flex-1"
                [class.error]="esInvalido('nombre')"
                placeholder="Nombre de la asignatura..."
                maxlength="100"
              />
              @if (materiasCatalogo().length > 0) {
                <button
                  type="button"
                  (click)="nombreLibre.set(false); formAsignatura.get('nombre')?.setValue('')"
                  class="text-xs px-2 py-1 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 whitespace-nowrap"
                >
                  Ver catálogo
                </button>
              }
            </div>
            @if (esInvalido('nombre')) { <p class="error-text">El nombre es obligatorio (max. 100 caracteres).</p> }
          }
        </div>
        <div>
          <label class="label">Docente a cargo *</label>
          @if (loadingDocentes()) {
            <div class="flex items-center gap-2 text-sm text-slate-500 py-2">
              <app-spinner size="sm" />
              Cargando docentes...
            </div>
          } @else {
            <select formControlName="idDocente" class="input-field" [class.error]="esInvalido('idDocente')">
              <option value="">Seleccione un docente...</option>
              @for (d of docentes(); track d.id) {
                <option [value]="d.id">{{ d.username }}</option>
              }
            </select>
            @if (docentes().length === 0) {
              <p class="text-xs text-amber-600 mt-1">No hay docentes activos. Crea un usuario con rol DOCENTE primero.</p>
            }
          }
          @if (esInvalido('idDocente')) { <p class="error-text">Seleccione el docente.</p> }
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" (click)="cerrarModalCrear()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="guardando()">
            @if (guardando()) { <app-spinner size="sm" /> }
            Crear asignatura
          </button>
        </div>
      </form>
    </app-modal>

    <!-- Modal Editar -->
    <app-modal
      [open]="modalEditar()"
      [title]="'Editar: ' + (asignaturaEditando()?.nombre ?? '')"
      size="md"
      (closed)="cerrarModalEditar()"
    >
      <form [formGroup]="formAsignatura" (ngSubmit)="actualizarAsignatura()" class="space-y-4">
        <div>
          <label class="label">Nombre de la asignatura *</label>
          @if (loadingMaterias()) {
            <div class="flex items-center gap-2 text-sm text-slate-500 py-2">
              <app-spinner size="sm" />
              Cargando catálogo...
            </div>
          } @else if (materiasCatalogo().length > 0 && !nombreLibre()) {
            <select
              class="input-field"
              [class.error]="esInvalido('nombre')"
              [value]="formAsignatura.get('nombre')?.value"
              (change)="onSelectNombre($any($event.target).value)"
            >
              <option value="">Seleccione una materia...</option>
              @for (m of materiasCatalogo(); track m.id) {
                <option [value]="m.nombre">{{ m.nombre }}</option>
              }
              <option value="__otro__">Otra...</option>
            </select>
            @if (esInvalido('nombre')) { <p class="error-text">Seleccione una materia.</p> }
          } @else {
            <div class="flex gap-2">
              <input
                type="text"
                formControlName="nombre"
                class="input-field flex-1"
                [class.error]="esInvalido('nombre')"
                placeholder="Nombre de la asignatura..."
                maxlength="100"
              />
              @if (materiasCatalogo().length > 0) {
                <button
                  type="button"
                  (click)="nombreLibre.set(false); formAsignatura.get('nombre')?.setValue('')"
                  class="text-xs px-2 py-1 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 whitespace-nowrap"
                >
                  Ver catálogo
                </button>
              }
            </div>
            @if (esInvalido('nombre')) { <p class="error-text">El nombre es obligatorio (max. 100 caracteres).</p> }
          }
        </div>
        <div>
          <label class="label">Docente a cargo *</label>
          @if (loadingDocentes()) {
            <div class="flex items-center gap-2 text-sm text-slate-500 py-2">
              <app-spinner size="sm" />
              Cargando docentes...
            </div>
          } @else {
            <select formControlName="idDocente" class="input-field" [class.error]="esInvalido('idDocente')">
              <option value="">Seleccione un docente...</option>
              @for (d of docentes(); track d.id) {
                <option [value]="d.id">{{ d.username }}</option>
              }
            </select>
          }
          @if (esInvalido('idDocente')) { <p class="error-text">Seleccione el docente.</p> }
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" (click)="cerrarModalEditar()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="guardando()">
            @if (guardando()) { <app-spinner size="sm" /> }
            Guardar cambios
          </button>
        </div>
      </form>
    </app-modal>

    <!-- Modal Horario del curso -->
    <app-modal
      [open]="modalHorario()"
      title="Horario del curso"
      size="lg"
      (closed)="modalHorario.set(false)"
    >
      <div class="space-y-5">
        <app-horario-semanal
          [bloques]="bloques()"
          [loading]="loadingHorario()"
          [editable]="true"
          (quitar)="eliminarBloque($event)"
        />

        @if (asignaturas().length === 0) {
          <p class="text-sm text-amber-600">Crea al menos una asignatura para poder armar el horario.</p>
        } @else {
          <form [formGroup]="formBloque" (ngSubmit)="crearBloque()" class="border-t border-slate-100 pt-4 space-y-3">
            <p class="text-sm font-semibold text-slate-700">Agregar bloque</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="label">Asignatura *</label>
                <select formControlName="idAsignatura" class="input-field">
                  <option value="">Seleccione...</option>
                  @for (a of asignaturas(); track a.id) { <option [value]="a.id">{{ a.nombre }}</option> }
                </select>
              </div>
              <div>
                <label class="label">Día *</label>
                <select formControlName="diaSemana" class="input-field">
                  <option value="">Seleccione...</option>
                  @for (d of dias; track d) { <option [value]="d">{{ diaLabel[d] }}</option> }
                </select>
              </div>
              <div>
                <label class="label">Hora inicio *</label>
                <input type="time" formControlName="horaInicio" class="input-field" />
              </div>
              <div>
                <label class="label">Hora fin *</label>
                <input type="time" formControlName="horaFin" class="input-field" />
              </div>
              <div class="sm:col-span-2">
                <label class="label">Sala (opcional)</label>
                <input type="text" formControlName="sala" class="input-field" maxlength="50" placeholder="Ej: Sala 12" />
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-1">
              <button type="button" (click)="modalHorario.set(false)" class="btn-secondary">Cerrar</button>
              <button type="submit" class="btn-primary" [disabled]="guardandoBloque()">
                @if (guardandoBloque()) { <app-spinner size="sm" /> }
                Agregar bloque
              </button>
            </div>
          </form>
        }
      </div>
    </app-modal>
  `,
})
export class CursoDetalleComponent implements OnInit {
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly usuarioApi = inject(UsuarioApiService);
  private readonly materiaApi = inject(MateriaApiService);
  private readonly horarioApi = inject(HorarioApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly curso = signal<CursoDTO | null>(null);
  readonly asignaturas = signal<AsignaturaDTO[]>([]);
  readonly docentes = signal<Usuario[]>([]);
  readonly todasLasMaterias = signal<MateriaDTO[]>([]);

  readonly loadingCurso = signal(false);
  readonly loadingAsignaturas = signal(false);
  readonly loadingDocentes = signal(false);
  readonly loadingMaterias = signal(false);
  readonly guardando = signal(false);
  readonly errorAsignaturas = signal<string | null>(null);
  /** Cuando true el usuario eligió 'Otra…' en el select y escribe libremente */
  readonly nombreLibre = signal(false);

  readonly modalCrear = signal(false);
  readonly modalEditar = signal(false);
  readonly asignaturaEditando = signal<AsignaturaDTO | null>(null);

  // ── Horario del curso ──
  readonly modalHorario = signal(false);
  readonly bloques = signal<BloqueHorarioDto[]>([]);
  readonly loadingHorario = signal(false);
  readonly guardandoBloque = signal(false);
  readonly dias: DiaSemana[] = DIAS_SEMANA;
  readonly diaLabel: Record<DiaSemana, string> = DIA_LABEL;
  readonly formBloque: FormGroup = this.fb.group({
    idAsignatura: ['', [Validators.required]],
    diaSemana: ['', [Validators.required]],
    horaInicio: ['', [Validators.required]],
    horaFin: ['', [Validators.required]],
    sala: [''],
  });

  private idCurso = 0;

  /**
   * Materias activas filtradas por el nivel del curso.
   * Si el curso no tiene nivel se muestran TODAS las activas.
   */
  readonly materiasCatalogo = computed(() =>
    this.todasLasMaterias().filter((m) => m.activo)
  );

  readonly formAsignatura: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    idDocente: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.idCurso = idParam ? parseInt(idParam, 10) : 0;
    if (this.idCurso > 0) {
      this.cargarCurso();
      this.cargarAsignaturas();
    }
    this.cargarDocentes();
  }

  private cargarCurso(): void {
    this.loadingCurso.set(true);
    this.academicoApi.curso(this.idCurso).subscribe({
      next: (c: CursoDTO) => {
        this.curso.set(c);
        this.loadingCurso.set(false);
        // Cargar materias después de conocer el nivel del curso
        this.cargarMaterias(c);
      },
      error: () => {
        this.loadingCurso.set(false);
        // Sin nivel conocido: cargar todo el catálogo
        this.cargarMaterias(null);
      },
    });
  }

  private cargarMaterias(c: CursoDTO | null): void {
    this.loadingMaterias.set(true);
    const obs$ = c?.nivel
      ? this.materiaApi.porNivel(c.nivel)
      : this.materiaApi.listar();
    obs$.subscribe({
      next: (lista: MateriaDTO[]) => {
        this.todasLasMaterias.set(lista);
        this.loadingMaterias.set(false);
      },
      error: () => {
        // Fallar silenciosamente: el campo nombre sigue funcionando como texto libre
        this.loadingMaterias.set(false);
      },
    });
  }

  cargarAsignaturas(): void {
    this.loadingAsignaturas.set(true);
    this.errorAsignaturas.set(null);
    this.academicoApi.asignaturasPorCurso(this.idCurso).subscribe({
      next: (lista: AsignaturaDTO[]) => {
        this.asignaturas.set(lista);
        this.loadingAsignaturas.set(false);
      },
      error: () => {
        this.errorAsignaturas.set('No se pudo cargar las asignaturas del curso.');
        this.loadingAsignaturas.set(false);
      },
    });
  }

  private cargarDocentes(): void {
    this.loadingDocentes.set(true);
    this.usuarioApi.listar().subscribe({
      next: (lista: Usuario[]) => {
        this.docentes.set(lista.filter((u) => u.rol === 'DOCENTE' && u.activo));
        this.loadingDocentes.set(false);
      },
      error: () => {
        this.loadingDocentes.set(false);
      },
    });
  }

  nombreDocente(idDocente: number): string {
    const doc = this.docentes().find((d) => d.id === idDocente);
    return doc ? doc.username : `#${idDocente}`;
  }

  volver(): void {
    const base = this.router.url.startsWith('/administrativo') ? '/administrativo' : '/director';
    this.router.navigate([`${base}/academico`]);
  }

  irAAsignatura(asig: AsignaturaDTO): void {
    const base = this.router.url.startsWith('/administrativo') ? '/administrativo' : '/director';
    this.router.navigate([`${base}/academico/asignatura`, asig.id]);
  }

  abrirModalCrear(): void {
    this.formAsignatura.reset({ nombre: '', idDocente: '' });
    this.nombreLibre.set(false);
    this.modalCrear.set(true);
  }

  cerrarModalCrear(): void {
    this.modalCrear.set(false);
  }

  crearAsignatura(): void {
    this.formAsignatura.markAllAsTouched();
    if (this.formAsignatura.invalid || this.guardando()) return;

    const v = this.formAsignatura.getRawValue() as { nombre: string; idDocente: number };

    this.guardando.set(true);
    this.academicoApi.crearAsignatura({
      nombre: v.nombre.trim(),
      idCurso: this.idCurso,
      idDocente: Number(v.idDocente),
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModalCrear();
        this.toast.success('Asignatura creada exitosamente.');
        this.cargarAsignaturas();
      },
      error: () => {
        this.guardando.set(false);
      },
    });
  }

  abrirModalEditar(asig: AsignaturaDTO, event: Event): void {
    event.stopPropagation();
    this.asignaturaEditando.set(asig);
    // Si el nombre existente no está en el catálogo activo, poner en modo libre
    const enCatalogo = this.materiasCatalogo().some((m) => m.nombre === asig.nombre);
    this.nombreLibre.set(!enCatalogo && this.materiasCatalogo().length > 0);
    this.formAsignatura.reset({
      nombre: asig.nombre,
      idDocente: asig.idDocente,
    });
    this.modalEditar.set(true);
  }

  cerrarModalEditar(): void {
    this.modalEditar.set(false);
    this.asignaturaEditando.set(null);
  }

  actualizarAsignatura(): void {
    this.formAsignatura.markAllAsTouched();
    if (this.formAsignatura.invalid || this.guardando()) return;
    const asig = this.asignaturaEditando();
    if (!asig) return;

    const v = this.formAsignatura.getRawValue() as { nombre: string; idDocente: number };

    this.guardando.set(true);
    this.academicoApi.actualizarAsignatura(asig.id, {
      nombre: v.nombre.trim(),
      idCurso: this.idCurso,
      idDocente: Number(v.idDocente),
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModalEditar();
        this.toast.success('Asignatura actualizada.');
        this.cargarAsignaturas();
      },
      error: () => {
        this.guardando.set(false);
      },
    });
  }

  eliminarAsignatura(asig: AsignaturaDTO, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Eliminar la asignatura "${asig.nombre}"? Esta accion no se puede deshacer.`)) return;
    this.academicoApi.eliminarAsignatura(asig.id).subscribe({
      next: () => {
        this.toast.success('Asignatura eliminada.');
        this.cargarAsignaturas();
      },
      error: () => {
        this.toast.error('No se pudo eliminar la asignatura.');
      },
    });
  }

  // ── Gestión del horario ──
  abrirHorario(): void {
    this.formBloque.reset({ idAsignatura: '', diaSemana: '', horaInicio: '', horaFin: '', sala: '' });
    this.modalHorario.set(true);
    this.cargarHorario();
  }

  private cargarHorario(): void {
    this.loadingHorario.set(true);
    this.horarioApi.porCurso(this.idCurso).subscribe({
      next: (b) => {
        this.bloques.set(b);
        this.loadingHorario.set(false);
      },
      error: () => this.loadingHorario.set(false),
    });
  }

  crearBloque(): void {
    this.formBloque.markAllAsTouched();
    if (this.formBloque.invalid || this.guardandoBloque()) return;
    const v = this.formBloque.getRawValue() as {
      idAsignatura: number; diaSemana: DiaSemana; horaInicio: string; horaFin: string; sala: string;
    };
    this.guardandoBloque.set(true);
    this.horarioApi.crear({
      idAsignatura: Number(v.idAsignatura),
      diaSemana: v.diaSemana,
      horaInicio: v.horaInicio,
      horaFin: v.horaFin,
      sala: v.sala?.trim() || null,
    }).subscribe({
      next: () => {
        this.guardandoBloque.set(false);
        this.toast.success('Bloque agregado al horario.');
        this.formBloque.patchValue({ diaSemana: '', horaInicio: '', horaFin: '', sala: '' });
        this.cargarHorario();
      },
      error: () => {
        this.guardandoBloque.set(false);
        this.toast.error('No se pudo agregar el bloque. Revisa que la hora de fin sea posterior al inicio.');
      },
    });
  }

  eliminarBloque(b: BloqueHorarioDto): void {
    this.horarioApi.eliminar(b.id).subscribe({
      next: () => {
        this.toast.success('Bloque eliminado.');
        this.cargarHorario();
      },
      error: () => this.toast.error('No se pudo eliminar el bloque.'),
    });
  }

  /** Maneja la selección en el dropdown de materias del catálogo. */
  onSelectNombre(value: string): void {
    if (value === '__otro__') {
      this.nombreLibre.set(true);
      this.formAsignatura.get('nombre')?.setValue('');
    } else {
      this.formAsignatura.get('nombre')?.setValue(value);
      this.formAsignatura.get('nombre')?.markAsTouched();
    }
  }

  esInvalido(campo: string): boolean {
    const control = this.formAsignatura.get(campo);
    return !!(control?.invalid && control.touched);
  }
}
