import { Component, inject, signal, OnInit, input } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EstudiantesService } from './estudiantes.service';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-estudiante-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingComponent],
  templateUrl: './estudiante-form.component.html'
})
export class EstudianteFormComponent implements OnInit {
  // Recibe ID via route param cuando es edicion
  readonly id = input<string | undefined>(undefined);

  private readonly service = inject(EstudiantesService);
  private readonly router = inject(Router);

  protected cargando = signal(false);
  protected guardando = signal(false);
  protected error = signal<string | null>(null);
  protected esEdicion = signal(false);

  protected form = new FormGroup({
    nombre: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
    }),
    apellido: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
    }),
    rut: new FormControl<string>('', { nonNullable: true }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)]
    }),
    fechaNacimiento: new FormControl<string>('', { nonNullable: true })
  });

  ngOnInit(): void {
    const idStr = this.id();
    if (idStr) {
      this.esEdicion.set(true);
      this.cargarEstudiante(Number(idStr));
    }
  }

  private cargarEstudiante(id: number): void {
    this.cargando.set(true);
    this.service.obtener(id).subscribe({
      next: est => {
        this.form.patchValue({
          nombre: est.nombre,
          apellido: est.apellido,
          rut: est.rut ?? '',
          email: est.email ?? '',
          fechaNacimiento: est.fechaNacimiento ?? ''
        });
        this.form.controls.password.disable();
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar los datos del estudiante.');
        this.cargando.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set(null);

    const { password, ...rest } = this.form.getRawValue();
    const idStr = this.id();
    const payload = this.esEdicion() ? rest : { ...rest, password };
    const op$ = idStr
      ? this.service.actualizar(Number(idStr), payload)
      : this.service.crear(payload);

    op$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.form.controls.password.reset();
        this.router.navigate(['/estudiantes']);
      },
      error: (err: { status?: number }) => {
        this.guardando.set(false);
        if (err?.status === 409) {
          this.error.set('Este email ya está registrado. Usa otro.');
        } else {
          this.error.set('No se pudo guardar el estudiante. Verifica los datos.');
        }
      }
    });
  }
}
