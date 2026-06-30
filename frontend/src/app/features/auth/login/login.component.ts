import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerComponent],
  template: `
    <!-- Fondo aurora animado -->
    <div class="min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
      style="background: linear-gradient(135deg, #0d1b33 0%, #13294B 40%, #1E3A8A 100%);">

      <!-- Blobs de aurora flotantes -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <!-- Blob principal ámbar -->
        <div
          class="absolute animate-aurora"
          style="width: 600px; height: 600px; top: -150px; right: -150px;
                 background: radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%);
                 filter: blur(60px);"
        ></div>
        <!-- Blob azul izquierda -->
        <div
          class="absolute animate-aurora"
          style="width: 500px; height: 500px; bottom: -100px; left: -100px;
                 background: radial-gradient(circle, rgba(37,71,160,0.25) 0%, transparent 70%);
                 filter: blur(50px); animation-delay: -2.5s; animation-duration: 10s;"
        ></div>
        <!-- Blob ámbar pequeño centro -->
        <div
          class="absolute animate-aurora"
          style="width: 300px; height: 300px; top: 50%; left: 30%;
                 background: radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%);
                 filter: blur(40px); animation-delay: -5s; animation-duration: 12s;"
        ></div>
        <!-- Partículas/puntos decorativos -->
        <div class="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-accent-400/40 animate-pulse"></div>
        <div class="absolute top-3/4 right-1/3 w-1.5 h-1.5 rounded-full bg-accent-300/30 animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute top-1/2 left-3/4 w-1 h-1 rounded-full bg-primary-400/40 animate-pulse" style="animation-delay: 2s;"></div>
      </div>

      <!-- Card glass centrada -->
      <div class="relative w-full max-w-md animate-scaleIn">
        <div
          class="rounded-2xl overflow-hidden"
          style="background: rgba(255,255,255,0.94); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
                 border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 24px 80px rgba(2,6,23,0.40);"
        >
          <!-- Encabezado institucional con gradiente navy -->
          <div
            class="relative px-8 py-8 text-center overflow-hidden"
            style="background: linear-gradient(135deg, #13294B 0%, #1E3A8A 60%, #2547A0 100%);"
          >
            <!-- Textura sutil de fondo del header -->
            <div class="absolute inset-0 pointer-events-none"
              style="background: radial-gradient(circle at 80% 20%, rgba(245,158,11,0.12) 0%, transparent 50%);"></div>

            <!-- Escudo CBO con borde ámbar -->
            <div class="relative flex justify-center mb-5">
              <div
                class="relative w-20 h-20 rounded-full flex items-center justify-center"
                style="background: rgba(255,255,255,0.08); border: 2px solid rgba(245,158,11,0.5); box-shadow: 0 0 30px rgba(245,158,11,0.15);"
              >
                <img
                  src="assets/logo-cbo.svg"
                  alt="Escudo Colegio Bernardo O'Higgins"
                  class="w-16 h-16"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
                />
                <div class="hidden w-full h-full items-center justify-center">
                  <span class="text-accent-400 font-black text-2xl tracking-tight">CBO</span>
                </div>
                <!-- Anillo exterior -->
                <div class="absolute inset-0 rounded-full border border-white/10 scale-110"></div>
              </div>
            </div>

            <h1 class="text-white font-bold text-xl tracking-wide leading-tight">
              Colegio Bernardo O'Higgins
            </h1>
            <p class="text-white/60 text-xs mt-1.5 font-medium tracking-widest uppercase">
              Sistema SmartBook
            </p>
            <!-- Línea ámbar decorativa -->
            <div class="mt-4 flex items-center justify-center gap-2">
              <div class="h-px w-8 bg-accent-400/40 rounded-full"></div>
              <div class="h-1 w-6 rounded-full bg-accent-400"></div>
              <div class="h-px w-8 bg-accent-400/40 rounded-full"></div>
            </div>
          </div>

          <!-- Formulario -->
          <div class="px-8 py-8">
            <div class="mb-7 text-center">
              <h2 class="text-slate-900 font-bold text-xl">Iniciar Sesión</h2>
              <p class="text-slate-500 text-sm mt-1.5">Ingrese sus credenciales para continuar</p>
            </div>

            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>

              <!-- Error global -->
              @if (errorMessage()) {
                <div class="mb-5 px-4 py-3 rounded-xl border border-red-200 flex items-start gap-3 animate-fadeInUp"
                  style="background: rgba(239,68,68,0.05);">
                  <div class="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg class="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <p class="text-sm text-red-700 font-medium">{{ errorMessage() }}</p>
                </div>
              }

              <!-- Campo usuario con floating label -->
              <div class="mb-5">
                <label for="username" class="label">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Usuario
                  </span>
                </label>
                <input
                  id="username"
                  type="text"
                  formControlName="username"
                  class="input-field"
                  [class.error]="isInvalid('username')"
                  placeholder="nombre.usuario"
                  autocomplete="username"
                  aria-describedby="username-error"
                />
                @if (isInvalid('username')) {
                  <p id="username-error" class="error-text" role="alert">
                    <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    El nombre de usuario es obligatorio.
                  </p>
                }
              </div>

              <!-- Campo contraseña con toggle -->
              <div class="mb-7">
                <label for="password" class="label">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Contraseña
                  </span>
                </label>
                <div class="relative">
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    class="input-field pr-11"
                    [class.error]="isInvalid('password')"
                    placeholder="••••••••"
                    autocomplete="current-password"
                    aria-describedby="password-error"
                  />
                  <button
                    type="button"
                    (click)="togglePassword()"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600
                           transition-colors focus-visible:outline-none"
                    [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  >
                    @if (showPassword()) {
                      <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    } @else {
                      <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                  </button>
                </div>
                @if (isInvalid('password')) {
                  <p id="password-error" class="error-text" role="alert">
                    <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    La contraseña es obligatoria.
                  </p>
                }
              </div>

              <!-- Botón con estado loading -->
              <button
                type="submit"
                class="btn-primary w-full justify-center py-3 text-sm"
                [disabled]="loading()"
              >
                @if (loading()) {
                  <app-spinner size="sm" />
                  <span>Verificando credenciales…</span>
                } @else {
                  <!-- Icono login -->
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  <span>Ingresar al sistema</span>
                }
              </button>

            </form>
          </div>

          <!-- Footer -->
          <div class="px-8 py-4 border-t border-slate-100 text-center"
            style="background: rgba(248,250,252,0.5);">
            <p class="text-xs text-slate-400">
              SmartBook &copy; {{ currentYear }} — Colegio Bernardo O'Higgins
            </p>
          </div>
        </div>

        <!-- Texto decorativo bajo la card -->
        <p class="text-center mt-5 text-white/30 text-xs tracking-widest uppercase">
          Acceso exclusivo personal autorizado
        </p>
      </div>
    </div>
  `,
  styles: [`
    .w-4\\.5 { width: 1.125rem; }
    .h-4\\.5 { height: 1.125rem; }
  `],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly currentYear = new Date().getFullYear();

  readonly loading = signal(false);
  readonly errorMessage = signal<string>('');
  readonly showPassword = signal(false);

  readonly form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control.touched);
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    const { username, password } = this.form.getRawValue();
    if (!username || !password) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.login({ username, password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        const rol = res.usuario.rol;
        if (rol === 'DOCENTE') {
          this.router.navigate(['/docente']);
        } else if (rol === 'ADMINISTRADOR' || rol === 'DIRECTOR') {
          this.router.navigate(['/director']);
        } else if (rol === 'ESTUDIANTE') {
          this.router.navigate(['/estudiante']);
        } else if (rol === 'ADMINISTRATIVO') {
          this.router.navigate(['/administrativo']);
        } else if (rol === 'APODERADO') {
          this.router.navigate(['/apoderado']);
        } else {
          // Roles sin workspace propio aún (Inspector)
          this.router.navigate(['/login']);
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Credenciales incorrectas. Verifique su usuario y contraseña.');
      },
    });
  }
}
