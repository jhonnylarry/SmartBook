import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotasService } from './notas.service';
import { Nota, NotaRequest } from '../../shared/models/nota.model';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-nota-list',
  standalone: true,
  imports: [ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './nota-list.component.html',
  styleUrl: './nota-list.component.scss'
})
export class NotaListComponent implements OnInit {
  private readonly service = inject(NotasService);
  private readonly toast = inject(ToastService);

  protected cargando = signal(false);
  protected guardando = signal(false);
  protected error = signal<string | null>(null);
  protected notas = signal<Nota[]>([]);
  protected mostrarFormulario = signal(false);

  protected form = new FormGroup({
    idEvaluacion: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)]
    }),
    idEstudiante: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)]
    }),
    calificacion: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1.0), Validators.max(7.0)]
    })
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.service.listarNotas().subscribe({
      next: data => { this.notas.set(data); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar las notas.'); this.cargando.set(false); }
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario.update(v => !v);
    if (!this.mostrarFormulario()) this.form.reset();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);

    const raw = this.form.getRawValue();
    const req: NotaRequest = {
      idEvaluacion: raw.idEvaluacion!,
      idEstudiante: raw.idEstudiante!,
      calificacion: raw.calificacion!
    };

    this.service.crearNota(req).subscribe({
      next: nueva => {
        this.notas.update(list => [nueva, ...list]);
        this.guardando.set(false);
        this.toggleFormulario();
        this.toast.success(`Nota ${nueva.calificacion.toFixed(1)} registrada.`);
      },
      error: () => {
        this.error.set('No se pudo registrar la nota.');
        this.toast.error('No se pudo registrar la nota.');
        this.guardando.set(false);
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('Eliminar esta nota?')) return;
    this.service.eliminarNota(id).subscribe({
      next: () => {
        this.notas.update(list => list.filter(n => n.id !== id));
        this.toast.success('Nota eliminada.');
      },
      error: () => {
        this.toast.error('No se pudo eliminar la nota.');
        this.error.set('No se pudo eliminar la nota.');
      }
    });
  }

  claseNota(cal: number): string {
    if (cal >= 6.0) return 'nota-aprobada';
    if (cal >= 4.0) return 'nota-limite';
    return 'nota-reprobada';
  }
}
