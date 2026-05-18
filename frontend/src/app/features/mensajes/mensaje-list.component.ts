import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MensajesService } from './mensajes.service';
import { Mensaje, MensajeRequest } from '../../shared/models/mensaje.model';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ToastService } from '../../shared/services/toast.service';

type Bandeja = 'recibidos' | 'enviados';

@Component({
  selector: 'app-mensaje-list',
  standalone: true,
  imports: [ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './mensaje-list.component.html',
  styleUrl: './mensaje-list.component.scss'
})
export class MensajeListComponent implements OnInit {
  private readonly service = inject(MensajesService);
  private readonly toast = inject(ToastService);

  protected cargando = signal(false);
  protected guardando = signal(false);
  protected error = signal<string | null>(null);
  protected mensajes = signal<Mensaje[]>([]);
  protected bandeja = signal<Bandeja>('recibidos');
  protected mostrarRedactar = signal(false);
  protected mensajeSeleccionado = signal<Mensaje | null>(null);

  protected form = new FormGroup({
    idDestinatario: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)]
    }),
    asunto: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(200)]
    }),
    contenido: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)]
    })
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.mensajeSeleccionado.set(null);

    const obs$ = this.bandeja() === 'recibidos'
      ? this.service.recibidos()
      : this.service.enviados();

    obs$.subscribe({
      next: data => { this.mensajes.set(data); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar los mensajes.'); this.cargando.set(false); }
    });
  }

  cambiarBandeja(b: Bandeja): void {
    this.bandeja.set(b);
    this.cargar();
  }

  verMensaje(m: Mensaje): void {
    this.mensajeSeleccionado.set(m);
    if (!m.leido && this.bandeja() === 'recibidos') {
      this.service.marcarLeido(m.id).subscribe({
        next: actualizado => {
          this.mensajes.update(list => list.map(x => x.id === m.id ? actualizado : x));
          this.mensajeSeleccionado.set(actualizado);
        }
      });
    }
  }

  cerrarDetalle(): void {
    this.mensajeSeleccionado.set(null);
  }

  toggleRedactar(): void {
    this.mostrarRedactar.update(v => !v);
    if (!this.mostrarRedactar()) this.form.reset();
  }

  enviar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);

    const raw = this.form.getRawValue();
    const req: MensajeRequest = {
      idDestinatario: raw.idDestinatario!,
      asunto: raw.asunto,
      contenido: raw.contenido
    };

    this.service.enviar(req).subscribe({
      next: () => {
        this.guardando.set(false);
        this.toggleRedactar();
        this.toast.success('Mensaje enviado correctamente.');
        if (this.bandeja() === 'enviados') this.cargar();
      },
      error: () => {
        this.error.set('No se pudo enviar el mensaje.');
        this.toast.error('No se pudo enviar el mensaje.');
        this.guardando.set(false);
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('Eliminar este mensaje?')) return;
    this.service.eliminar(id).subscribe({
      next: () => {
        this.mensajes.update(list => list.filter(m => m.id !== id));
        if (this.mensajeSeleccionado()?.id === id) this.mensajeSeleccionado.set(null);
        this.toast.success('Mensaje eliminado.');
      },
      error: () => {
        this.toast.error('No se pudo eliminar el mensaje.');
        this.error.set('No se pudo eliminar el mensaje.');
      }
    });
  }
}
