import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { AnotacionApiService } from '../../../core/api/anotacion-api.service';
import { EstudianteApiService } from '../../../core/api/estudiante-api.service';
import { UsuarioApiService } from '../../../core/api/usuario-api.service';
import { Usuario } from '../../../core/models/usuario.model';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import {
  AnotacionDTO,
  TipoAnotacion,
  GravedadAnotacion,
  TIPOS_ANOTACION,
  GRAVEDADES_ANOTACION,
} from '../../../core/models/anotacion.model';
import { EstudianteDTO } from '../../../core/models/estudiante.model';

@Component({
  selector: 'app-anotaciones',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, ModalComponent, SkeletonComponent, SpinnerComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="page-title">Anotaciones</h1>
          <p class="text-slate-500 text-sm mt-1">Registro de anotaciones conductuales de estudiantes.</p>
        </div>
        @if (auth.canManageAnotaciones() && estudianteSeleccionado()) {
          <button (click)="abrirModalCrear()" class="btn-primary self-start sm:self-auto">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva anotacion
          </button>
        }
      </div>

      <!-- Selector de estudiante -->
      <div class="card p-4 shrink-0">
        <label class="label mb-2 block">Seleccionar estudiante</label>
        @if (loadingEstudiantes()) {
          <div class="flex items-center gap-2 text-sm text-slate-500">
            <app-spinner size="sm" />
            Cargando estudiantes...
          </div>
        } @else {
          <select
            [(ngModel)]="idEstudianteStr"
            (ngModelChange)="onCambioEstudiante($event)"
            class="input-field"
          >
            <option value="">-- Selecciona un estudiante --</option>
            @for (est of estudiantes(); track est.id) {
              <option [value]="est.id.toString()">{{ est.nombre }} {{ est.apellido }} &mdash; {{ est.rut }}</option>
            }
          </select>
        }
      </div>

      <!-- Contenido principal -->
      @if (!estudianteSeleccionado()) {
        <!-- Estado vacío: sin seleccion -->
        <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <div>
            <p class="text-slate-600 font-medium">Selecciona un estudiante</p>
            <p class="text-slate-400 text-sm mt-1">Las anotaciones del estudiante aparecerán aqui.</p>
          </div>
        </div>
      } @else if (loadingAnotaciones()) {
        <!-- Skeletons de carga -->
        <div class="flex flex-col gap-3">
          @for (i of [1,2,3]; track i) {
            <app-skeleton variant="card" />
          }
        </div>
      } @else if (anotaciones().length === 0) {
        <!-- Estado vacío: sin anotaciones -->
        <div class="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
          <div class="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
            <svg class="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-slate-600 font-medium">Sin anotaciones</p>
            <p class="text-slate-400 text-sm mt-1">Este estudiante no tiene anotaciones registradas.</p>
          </div>
        </div>
      } @else {
        <!-- Lista de anotaciones -->
        <div class="flex-1 min-h-0 overflow-auto flex flex-col gap-3 pr-1">
          @for (an of anotaciones(); track an.id) {
            <div class="card p-4 flex flex-col sm:flex-row sm:items-start gap-3">
              <!-- Columna izquierda: badges y fecha -->
              <div class="flex flex-col gap-2 sm:w-48 shrink-0">
                <span class="inline-flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  [class]="tipoBadgeClass(an.tipo)">
                  <span class="w-1.5 h-1.5 rounded-full"
                    [class]="an.tipo === 'POSITIVA' ? 'bg-green-500' : 'bg-red-500'"></span>
                  {{ an.tipo }}
                </span>
                <span class="inline-flex items-center w-fit gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  [class]="gravedadBadgeClass(an.gravedad)">
                  {{ gravedadLabel(an.gravedad) }}
                </span>
                <p class="text-xs text-slate-400 mt-1">{{ formatFechaHora(an.fecha) }}</p>
              </div>

              <!-- Columna derecha: contenido -->
              <div class="flex-1 min-w-0">
                <p class="text-sm text-slate-800 leading-relaxed">{{ an.descripcion }}</p>
                <p class="text-xs text-slate-400 mt-2">Registrada por: Docente #{{ an.idDocente }}</p>
              </div>

              <!-- Acciones -->
              <div class="flex items-center gap-2 shrink-0">
                @if (auth.canManageAnotaciones()) {
                  <button
                    (click)="abrirModalEditar(an)"
                    class="text-xs px-2.5 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium transition-colors border border-primary-200"
                  >
                    Editar
                  </button>
                }
                @if (auth.canDeleteAnotaciones()) {
                  <button
                    (click)="eliminarAnotacion(an)"
                    class="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors border border-red-200"
                  >
                    Eliminar
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }

    </div>

    <!-- Modal Crear -->
    <app-modal
      [open]="modalCrear()"
      title="Nueva Anotacion"
      size="md"
      (closed)="cerrarModalCrear()"
    >
      <form [formGroup]="formAnotacion" (ngSubmit)="crearAnotacion()" class="space-y-4">
        <div>
          <label class="label">Docente que registra *</label>
          <select formControlName="idDocente" class="input-field" [class.error]="esInvalido('idDocente')">
            <option value="">Seleccione un docente...</option>
            @for (d of docentes(); track d.id) {
              <option [value]="d.id.toString()">{{ d.username }}</option>
            }
          </select>
          @if (docentes().length === 0) {
            <p class="text-xs text-amber-600 mt-1">No hay docentes registrados. Crea un usuario con rol DOCENTE primero.</p>
          }
          @if (esInvalido('idDocente')) { <p class="error-text">Seleccione el docente.</p> }
        </div>
        <div>
          <label class="label">Tipo *</label>
          <select formControlName="tipo" class="input-field" [class.error]="esInvalido('tipo')">
            <option value="">Seleccione...</option>
            @for (t of tipos; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
          @if (esInvalido('tipo')) { <p class="error-text">Seleccione el tipo de anotacion.</p> }
        </div>
        <div>
          <label class="label">Gravedad *</label>
          <select formControlName="gravedad" class="input-field" [class.error]="esInvalido('gravedad')">
            <option value="">Seleccione...</option>
            @for (g of gravedades; track g) {
              <option [value]="g">{{ gravedadLabel(g) }}</option>
            }
          </select>
          @if (esInvalido('gravedad')) { <p class="error-text">Seleccione la gravedad.</p> }
        </div>
        <div>
          <label class="label">
            Descripcion *
            <span class="text-xs text-slate-400 font-normal ml-1">
              ({{ formAnotacion.get('descripcion')?.value?.length ?? 0 }}/1000)
            </span>
          </label>
          <textarea
            formControlName="descripcion"
            rows="4"
            class="input-field resize-none"
            [class.error]="esInvalido('descripcion')"
            placeholder="Describa la situacion observada..."
          ></textarea>
          @if (esInvalido('descripcion')) { <p class="error-text">La descripcion es obligatoria (max. 1000 caracteres).</p> }
        </div>
        <div>
          <label class="label">Fecha y hora <span class="text-xs text-slate-400 font-normal">(por defecto: ahora)</span></label>
          <input type="datetime-local" formControlName="fecha" class="input-field" />
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" (click)="cerrarModalCrear()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="guardando()">
            @if (guardando()) { <app-spinner size="sm" /> }
            Registrar
          </button>
        </div>
      </form>
    </app-modal>

    <!-- Modal Editar -->
    <app-modal
      [open]="modalEditar()"
      title="Editar Anotacion"
      size="md"
      (closed)="cerrarModalEditar()"
    >
      <form [formGroup]="formAnotacion" (ngSubmit)="actualizarAnotacion()" class="space-y-4">
        <div>
          <label class="label">Tipo *</label>
          <select formControlName="tipo" class="input-field" [class.error]="esInvalido('tipo')">
            @for (t of tipos; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
          @if (esInvalido('tipo')) { <p class="error-text">Seleccione el tipo de anotacion.</p> }
        </div>
        <div>
          <label class="label">Gravedad *</label>
          <select formControlName="gravedad" class="input-field" [class.error]="esInvalido('gravedad')">
            @for (g of gravedades; track g) {
              <option [value]="g">{{ gravedadLabel(g) }}</option>
            }
          </select>
          @if (esInvalido('gravedad')) { <p class="error-text">Seleccione la gravedad.</p> }
        </div>
        <div>
          <label class="label">
            Descripcion *
            <span class="text-xs text-slate-400 font-normal ml-1">
              ({{ formAnotacion.get('descripcion')?.value?.length ?? 0 }}/1000)
            </span>
          </label>
          <textarea
            formControlName="descripcion"
            rows="4"
            class="input-field resize-none"
            [class.error]="esInvalido('descripcion')"
          ></textarea>
          @if (esInvalido('descripcion')) { <p class="error-text">La descripcion es obligatoria (max. 1000 caracteres).</p> }
        </div>
        <div>
          <label class="label">Fecha y hora</label>
          <input type="datetime-local" formControlName="fecha" class="input-field" />
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
export class AnotacionesComponent implements OnInit {
  private readonly anotacionApi = inject(AnotacionApiService);
  private readonly estudianteApi = inject(EstudianteApiService);
  private readonly usuarioApi = inject(UsuarioApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly docentes = signal<Usuario[]>([]);

  readonly loadingEstudiantes = signal(false);
  readonly loadingAnotaciones = signal(false);
  readonly guardando = signal(false);
  readonly modalCrear = signal(false);
  readonly modalEditar = signal(false);

  readonly estudiantes = signal<EstudianteDTO[]>([]);
  readonly anotaciones = signal<AnotacionDTO[]>([]);
  readonly estudianteSeleccionado = signal<number | null>(null);
  readonly anotacionEditando = signal<AnotacionDTO | null>(null);

  idEstudianteStr = '';

  readonly tipos: TipoAnotacion[] = TIPOS_ANOTACION;
  readonly gravedades: GravedadAnotacion[] = GRAVEDADES_ANOTACION;

  readonly formAnotacion: FormGroup = this.fb.group({
    idDocente: ['', [Validators.required]],
    tipo: ['', [Validators.required]],
    gravedad: ['', [Validators.required]],
    descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
    fecha: [''],
  });

  readonly contadorDescripcion = computed(() =>
    (this.formAnotacion.get('descripcion')?.value as string)?.length ?? 0
  );

  ngOnInit(): void {
    this.cargarEstudiantes();
    this.cargarDocentes();
  }

  private cargarDocentes(): void {
    this.usuarioApi.listar().subscribe({
      next: (lista) => this.docentes.set(lista.filter((u) => u.rol === 'DOCENTE' && u.activo)),
      error: () => { /* sin docentes: el selector queda vacío */ },
    });
  }

  /** idDocente por defecto: el usuario actual si es DOCENTE, si no el primer docente. */
  private docentePorDefecto(): string {
    const user = this.auth.currentUser();
    if (user?.rol === 'DOCENTE') return String(user.id);
    return this.docentes()[0]?.id != null ? String(this.docentes()[0].id) : '';
  }

  private cargarEstudiantes(): void {
    this.loadingEstudiantes.set(true);
    this.estudianteApi.listar().subscribe({
      next: (lista) => {
        this.estudiantes.set(lista);
        this.loadingEstudiantes.set(false);
      },
      error: () => {
        this.toast.error('No se pudo cargar la lista de estudiantes.');
        this.loadingEstudiantes.set(false);
      },
    });
  }

  onCambioEstudiante(idStr: string): void {
    if (!idStr) {
      this.estudianteSeleccionado.set(null);
      this.anotaciones.set([]);
      return;
    }
    const id = parseInt(idStr, 10);
    this.estudianteSeleccionado.set(id);
    this.cargarAnotaciones(id);
  }

  private cargarAnotaciones(idEstudiante: number): void {
    this.loadingAnotaciones.set(true);
    this.anotaciones.set([]);
    this.anotacionApi.porEstudiante(idEstudiante).subscribe({
      next: (lista) => {
        this.anotaciones.set(lista);
        this.loadingAnotaciones.set(false);
      },
      error: () => {
        this.toast.error('No se pudo cargar las anotaciones.');
        this.loadingAnotaciones.set(false);
      },
    });
  }

  abrirModalCrear(): void {
    this.formAnotacion.reset({
      idDocente: this.docentePorDefecto(),
      tipo: '', gravedad: '', descripcion: '', fecha: this.fechaActualLocal(),
    });
    this.modalCrear.set(true);
  }

  cerrarModalCrear(): void {
    this.modalCrear.set(false);
  }

  crearAnotacion(): void {
    this.formAnotacion.markAllAsTouched();
    if (this.formAnotacion.invalid || this.guardando()) return;
    const idEstudiante = this.estudianteSeleccionado();
    if (!idEstudiante) return;

    const v = this.formAnotacion.getRawValue() as {
      idDocente: string;
      tipo: TipoAnotacion;
      gravedad: GravedadAnotacion;
      descripcion: string;
      fecha: string;
    };

    this.guardando.set(true);
    this.anotacionApi.crear({
      idEstudiante,
      idDocente: parseInt(v.idDocente, 10),
      tipo: v.tipo,
      gravedad: v.gravedad,
      descripcion: v.descripcion,
      fecha: this.normalizarFecha(v.fecha),
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModalCrear();
        this.toast.success('Anotacion registrada exitosamente.');
        this.cargarAnotaciones(idEstudiante);
      },
      error: () => {
        this.guardando.set(false);
        this.toast.error('No se pudo registrar la anotacion.');
      },
    });
  }

  abrirModalEditar(anotacion: AnotacionDTO): void {
    this.anotacionEditando.set(anotacion);
    this.formAnotacion.reset({
      idDocente: String(anotacion.idDocente),
      tipo: anotacion.tipo,
      gravedad: anotacion.gravedad,
      descripcion: anotacion.descripcion,
      fecha: anotacion.fecha ? anotacion.fecha.substring(0, 16) : '',
    });
    this.modalEditar.set(true);
  }

  cerrarModalEditar(): void {
    this.modalEditar.set(false);
    this.anotacionEditando.set(null);
  }

  actualizarAnotacion(): void {
    this.formAnotacion.markAllAsTouched();
    if (this.formAnotacion.invalid || this.guardando()) return;
    const anotacion = this.anotacionEditando();
    if (!anotacion) return;

    const v = this.formAnotacion.getRawValue() as {
      tipo: TipoAnotacion;
      gravedad: GravedadAnotacion;
      descripcion: string;
      fecha: string;
    };

    this.guardando.set(true);
    this.anotacionApi.actualizar(anotacion.id, {
      tipo: v.tipo,
      gravedad: v.gravedad,
      descripcion: v.descripcion,
      fecha: this.normalizarFecha(v.fecha),
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModalEditar();
        this.toast.success('Anotacion actualizada.');
        const idEstudiante = this.estudianteSeleccionado();
        if (idEstudiante) this.cargarAnotaciones(idEstudiante);
      },
      error: () => {
        this.guardando.set(false);
        this.toast.error('No se pudo actualizar la anotacion.');
      },
    });
  }

  eliminarAnotacion(anotacion: AnotacionDTO): void {
    if (!confirm(`Eliminar la anotacion de tipo ${anotacion.tipo}? Esta accion no se puede deshacer.`)) return;
    this.anotacionApi.eliminar(anotacion.id).subscribe({
      next: () => {
        this.toast.success('Anotacion eliminada.');
        const idEstudiante = this.estudianteSeleccionado();
        if (idEstudiante) this.cargarAnotaciones(idEstudiante);
      },
      error: () => {
        this.toast.error('No se pudo eliminar la anotacion.');
      },
    });
  }

  esInvalido(campo: string): boolean {
    const control = this.formAnotacion.get(campo);
    return !!(control?.invalid && control.touched);
  }

  tipoBadgeClass(tipo: TipoAnotacion): string {
    return tipo === 'POSITIVA'
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-red-100 text-red-800 border border-red-200';
  }

  gravedadBadgeClass(gravedad: GravedadAnotacion): string {
    const classes: Record<GravedadAnotacion, string> = {
      LEVE: 'bg-amber-100 text-amber-800 border border-amber-200',
      GRAVE: 'bg-orange-100 text-orange-800 border border-orange-200',
      MUY_GRAVE: 'bg-red-200 text-red-900 border border-red-300',
    };
    return classes[gravedad] ?? 'bg-gray-100 text-gray-700';
  }

  gravedadLabel(gravedad: GravedadAnotacion): string {
    const labels: Record<GravedadAnotacion, string> = {
      LEVE: 'Leve',
      GRAVE: 'Grave',
      MUY_GRAVE: 'Muy grave',
    };
    return labels[gravedad] ?? gravedad;
  }

  formatFechaHora(fecha: string): string {
    if (!fecha) return '--';
    return new Date(fecha).toLocaleString('es-CL', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  private fechaActualLocal(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  private normalizarFecha(valor: string): string {
    if (!valor) return this.fechaActualLocal() + ':00';
    // datetime-local da YYYY-MM-DDTHH:mm; el backend necesita HH:mm:ss
    return valor.length === 16 ? valor + ':00' : valor;
  }
}
