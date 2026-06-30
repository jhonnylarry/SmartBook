import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { MateriaApiService } from '../../../core/api/materia-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { MateriaDTO, NivelEnsenanza, NIVELES } from '../../../core/models/materia.model';

@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [ReactiveFormsModule, SlicePipe, ModalComponent, SkeletonComponent, SpinnerComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="page-title">Materias</h1>
          <p class="text-slate-500 text-sm mt-1">Catálogo de asignaturas disponibles por nivel de enseñanza.</p>
        </div>
        @if (auth.canManageAcademico()) {
          <button (click)="abrirModalCrear()" class="btn-primary self-start sm:self-auto">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva materia
          </button>
        }
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-2">
        <button
          (click)="filtroNivel.set(null)"
          class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-150"
          [class.bg-primary-600]="filtroNivel() === null"
          [class.text-white]="filtroNivel() === null"
          [class.border-primary-600]="filtroNivel() === null"
          [class.bg-white]="filtroNivel() !== null"
          [class.text-slate-600]="filtroNivel() !== null"
          [class.border-slate-200]="filtroNivel() !== null"
        >
          Todas
        </button>
        @for (n of niveles; track n.value) {
          <button
            (click)="filtroNivel.set(n.value)"
            class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-150"
            [class.bg-primary-600]="filtroNivel() === n.value"
            [class.text-white]="filtroNivel() === n.value"
            [class.border-primary-600]="filtroNivel() === n.value"
            [class.bg-white]="filtroNivel() !== n.value"
            [class.text-slate-600]="filtroNivel() !== n.value"
            [class.border-slate-200]="filtroNivel() !== n.value"
          >
            {{ n.label }}
          </button>
        }
        <!-- Búsqueda por texto -->
        <input
          type="text"
          [value]="textoBusqueda()"
          (input)="textoBusqueda.set($any($event.target).value)"
          placeholder="Buscar materia..."
          class="input-field !py-1.5 !text-xs w-48"
        />
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
            <p class="text-slate-600 font-medium">Error al cargar las materias</p>
            <p class="text-slate-400 text-sm mt-1">{{ error() }}</p>
          </div>
          <button (click)="cargarMaterias()" class="btn-secondary text-sm">Reintentar</button>
        </div>
      } @else if (materiasFiltradas().length === 0) {
        <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <p class="text-slate-600 font-medium">Sin materias registradas</p>
            <p class="text-slate-400 text-sm mt-1">
              @if (filtroNivel() !== null || textoBusqueda()) {
                No hay resultados para el filtro aplicado.
              } @else {
                Crea la primera materia del catálogo.
              }
            </p>
          </div>
        </div>
      } @else {
        <div class="flex-1 min-h-0 overflow-auto pr-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (materia of materiasFiltradas(); track materia.id) {
              <div class="card p-5 flex flex-col gap-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-slate-800 truncate">{{ materia.nombre }}</h3>
                    @if (materia.area) {
                      <p class="text-xs text-slate-400 mt-0.5 truncate">{{ materia.area }}</p>
                    }
                  </div>
                  <span [class]="badgeNivel(materia.nivel)" class="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border">
                    {{ labelNivel(materia.nivel) }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  @if (materia.activo) {
                    <span class="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Activa
                    </span>
                  } @else {
                    <span class="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      Inactiva
                    </span>
                  }
                </div>

                <div class="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <span class="flex-1 text-xs text-slate-400">
                    Desde {{ materia.fechaCreacion | slice:0:10 }}
                  </span>
                  @if (auth.canManageAcademico()) {
                    <button
                      (click)="abrirModalEditar(materia)"
                      class="text-xs px-2 py-1 rounded-lg bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-700 font-medium transition-colors border border-slate-200"
                    >
                      Editar
                    </button>
                  }
                  @if (auth.canDeleteAcademico()) {
                    <button
                      (click)="eliminarMateria(materia)"
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
      title="Nueva Materia"
      size="md"
      (closed)="cerrarModalCrear()"
    >
      <form [formGroup]="formMateria" (ngSubmit)="crearMateria()" class="space-y-4">
        <div>
          <label class="label">Nombre de la materia *</label>
          <input
            type="text"
            formControlName="nombre"
            class="input-field"
            [class.error]="esInvalido('nombre')"
            placeholder="Ej: Matemática, Historia, Física..."
            maxlength="120"
          />
          @if (esInvalido('nombre')) { <p class="error-text">El nombre es obligatorio (max. 120 caracteres).</p> }
        </div>
        <div>
          <label class="label">Nivel de enseñanza *</label>
          <select formControlName="nivel" class="input-field" [class.error]="esInvalido('nivel')">
            <option value="">Seleccione un nivel...</option>
            @for (n of niveles; track n.value) {
              <option [value]="n.value">{{ n.label }}</option>
            }
          </select>
          @if (esInvalido('nivel')) { <p class="error-text">Seleccione el nivel.</p> }
        </div>
        <div>
          <label class="label">Área temática <span class="text-slate-400">(opcional)</span></label>
          <input
            type="text"
            formControlName="area"
            class="input-field"
            placeholder="Ej: Ciencias, Humanidades, Tecnología..."
            maxlength="100"
          />
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" (click)="cerrarModalCrear()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="guardando()">
            @if (guardando()) { <app-spinner size="sm" /> }
            Crear materia
          </button>
        </div>
      </form>
    </app-modal>

    <!-- Modal Editar -->
    <app-modal
      [open]="modalEditar()"
      [title]="'Editar Materia: ' + (materiaEditando()?.nombre ?? '')"
      size="md"
      (closed)="cerrarModalEditar()"
    >
      <form [formGroup]="formMateria" (ngSubmit)="actualizarMateria()" class="space-y-4">
        <div>
          <label class="label">Nombre de la materia *</label>
          <input
            type="text"
            formControlName="nombre"
            class="input-field"
            [class.error]="esInvalido('nombre')"
            maxlength="120"
          />
          @if (esInvalido('nombre')) { <p class="error-text">El nombre es obligatorio (max. 120 caracteres).</p> }
        </div>
        <div>
          <label class="label">Nivel de enseñanza *</label>
          <select formControlName="nivel" class="input-field" [class.error]="esInvalido('nivel')">
            <option value="">Seleccione un nivel...</option>
            @for (n of niveles; track n.value) {
              <option [value]="n.value">{{ n.label }}</option>
            }
          </select>
          @if (esInvalido('nivel')) { <p class="error-text">Seleccione el nivel.</p> }
        </div>
        <div>
          <label class="label">Área temática <span class="text-slate-400">(opcional)</span></label>
          <input
            type="text"
            formControlName="area"
            class="input-field"
            placeholder="Ej: Ciencias, Humanidades, Tecnología..."
            maxlength="100"
          />
        </div>
        <div class="flex items-center gap-3">
          <input
            type="checkbox"
            formControlName="activo"
            id="check-activo"
            class="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <label for="check-activo" class="label !mb-0 cursor-pointer">Materia activa</label>
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
export class MateriasComponent implements OnInit {
  private readonly materiaApi = inject(MateriaApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly materias = signal<MateriaDTO[]>([]);
  readonly loading = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly filtroNivel = signal<NivelEnsenanza | null>(null);
  readonly textoBusqueda = signal('');
  readonly modalCrear = signal(false);
  readonly modalEditar = signal(false);
  readonly materiaEditando = signal<MateriaDTO | null>(null);

  readonly niveles = NIVELES;

  readonly materiasFiltradas = computed(() => {
    let lista = this.materias();
    const nivel = this.filtroNivel();
    const texto = this.textoBusqueda().toLowerCase().trim();
    if (nivel !== null) {
      lista = lista.filter((m) => m.nivel === nivel);
    }
    if (texto) {
      lista = lista.filter(
        (m) =>
          m.nombre.toLowerCase().includes(texto) ||
          (m.area ?? '').toLowerCase().includes(texto)
      );
    }
    return lista;
  });

  readonly formMateria: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    nivel: ['', [Validators.required]],
    area: [''],
    activo: [true],
  });

  ngOnInit(): void {
    this.cargarMaterias();
  }

  cargarMaterias(): void {
    this.loading.set(true);
    this.error.set(null);
    this.materiaApi.listar().subscribe({
      next: (lista: MateriaDTO[]) => {
        this.materias.set(lista);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el catálogo de materias.');
        this.loading.set(false);
      },
    });
  }

  labelNivel(nivel: NivelEnsenanza): string {
    return NIVELES.find((n) => n.value === nivel)?.label ?? nivel;
  }

  badgeNivel(nivel: NivelEnsenanza): string {
    const map: Record<NivelEnsenanza, string> = {
      BASICA: 'bg-blue-50 text-blue-700 border-blue-200',
      MEDIA: 'bg-teal-50 text-teal-700 border-teal-200',
      TECNICO: 'bg-violet-50 text-violet-700 border-violet-200',
    };
    return map[nivel] ?? 'bg-slate-50 text-slate-700 border-slate-200';
  }

  abrirModalCrear(): void {
    this.formMateria.reset({ nombre: '', nivel: '', area: '', activo: true });
    this.modalCrear.set(true);
  }

  cerrarModalCrear(): void {
    this.modalCrear.set(false);
  }

  crearMateria(): void {
    this.formMateria.markAllAsTouched();
    if (this.formMateria.invalid || this.guardando()) return;

    const v = this.formMateria.getRawValue() as {
      nombre: string;
      nivel: NivelEnsenanza;
      area: string;
      activo: boolean;
    };

    this.guardando.set(true);
    this.materiaApi.crear({
      nombre: v.nombre.trim(),
      nivel: v.nivel,
      ...(v.area.trim() ? { area: v.area.trim() } : {}),
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModalCrear();
        this.toast.success('Materia creada exitosamente.');
        this.cargarMaterias();
      },
      error: () => {
        this.guardando.set(false);
      },
    });
  }

  abrirModalEditar(materia: MateriaDTO): void {
    this.materiaEditando.set(materia);
    this.formMateria.reset({
      nombre: materia.nombre,
      nivel: materia.nivel,
      area: materia.area ?? '',
      activo: materia.activo,
    });
    this.modalEditar.set(true);
  }

  cerrarModalEditar(): void {
    this.modalEditar.set(false);
    this.materiaEditando.set(null);
  }

  actualizarMateria(): void {
    this.formMateria.markAllAsTouched();
    if (this.formMateria.invalid || this.guardando()) return;
    const materia = this.materiaEditando();
    if (!materia) return;

    const v = this.formMateria.getRawValue() as {
      nombre: string;
      nivel: NivelEnsenanza;
      area: string;
      activo: boolean;
    };

    this.guardando.set(true);
    this.materiaApi.actualizar(materia.id, {
      nombre: v.nombre.trim(),
      nivel: v.nivel,
      area: v.area.trim() || undefined,
      activo: v.activo,
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModalEditar();
        this.toast.success('Materia actualizada.');
        this.cargarMaterias();
      },
      error: () => {
        this.guardando.set(false);
      },
    });
  }

  eliminarMateria(materia: MateriaDTO): void {
    if (!confirm(`Eliminar la materia "${materia.nombre}"? Esta accion no se puede deshacer.`)) return;
    this.materiaApi.eliminar(materia.id).subscribe({
      next: () => {
        this.toast.success('Materia eliminada.');
        this.cargarMaterias();
      },
      error: () => {
        this.toast.error('No se pudo eliminar la materia.');
      },
    });
  }

  esInvalido(campo: string): boolean {
    const control = this.formMateria.get(campo);
    return !!(control?.invalid && control.touched);
  }
}
