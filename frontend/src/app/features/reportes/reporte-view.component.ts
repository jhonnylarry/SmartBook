import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReportesService } from './reportes.service';

type TipoConsulta = 'notas' | 'anotaciones' | 'curso' | 'historial';

@Component({
  selector: 'app-reporte-view',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reporte-view.component.html',
  styleUrl: './reporte-view.component.scss'
})
export class ReporteViewComponent {
  private readonly service = inject(ReportesService);

  protected cargando = signal(false);
  protected error = signal<string | null>(null);
  protected resultado = signal<unknown>(null);
  protected tipoActual = signal<TipoConsulta>('notas');

  protected readonly tiposConsulta: { value: TipoConsulta; label: string }[] = [
    { value: 'notas', label: 'Notas por estudiante' },
    { value: 'anotaciones', label: 'Anotaciones por estudiante' },
    { value: 'curso', label: 'Reporte de curso' },
    { value: 'historial', label: 'Historial de reportes' }
  ];

  protected form = new FormGroup({
    tipo: new FormControl<TipoConsulta>('notas', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    idReferencia: new FormControl<number | null>(null, {
      validators: [Validators.min(1)]
    })
  });

  consultar(): void {
    const raw = this.form.getRawValue();
    const tipo = raw.tipo;
    const id = raw.idReferencia;

    if (tipo !== 'historial' && !id) {
      this.form.controls.idReferencia.setErrors({ required: true });
      this.form.controls.idReferencia.markAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set(null);
    this.resultado.set(null);
    this.tipoActual.set(tipo);

    let obs$;
    switch (tipo) {
      case 'notas':
        obs$ = this.service.notasPorEstudiante(id!);
        break;
      case 'anotaciones':
        obs$ = this.service.anotacionesPorEstudiante(id!);
        break;
      case 'curso':
        obs$ = this.service.reporteCurso(id!);
        break;
      default:
        obs$ = this.service.historial();
    }

    obs$.subscribe({
      next: data => { this.resultado.set(data); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo generar el reporte.'); this.cargando.set(false); }
    });
  }

  resultadoJson(): string {
    const r = this.resultado();
    if (!r) return '';
    try {
      return JSON.stringify(r, null, 2);
    } catch {
      return String(r);
    }
  }

  requiereId(): boolean {
    return this.form.controls.tipo.value !== 'historial';
  }
}
