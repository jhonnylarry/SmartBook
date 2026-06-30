import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { BoletinAsignaturaDto } from '../../../core/models/boletin.model';
import { BoletinNotasComponent } from '../../../shared/ui/boletin-notas/boletin-notas.component';

/** Portal de notas del estudiante: su boletín por asignatura con promedio ponderado. */
@Component({
  selector: 'app-estudiante-mis-notas',
  standalone: true,
  imports: [BoletinNotasComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">
      <div>
        <h1 class="page-title">Mis Notas</h1>
        <p class="text-slate-500 text-sm mt-1">Tu desempeño por asignatura con el promedio ponderado actualizado.</p>
      </div>
      <div class="flex-1 min-h-0 overflow-y-auto">
        @if (error()) {
          <div class="card p-8 flex flex-col items-center justify-center gap-3 text-center">
            <p class="text-slate-600 font-medium">No pudimos cargar tus notas</p>
            <button (click)="cargar()" class="btn-secondary text-sm">Reintentar</button>
          </div>
        } @else {
          <app-boletin-notas [boletin]="boletin()" [loading]="cargando()" />
        }
      </div>
    </div>
  `,
})
export class EstudianteMisNotasComponent implements OnInit {
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly boletin = signal<BoletinAsignaturaDto[]>([]);
  readonly cargando = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(false);
    this.academicoApi.miBoletin().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (b) => {
        this.boletin.set(b);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
}
