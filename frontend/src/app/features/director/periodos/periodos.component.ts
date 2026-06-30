import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { PeriodoAcademicoDto } from '../../../core/models/periodo.model';

/** Gestión de periodos académicos (trimestres/semestres). Solo Director/Admin. */
@Component({
  selector: 'app-periodos',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, SkeletonComponent, SpinnerComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="page-title">Periodos Académicos</h1>
          <p class="text-slate-500 text-sm mt-1">Trimestres/semestres del año. Las evaluaciones se asignan a un periodo según su fecha.</p>
        </div>
        <button (click)="abrirCrear()" class="btn-primary self-start sm:self-auto">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo periodo
        </button>
      </div>

      @if (cargando()) {
        <div class="flex flex-col gap-3">
          @for (i of [1,2,3]; track i) { <app-skeleton variant="tableRow" /> }
        </div>
      } @else if (periodos().length === 0) {
        <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
          <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg class="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-slate-600 font-medium">Sin periodos académicos</p>
            <p class="text-slate-400 text-sm mt-1">Crea el primer trimestre/semestre del año.</p>
          </div>
        </div>
      } @else {
        <div class="flex-1 min-h-0 overflow-auto pr-1">
          <div class="flex flex-col gap-3">
            @for (p of periodos(); track p.id) {
              <div class="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-slate-800">{{ p.nombre }}</h3>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{{ p.anio }}</span>
                  </div>
                  <p class="text-xs text-slate-500 mt-1">{{ formatFecha(p.fechaInicio) }} — {{ formatFecha(p.fechaFin) }}</p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <button (click)="abrirEditar(p)"
                    class="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-700 font-medium transition-colors border border-slate-200">
                    Editar
                  </button>
                  <button (click)="eliminar(p)"
                    class="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors border border-red-200">
                    Eliminar
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <app-modal [open]="modalAbierto()" [title]="editando() ? 'Editar periodo' : 'Nuevo periodo'" size="md" (closed)="cerrarModal()">
      <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-4">
        <div>
          <label class="label">Nombre *</label>
          <input type="text" formControlName="nombre" class="input-field" [class.error]="invalido('nombre')"
            placeholder="Ej: Primer Trimestre" maxlength="100" />
          @if (invalido('nombre')) { <p class="error-text">El nombre es obligatorio.</p> }
        </div>
        <div>
          <label class="label">Año *</label>
          <input type="number" formControlName="anio" class="input-field" [class.error]="invalido('anio')"
            placeholder="2026" min="2000" />
          @if (invalido('anio')) { <p class="error-text">Ingrese un año válido (≥ 2000).</p> }
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="label">Fecha inicio *</label>
            <input type="date" formControlName="fechaInicio" class="input-field" [class.error]="invalido('fechaInicio')" />
            @if (invalido('fechaInicio')) { <p class="error-text">Requerida.</p> }
          </div>
          <div>
            <label class="label">Fecha fin *</label>
            <input type="date" formControlName="fechaFin" class="input-field" [class.error]="invalido('fechaFin')" />
            @if (invalido('fechaFin')) { <p class="error-text">Requerida.</p> }
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" (click)="cerrarModal()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="guardando()">
            @if (guardando()) { <app-spinner size="sm" /> }
            {{ editando() ? 'Guardar cambios' : 'Crear periodo' }}
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class PeriodosComponent implements OnInit {
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly periodos = signal<PeriodoAcademicoDto[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly modalAbierto = signal(false);
  readonly editando = signal<PeriodoAcademicoDto | null>(null);

  readonly form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    fechaInicio: ['', [Validators.required]],
    fechaFin: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.academicoApi.periodos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (lista) => { this.periodos.set(lista); this.cargando.set(false); },
      error: () => { this.cargando.set(false); },
    });
  }

  abrirCrear(): void {
    this.editando.set(null);
    this.form.reset({ nombre: '', anio: new Date().getFullYear(), fechaInicio: '', fechaFin: '' });
    this.modalAbierto.set(true);
  }

  abrirEditar(p: PeriodoAcademicoDto): void {
    this.editando.set(p);
    this.form.reset({ nombre: p.nombre, anio: p.anio, fechaInicio: p.fechaInicio, fechaFin: p.fechaFin });
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.editando.set(null);
  }

  guardar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.guardando()) return;
    const v = this.form.getRawValue() as { nombre: string; anio: number; fechaInicio: string; fechaFin: string };
    const body = { nombre: v.nombre.trim(), anio: Number(v.anio), fechaInicio: v.fechaInicio, fechaFin: v.fechaFin };
    const ed = this.editando();

    this.guardando.set(true);
    const op$ = ed ? this.academicoApi.actualizarPeriodo(ed.id, body) : this.academicoApi.crearPeriodo(body);
    op$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.toast.success(ed ? 'Periodo actualizado.' : 'Periodo creado.');
        this.cargar();
      },
      error: () => { this.guardando.set(false); },
    });
  }

  eliminar(p: PeriodoAcademicoDto): void {
    if (!confirm(`¿Eliminar el periodo "${p.nombre}" (${p.anio})?`)) return;
    this.academicoApi.eliminarPeriodo(p.id).subscribe({
      next: () => { this.toast.success('Periodo eliminado.'); this.cargar(); },
      error: () => { this.toast.error('No se pudo eliminar el periodo.'); },
    });
  }

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c.touched);
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '--';
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
  }
}
