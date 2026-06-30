import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { UsuarioApiService } from '../../../core/api/usuario-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { CursoDTO } from '../../../core/models/academico.model';
import { Usuario } from '../../../core/models/usuario.model';
import { NIVELES, NivelEnsenanza } from '../../../core/models/materia.model';

@Component({
  selector: 'app-academico',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, SkeletonComponent, SpinnerComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="page-title">Gestion Academica</h1>
          <p class="text-slate-500 text-sm mt-1">Administracion de cursos, asignaturas, evaluaciones y notas.</p>
        </div>
        @if (auth.canManageAcademico()) {
          <button (click)="abrirModalCrear()" class="btn-primary self-start sm:self-auto">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo curso
          </button>
        }
      </div>

      <!-- Contenido -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1,2,3,4,5,6]; track i) {
            <app-skeleton variant="card" />
          }
        </div>
      } @else if (error()) {
        <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
          <div class="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p class="text-slate-600 font-medium">Error al cargar los cursos</p>
            <p class="text-slate-400 text-sm mt-1">{{ error() }}</p>
          </div>
          <button (click)="cargarCursos()" class="btn-secondary text-sm">Reintentar</button>
        </div>
      } @else if (cursos().length === 0) {
        <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
          </div>
          <div>
            <p class="text-slate-600 font-medium">Sin cursos registrados</p>
            <p class="text-slate-400 text-sm mt-1">Crea el primer curso para comenzar.</p>
          </div>
        </div>
      } @else {
        <div class="flex-1 min-h-0 overflow-auto pr-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (curso of cursos(); track curso.id) {
              <div
                class="card p-5 cursor-pointer hover:shadow-md hover:border-primary-200 transition-all duration-200 group flex flex-col gap-3"
                (click)="irACurso(curso)"
                role="button"
                [attr.aria-label]="'Ver detalle del curso ' + curso.nombre"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-slate-800 truncate group-hover:text-primary-700 transition-colors">{{ curso.nombre }}</h3>
                    <p class="text-sm text-slate-500 mt-0.5">Ano escolar {{ curso.anio }}</p>
                  </div>
                  <div class="flex flex-col items-end gap-1 shrink-0">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                      {{ curso.anio }}
                    </span>
                    @if (curso.nivel) {
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                        {{ labelNivel(curso.nivel) }}
                      </span>
                    }
                  </div>
                </div>

                <p class="text-xs text-slate-400">
                  Profesor jefe: {{ nombreDocente(curso.idDocenteJefe) }}
                </p>

                <div class="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <span class="flex-1 text-xs text-slate-400 group-hover:text-primary-500 transition-colors">
                    Ver asignaturas →
                  </span>
                  @if (auth.canManageAcademico()) {
                    <button
                      (click)="abrirModalEditar(curso, $event)"
                      class="text-xs px-2 py-1 rounded-lg bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-700 font-medium transition-colors border border-slate-200"
                    >
                      Editar
                    </button>
                  }
                  @if (auth.canDeleteAcademico()) {
                    <button
                      (click)="eliminarCurso(curso, $event)"
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
      title="Nuevo Curso"
      size="md"
      (closed)="cerrarModalCrear()"
    >
      <form [formGroup]="formCurso" (ngSubmit)="crearCurso()" class="space-y-4">
        <div>
          <label class="label">Nombre del curso *</label>
          <input
            type="text"
            formControlName="nombre"
            class="input-field"
            [class.error]="esInvalido('nombre')"
            placeholder="Ej: 1° A, 2° B..."
            maxlength="100"
          />
          @if (esInvalido('nombre')) { <p class="error-text">El nombre es obligatorio (max. 100 caracteres).</p> }
        </div>
        <div>
          <label class="label">Ano escolar *</label>
          <input
            type="number"
            formControlName="anio"
            class="input-field"
            [class.error]="esInvalido('anio')"
            placeholder="2025"
            min="2000"
          />
          @if (esInvalido('anio')) { <p class="error-text">Ingrese un ano valido (desde 2000).</p> }
        </div>
        <div>
          <label class="label">Nivel de enseñanza <span class="text-slate-400">(opcional)</span></label>
          <select formControlName="nivel" class="input-field">
            <option value="">Sin nivel asignado</option>
            @for (n of niveles; track n.value) {
              <option [value]="n.value">{{ n.label }}</option>
            }
          </select>
        </div>
        <div>
          <label class="label">Profesor jefe *</label>
          @if (loadingDocentes()) {
            <div class="flex items-center gap-2 text-sm text-slate-500 py-2">
              <app-spinner size="sm" />
              Cargando docentes...
            </div>
          } @else {
            <select formControlName="idDocenteJefe" class="input-field" [class.error]="esInvalido('idDocenteJefe')">
              <option value="">Seleccione un docente...</option>
              @for (d of docentes(); track d.id) {
                <option [value]="d.id">{{ d.username }}</option>
              }
            </select>
            @if (docentes().length === 0) {
              <p class="text-xs text-amber-600 mt-1">No hay docentes activos. Crea un usuario con rol DOCENTE primero.</p>
            }
          }
          @if (esInvalido('idDocenteJefe')) { <p class="error-text">Seleccione el profesor jefe.</p> }
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" (click)="cerrarModalCrear()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="guardando()">
            @if (guardando()) { <app-spinner size="sm" /> }
            Crear curso
          </button>
        </div>
      </form>
    </app-modal>

    <!-- Modal Editar -->
    <app-modal
      [open]="modalEditar()"
      [title]="'Editar Curso: ' + (cursoEditando()?.nombre ?? '')"
      size="md"
      (closed)="cerrarModalEditar()"
    >
      <form [formGroup]="formCurso" (ngSubmit)="actualizarCurso()" class="space-y-4">
        <div>
          <label class="label">Nombre del curso *</label>
          <input
            type="text"
            formControlName="nombre"
            class="input-field"
            [class.error]="esInvalido('nombre')"
            maxlength="100"
          />
          @if (esInvalido('nombre')) { <p class="error-text">El nombre es obligatorio (max. 100 caracteres).</p> }
        </div>
        <div>
          <label class="label">Ano escolar *</label>
          <input
            type="number"
            formControlName="anio"
            class="input-field"
            [class.error]="esInvalido('anio')"
            min="2000"
          />
          @if (esInvalido('anio')) { <p class="error-text">Ingrese un ano valido (desde 2000).</p> }
        </div>
        <div>
          <label class="label">Nivel de enseñanza <span class="text-slate-400">(opcional)</span></label>
          <select formControlName="nivel" class="input-field">
            <option value="">Sin nivel asignado</option>
            @for (n of niveles; track n.value) {
              <option [value]="n.value">{{ n.label }}</option>
            }
          </select>
        </div>
        <div>
          <label class="label">Profesor jefe *</label>
          @if (loadingDocentes()) {
            <div class="flex items-center gap-2 text-sm text-slate-500 py-2">
              <app-spinner size="sm" />
              Cargando docentes...
            </div>
          } @else {
            <select formControlName="idDocenteJefe" class="input-field" [class.error]="esInvalido('idDocenteJefe')">
              <option value="">Seleccione un docente...</option>
              @for (d of docentes(); track d.id) {
                <option [value]="d.id">{{ d.username }}</option>
              }
            </select>
          }
          @if (esInvalido('idDocenteJefe')) { <p class="error-text">Seleccione el profesor jefe.</p> }
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
  `,
})
export class AcademicoComponent implements OnInit {
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly usuarioApi = inject(UsuarioApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly cursos = signal<CursoDTO[]>([]);
  readonly docentes = signal<Usuario[]>([]);
  readonly loading = signal(false);
  readonly loadingDocentes = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly modalCrear = signal(false);
  readonly modalEditar = signal(false);
  readonly cursoEditando = signal<CursoDTO | null>(null);

  readonly niveles = NIVELES;

  readonly formCurso: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    idDocenteJefe: ['', [Validators.required]],
    nivel: [''],
  });

  ngOnInit(): void {
    this.cargarCursos();
    this.cargarDocentes();
  }

  cargarCursos(): void {
    this.loading.set(true);
    this.error.set(null);
    this.academicoApi.cursos().subscribe({
      next: (lista: CursoDTO[]) => {
        this.cursos.set(lista);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de cursos.');
        this.loading.set(false);
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

  labelNivel(nivel: NivelEnsenanza): string {
    return NIVELES.find((n) => n.value === nivel)?.label ?? nivel;
  }

  irACurso(curso: CursoDTO): void {
    const base = this.router.url.startsWith('/administrativo') ? '/administrativo' : '/director';
    this.router.navigate([`${base}/academico/curso`, curso.id]);
  }

  abrirModalCrear(): void {
    this.formCurso.reset({
      nombre: '',
      anio: new Date().getFullYear(),
      idDocenteJefe: '',
      nivel: '',
    });
    this.modalCrear.set(true);
  }

  cerrarModalCrear(): void {
    this.modalCrear.set(false);
  }

  crearCurso(): void {
    this.formCurso.markAllAsTouched();
    if (this.formCurso.invalid || this.guardando()) return;

    const v = this.formCurso.getRawValue() as { nombre: string; anio: number; idDocenteJefe: number; nivel: string };

    this.guardando.set(true);
    this.academicoApi.crearCurso({
      nombre: v.nombre.trim(),
      anio: Number(v.anio),
      idDocenteJefe: Number(v.idDocenteJefe),
      ...(v.nivel ? { nivel: v.nivel as NivelEnsenanza } : {}),
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModalCrear();
        this.toast.success('Curso creado exitosamente.');
        this.cargarCursos();
      },
      error: () => {
        this.guardando.set(false);
      },
    });
  }

  abrirModalEditar(curso: CursoDTO, event: Event): void {
    event.stopPropagation();
    this.cursoEditando.set(curso);
    this.formCurso.reset({
      nombre: curso.nombre,
      anio: curso.anio,
      idDocenteJefe: curso.idDocenteJefe,
      nivel: curso.nivel ?? '',
    });
    this.modalEditar.set(true);
  }

  cerrarModalEditar(): void {
    this.modalEditar.set(false);
    this.cursoEditando.set(null);
  }

  actualizarCurso(): void {
    this.formCurso.markAllAsTouched();
    if (this.formCurso.invalid || this.guardando()) return;
    const curso = this.cursoEditando();
    if (!curso) return;

    const v = this.formCurso.getRawValue() as { nombre: string; anio: number; idDocenteJefe: number; nivel: string };

    this.guardando.set(true);
    this.academicoApi.actualizarCurso(curso.id, {
      nombre: v.nombre.trim(),
      anio: Number(v.anio),
      idDocenteJefe: Number(v.idDocenteJefe),
      ...(v.nivel ? { nivel: v.nivel as NivelEnsenanza } : {}),
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModalEditar();
        this.toast.success('Curso actualizado.');
        this.cargarCursos();
      },
      error: () => {
        this.guardando.set(false);
      },
    });
  }

  eliminarCurso(curso: CursoDTO, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Eliminar el curso "${curso.nombre}"? Esta accion no se puede deshacer.`)) return;
    this.academicoApi.eliminarCurso(curso.id).subscribe({
      next: () => {
        this.toast.success('Curso eliminado.');
        this.cargarCursos();
      },
      error: () => {
        this.toast.error('No se pudo eliminar el curso.');
      },
    });
  }

  esInvalido(campo: string): boolean {
    const control = this.formCurso.get(campo);
    return !!(control?.invalid && control.touched);
  }
}
