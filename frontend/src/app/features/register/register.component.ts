import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Rol } from '../../core/auth/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected cargando = signal(false);
  protected errorMsg = signal<string | null>(null);

  protected readonly roles: Rol[] = [
    'ADMINISTRADOR', 'DIRECTOR', 'DOCENTE', 'INSPECTOR',
    'ADMINISTRATIVO', 'APODERADO', 'ESTUDIANTE'
  ];

  protected form = new FormGroup({
    username: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    }),
    rol: new FormControl<Rol>('DOCENTE', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.errorMsg.set(null);

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/']);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        const status = (err as { status?: number }).status;
        if (status === 409) {
          this.errorMsg.set('El usuario o email ya existe.');
        } else {
          this.errorMsg.set('Error al registrar. Intenta nuevamente.');
        }
      }
    });
  }
}
