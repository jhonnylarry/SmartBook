import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AnotacionesService } from './anotaciones.service';
import { AuthService } from '../../core/auth/auth.service';
import { Anotacion, AnotacionRequest, TipoAnotacion, GravedadAnotacion } from '../../shared/models/anotacion.model';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-anotacion-list',
  standalone: true,
  imports: [ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './anotacion-list.component.html',
  styleUrl: './anotacion-list.component.scss'
})
export class AnotacionListComponent implements OnInit {
  private readonly service = inject(AnotacionesService);
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected cargando = signal(false);
  protected guardando = signal(false);
  protected error = signal<string | null>(null);
  protected anotaciones = signal<Anotacion[]>([]);
  protected mostrarFormulario = signal(false);

  protected readonly tipos: TipoAnotacion[] = ['POSITIVA', 'NEGATIVA'];
  protected readonly gravedades: GravedadAnotacion[] = ['LEVE', 'GRAVE', 'MUY_GRAVE'];

  protected form = new FormGroup({
    idEstudiante: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)]
    }),
    idDocente: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)]
    }),
    tipo: new FormControl<TipoAnotacion>('POSITIVA', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    gravedad: new FormControl<GravedadAnotacion>('LEVE', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    descripcion: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(500)]
    })
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.service.listar().subscribe({
      next: data => { this.anotaciones.set(data); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar las anotaciones.'); this.cargando.set(false); }
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario.update(v => !v);
    if (!this.mostrarFormulario()) {
      this.form.reset({ tipo: 'POSITIVA', gravedad: 'LEVE', descripcion: '' });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);

    const raw = this.form.getRawValue();
    const req: AnotacionRequest = {
      idEstudiante: raw.idEstudiante!,
      idDocente: raw.idDocente!,
      tipo: raw.tipo,
      gravedad: raw.gravedad,
      descripcion: raw.descripcion
    };

    this.service.crear(req).subscribe({
      next: nueva => {
        this.anotaciones.update(list => [nueva, ...list]);
        this.guardando.set(false);
        this.toggleFormulario();
        this.toast.success('Anotacion registrada correctamente.');
      },
      error: () => {
        this.error.set('No se pudo registrar la anotacion.');
        this.toast.error('No se pudo registrar la anotacion.');
        this.guardando.set(false);
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('Eliminar esta anotacion?')) return;
    this.service.eliminar(id).subscribe({
      next: () => {
        this.anotaciones.update(list => list.filter(a => a.id !== id));
        this.toast.success('Anotacion eliminada.');
      },
      error: () => {
        this.toast.error('No se pudo eliminar la anotacion.');
        this.error.set('No se pudo eliminar la anotacion.');
      }
    });
  }

  etiquetaTipo(tipo: TipoAnotacion): string {
    return tipo === 'POSITIVA' ? 'Positiva' : 'Negativa';
  }

  claseBadgeTipo(tipo: TipoAnotacion): string {
    return tipo === 'POSITIVA' ? 'badge badge--positive' : 'badge badge--negative';
  }

  claseBadgeGravedad(gravedad: GravedadAnotacion): string {
    const mapa: Record<GravedadAnotacion, string> = {
      LEVE: 'badge badge--neutral',
      GRAVE: 'badge badge--warning',
      MUY_GRAVE: 'badge badge--negative'
    };
    return mapa[gravedad];
  }
}
