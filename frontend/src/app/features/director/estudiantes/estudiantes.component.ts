import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EstudianteApiService } from '../../../core/api/estudiante-api.service';
import { EstudianteDTO, EstudianteDetalleDTO } from '../../../core/models/estudiante.model';
import { DataTableComponent, TableColumn } from '../../../shared/ui/data-table/data-table.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { BadgeRolComponent } from '../../../shared/ui/badge-rol/badge-rol.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [FormsModule, RouterLink, DataTableComponent, ModalComponent, BadgeRolComponent, SpinnerComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="page-title">Estudiantes</h1>
          <p class="text-slate-500 text-sm mt-1">Listado de estudiantes registrados en el sistema.</p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-xl self-start sm:self-auto">
          <span class="text-2xl font-bold text-primary-900">{{ estudiantesFiltrados().length }}</span>
          <span class="text-sm text-primary-600 font-medium">estudiantes</span>
        </div>
      </div>

      <!-- Búsqueda -->
      <div class="card p-4 shrink-0">
        <input
          type="search"
          [(ngModel)]="filtroTexto"
          (ngModelChange)="filtrar()"
          placeholder="Buscar por nombre, apellido o RUT..."
          class="input-field"
        />
      </div>

      <!-- Tabla (ocupa el alto restante) -->
      <div class="flex-1 min-h-0">
        <app-data-table
          class="block h-full"
          [columns]="columnas"
          [rows]="estudiantesFiltrados()"
          [loading]="loading()"
          emptyMessage="No hay estudiantes registrados."
          [rowClickable]="true"
          (rowClicked)="verDetalle($event)"
        />
      </div>

    </div>

    <!-- Modal Detalle -->
    <app-modal
      [open]="modalDetalle()"
      title="Detalle del Estudiante"
      size="lg"
      (closed)="cerrarDetalle()"
    >
      @if (loadingDetalle()) {
        <div class="flex justify-center py-8">
          <app-spinner label="Cargando detalle..." />
        </div>
      } @else if (detalle()) {
        <div class="space-y-5">
          <!-- Info personal -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p class="text-xs text-gray-500 font-medium">Nombre completo</p>
              <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ detalle()!.nombre }} {{ detalle()!.apellido }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium">RUT</p>
              <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ detalle()!.rut || 'No registrado' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium">Fecha de Nacimiento</p>
              <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ formatFecha(detalle()!.fechaNacimiento) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium">ID Usuario</p>
              <p class="text-sm font-semibold text-gray-900 mt-0.5">#{{ detalle()!.idUsuario }}</p>
            </div>
          </div>

          <!-- Matrículas -->
          <div>
            <h3 class="section-title mb-3">Historial de Matrículas</h3>
            @if (detalle()!.matriculas.length === 0) {
              <p class="text-sm text-gray-400 italic">Sin matrículas registradas.</p>
            } @else {
              <div class="space-y-2">
                @for (mat of detalle()!.matriculas; track mat.id) {
                  <div class="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-bold text-xs">
                        #{{ mat.id }}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">Curso ID {{ mat.idCurso }}</p>
                        <p class="text-xs text-gray-400">Fecha: {{ formatFecha(mat.fechaMatricula) }}</p>
                      </div>
                    </div>
                    <span
                      class="text-xs font-semibold px-2.5 py-1 rounded-full"
                      [class]="estadoClass(mat.estado)"
                    >
                      {{ mat.estado }}
                    </span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Acción: ficha académica -->
          <div class="flex justify-end pt-3 border-t border-slate-100">
            <button (click)="verFichaAcademica()" class="btn-primary">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.85" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Ver ficha académica
            </button>
          </div>
        </div>
      }
    </app-modal>
  `,
})
export class EstudiantesComponent implements OnInit {
  private readonly estudianteApi = inject(EstudianteApiService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly loadingDetalle = signal(false);
  readonly modalDetalle = signal(false);
  readonly detalle = signal<EstudianteDetalleDTO | null>(null);

  private readonly _estudiantes = signal<Record<string, unknown>[]>([]);
  readonly estudiantesFiltrados = signal<Record<string, unknown>[]>([]);

  filtroTexto = '';

  readonly columnas: TableColumn[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido', label: 'Apellido' },
    { key: 'rut', label: 'RUT', render: (v) => String(v || 'No registrado') },
    { key: 'fechaNacimiento', label: 'Nacimiento', render: (v) => this.formatFecha(v as string) },
  ];

  ngOnInit(): void {
    this.cargarEstudiantes();
  }

  private cargarEstudiantes(): void {
    this.loading.set(true);
    this.estudianteApi.listar().subscribe({
      next: (estudiantes) => {
        const rows = estudiantes.map((e) => ({ ...e } as unknown as Record<string, unknown>));
        this._estudiantes.set(rows);
        this.estudiantesFiltrados.set(rows);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }

  filtrar(): void {
    const texto = this.filtroTexto.toLowerCase();
    const filtrados = this._estudiantes().filter((e) => {
      if (!texto) return true;
      return (
        String(e['nombre']).toLowerCase().includes(texto) ||
        String(e['apellido']).toLowerCase().includes(texto) ||
        String(e['rut'] ?? '').toLowerCase().includes(texto)
      );
    });
    this.estudiantesFiltrados.set(filtrados);
  }

  verDetalle(row: Record<string, unknown>): void {
    const id = row['id'] as number;
    this.modalDetalle.set(true);
    this.loadingDetalle.set(true);
    this.detalle.set(null);

    this.estudianteApi.obtener(id).subscribe({
      next: (d) => {
        this.detalle.set(d);
        this.loadingDetalle.set(false);
      },
      error: () => { this.loadingDetalle.set(false); },
    });
  }

  cerrarDetalle(): void {
    this.modalDetalle.set(false);
    this.detalle.set(null);
  }

  verFichaAcademica(): void {
    const d = this.detalle();
    if (!d) return;
    this.modalDetalle.set(false);
    const base = this.router.url.startsWith('/administrativo') ? '/administrativo' : '/director';
    this.router.navigate([`${base}/academico/estudiante`, d.id]);
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '--';
    return new Date(fecha).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  estadoClass(estado: string): string {
    const classes: Record<string, string> = {
      VIGENTE: 'bg-green-100 text-green-800',
      RETIRADO: 'bg-red-100 text-red-800',
      EGRESADO: 'bg-gray-100 text-gray-700',
      SUSPENDIDO: 'bg-orange-100 text-orange-800',
    };
    return classes[estado] ?? 'bg-gray-100 text-gray-800';
  }
}
