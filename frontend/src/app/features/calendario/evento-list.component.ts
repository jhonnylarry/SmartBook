import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { CalendarioService } from './calendario.service';
import { Evento, EventoRequest, TipoEvento } from '../../shared/models/evento.model';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-evento-list',
  standalone: true,
  imports: [ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './evento-list.component.html',
  styleUrl: './evento-list.component.scss'
})
export class EventoListComponent implements OnInit {
  private readonly service = inject(CalendarioService);
  private readonly toast = inject(ToastService);

  protected cargando = signal(false);
  protected guardando = signal(false);
  protected error = signal<string | null>(null);
  protected eventos = signal<Evento[]>([]);
  protected mostrarFormulario = signal(false);

  protected readonly tipos: TipoEvento[] = ['CLASE', 'REUNION', 'EVALUACION', 'FERIADO', 'OTRO'];

  protected form = new FormGroup({
    titulo: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(200)]
    }),
    descripcion: new FormControl<string>('', { nonNullable: true }),
    fechaInicio: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    fechaFin: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    tipo: new FormControl<TipoEvento>('CLASE', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.service.listar().subscribe({
      next: data => { this.eventos.set(data); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar los eventos.'); this.cargando.set(false); }
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario.update(v => !v);
    if (!this.mostrarFormulario()) this.form.reset({ tipo: 'CLASE' });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);

    const raw = this.form.getRawValue();
    const req: EventoRequest = {
      titulo: raw.titulo,
      descripcion: raw.descripcion || undefined,
      fechaInicio: raw.fechaInicio,
      fechaFin: raw.fechaFin,
      tipo: raw.tipo
    };

    this.service.crear(req).subscribe({
      next: nuevo => {
        this.eventos.update(list => [...list, nuevo]);
        this.guardando.set(false);
        this.toggleFormulario();
        this.toast.success(`Evento "${nuevo.titulo}" creado.`);
      },
      error: () => {
        this.error.set('No se pudo crear el evento.');
        this.toast.error('No se pudo crear el evento.');
        this.guardando.set(false);
      }
    });
  }

  eliminar(id: number, titulo: string): void {
    if (!confirm(`Eliminar evento "${titulo}"?`)) return;
    this.service.eliminar(id).subscribe({
      next: () => {
        this.eventos.update(list => list.filter(e => e.id !== id));
        this.toast.success(`Evento "${titulo}" eliminado.`);
      },
      error: () => {
        this.toast.error('No se pudo eliminar el evento.');
        this.error.set('No se pudo eliminar el evento.');
      }
    });
  }

  claseBadgeTipo(tipo: TipoEvento): string {
    const mapa: Record<TipoEvento, string> = {
      CLASE: 'badge badge--neutral',
      REUNION: 'badge badge--warning',
      EVALUACION: 'badge badge--negative',
      FERIADO: 'badge badge--positive',
      OTRO: 'badge badge--neutral'
    };
    return mapa[tipo];
  }
}
