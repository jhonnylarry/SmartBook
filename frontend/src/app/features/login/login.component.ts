import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected cargando = signal(false);
  protected errorMsg = signal<string | null>(null);
  protected shake = signal(false);

  protected form = new FormGroup({
    username: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4)]
    })
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.errorMsg.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/']);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        const status = (err as { status?: number }).status;
        if (status === 401) {
          this.errorMsg.set('Credenciales incorrectas. Verifica tu usuario y contrasena.');
        } else {
          this.errorMsg.set('Error de conexion. Intenta nuevamente.');
        }
        // Shake animation
        this.shake.set(true);
        setTimeout(() => this.shake.set(false), 450);
      }
    });
  }

  get usernameCtrl() { return this.form.controls.username; }
  get passwordCtrl() { return this.form.controls.password; }
}
