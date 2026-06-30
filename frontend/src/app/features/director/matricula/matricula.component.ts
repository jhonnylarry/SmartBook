import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatriculaApiService } from '../../../core/api/matricula-api.service';
import { CursoApiService } from '../../../core/api/curso-api.service';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { AsignaturaDTO } from '../../../core/models/academico.model';
import { CursoDTO } from '../../../core/models/curso.model';
import { MatriculaCompletaResponse, Credencial } from '../../../core/models/matricula-completa.model';
import { StepperComponent, Step } from '../../../shared/ui/stepper/stepper.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

function rutValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value || value.trim() === '') return null;
  const rutPattern = /^\d{1,8}-[\dKk]$/;
  return rutPattern.test(value.trim()) ? null : { rutInvalido: true };
}

@Component({
  selector: 'app-matricula',
  standalone: true,
  imports: [ReactiveFormsModule, StepperComponent, SpinnerComponent],
  template: `
    <div class="space-y-6 animate-fadeIn max-w-4xl mx-auto">

      <!-- Encabezado -->
      <div>
        <h1 class="page-title">Proceso de Matrícula</h1>
        <p class="text-gray-500 text-sm mt-1">
          Complete los 4 pasos para registrar un nuevo estudiante con sus apoderados.
        </p>
      </div>

      @if (resultado()) {
        <!-- Pantalla de éxito: credenciales -->
        <div class="card animate-slideUp space-y-6">
          <div class="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow">✓</div>
            <div>
              <h2 class="text-lg font-bold text-green-900">¡Matrícula completada exitosamente!</h2>
              <p class="text-sm text-green-700">El estudiante <strong>{{ resultado()!.estudiante.nombre }} {{ resultado()!.estudiante.apellido }}</strong> ha sido matriculado.</p>
            </div>
          </div>

          <!-- Credenciales -->
          <div>
            <h3 class="section-title mb-4">Credenciales Generadas</h3>
            <p class="text-sm text-gray-500 mb-4">Entregue estas credenciales a los usuarios correspondientes. Las contraseñas temporales deberán ser cambiadas en el primer acceso.</p>

            <div class="grid gap-4">
              @for (cred of resultado()!.credenciales; track cred.rol) {
                <div class="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      [class]="cred.rol === 'ESTUDIANTE' ? 'bg-green-100 text-green-800' : 'bg-accent-100 text-accent-800'"
                    >
                      {{ cred.rol }}
                    </span>
                    <button
                      (click)="copiarCredencial(cred)"
                      class="text-xs text-primary-700 hover:text-primary-900 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-primary-50 transition-colors"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copiar
                    </button>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p class="text-xs text-gray-500 font-medium">Usuario</p>
                      <p class="text-sm font-mono font-semibold text-gray-900 mt-0.5">{{ cred.username }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 font-medium">Email</p>
                      <p class="text-sm font-mono font-semibold text-gray-900 mt-0.5">{{ cred.email }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 font-medium">Contraseña temporal</p>
                      <p class="text-sm font-mono font-semibold text-primary-800 mt-0.5 bg-primary-50 px-2 py-1 rounded">
                        {{ cred.passwordTemporal || '(ya establecida)' }}
                      </p>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Info matrícula -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <div>
              <p class="text-xs text-primary-600 font-medium">ID Matrícula</p>
              <p class="text-sm font-bold text-primary-900 mt-0.5">#{{ resultado()!.matricula.id }}</p>
            </div>
            <div>
              <p class="text-xs text-primary-600 font-medium">RUT Estudiante</p>
              <p class="text-sm font-bold text-primary-900 mt-0.5">{{ resultado()!.estudiante.rut }}</p>
            </div>
            <div>
              <p class="text-xs text-primary-600 font-medium">Estado</p>
              <p class="text-sm font-bold text-green-700 mt-0.5">{{ resultado()!.matricula.estado }}</p>
            </div>
            <div>
              <p class="text-xs text-primary-600 font-medium">Fecha</p>
              <p class="text-sm font-bold text-primary-900 mt-0.5">{{ formatFecha(resultado()!.matricula.fechaMatricula) }}</p>
            </div>
          </div>

          <button (click)="reiniciar()" class="btn-primary">
            Realizar otra matrícula
          </button>
        </div>

      } @else {

        <!-- Wizard -->
        <div class="card space-y-8">

          <!-- Stepper -->
          <app-stepper [steps]="pasos" [currentStep]="pasoActual()" />

          <hr class="border-gray-100" />

          <!-- Paso 1: Datos del estudiante -->
          @if (pasoActual() === 0) {
            <div class="animate-slideUp">
              <h2 class="section-title mb-1">Paso 1: Datos del Estudiante</h2>
              <p class="text-sm text-gray-500 mb-5">Ingrese la información personal del alumno.</p>

              <form [formGroup]="formEstudiante" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="label" for="est-nombre">Nombre *</label>
                  <input id="est-nombre" type="text" formControlName="nombre" class="input-field" [class.error]="esInvalido(formEstudiante, 'nombre')" placeholder="Juan Carlos" />
                  @if (esInvalido(formEstudiante, 'nombre')) { <p class="error-text">El nombre es obligatorio.</p> }
                </div>
                <div>
                  <label class="label" for="est-apellido">Apellido *</label>
                  <input id="est-apellido" type="text" formControlName="apellido" class="input-field" [class.error]="esInvalido(formEstudiante, 'apellido')" placeholder="Pérez Soto" />
                  @if (esInvalido(formEstudiante, 'apellido')) { <p class="error-text">El apellido es obligatorio.</p> }
                </div>
                <div>
                  <label class="label" for="est-rut">RUT</label>
                  <input id="est-rut" type="text" formControlName="rut" class="input-field" [class.error]="esInvalido(formEstudiante, 'rut')" placeholder="12345678-9" />
                  @if (esInvalido(formEstudiante, 'rut') && formEstudiante.get('rut')?.errors?.['rutInvalido']) {
                    <p class="error-text">Formato inválido. Use: 12345678-9</p>
                  }
                </div>
                <div>
                  <label class="label" for="est-nacimiento">Fecha de Nacimiento *</label>
                  <input id="est-nacimiento" type="date" formControlName="fechaNacimiento" class="input-field" [class.error]="esInvalido(formEstudiante, 'fechaNacimiento')" />
                  @if (esInvalido(formEstudiante, 'fechaNacimiento')) { <p class="error-text">La fecha de nacimiento es obligatoria.</p> }
                </div>
                <div>
                  <label class="label" for="est-email">Email *</label>
                  <input id="est-email" type="email" formControlName="email" class="input-field" [class.error]="esInvalido(formEstudiante, 'email')" placeholder="juan@ejemplo.com" />
                  @if (esInvalido(formEstudiante, 'email')) { <p class="error-text">Ingrese un email válido.</p> }
                </div>
                <div>
                  <label class="label" for="est-password">
                    Contraseña
                    <span class="text-xs text-gray-400 font-normal ml-1">(vacío = auto-generar)</span>
                  </label>
                  <input id="est-password" type="password" formControlName="password" class="input-field" placeholder="Dejar vacío para generar" autocomplete="new-password" />
                  @if (esInvalido(formEstudiante, 'password')) {
                    <p class="error-text">Mínimo 8 caracteres si se especifica.</p>
                  }
                </div>
              </form>
            </div>
          }

          <!-- Paso 2: Apoderado titular -->
          @if (pasoActual() === 1) {
            <div class="animate-slideUp">
              <h2 class="section-title mb-1">Paso 2: Apoderado Titular</h2>
              <p class="text-sm text-gray-500 mb-5">Datos del apoderado principal del estudiante.</p>

              <form [formGroup]="formApoderado" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="label">Nombre *</label>
                  <input type="text" formControlName="nombre" class="input-field" [class.error]="esInvalido(formApoderado, 'nombre')" placeholder="María" />
                  @if (esInvalido(formApoderado, 'nombre')) { <p class="error-text">El nombre es obligatorio.</p> }
                </div>
                <div>
                  <label class="label">Apellido *</label>
                  <input type="text" formControlName="apellido" class="input-field" [class.error]="esInvalido(formApoderado, 'apellido')" placeholder="Soto González" />
                  @if (esInvalido(formApoderado, 'apellido')) { <p class="error-text">El apellido es obligatorio.</p> }
                </div>
                <div>
                  <label class="label">RUT</label>
                  <input type="text" formControlName="rut" class="input-field" [class.error]="esInvalido(formApoderado, 'rut')" placeholder="12345678-9" />
                  @if (esInvalido(formApoderado, 'rut') && formApoderado.get('rut')?.errors?.['rutInvalido']) {
                    <p class="error-text">Formato inválido. Use: 12345678-9</p>
                  }
                </div>
                <div>
                  <label class="label">Email *</label>
                  <input type="email" formControlName="email" class="input-field" [class.error]="esInvalido(formApoderado, 'email')" placeholder="maria@ejemplo.com" />
                  @if (esInvalido(formApoderado, 'email')) { <p class="error-text">Ingrese un email válido.</p> }
                </div>
                <div>
                  <label class="label">Teléfono *</label>
                  <input type="tel" formControlName="telefono" class="input-field" [class.error]="esInvalido(formApoderado, 'telefono')" placeholder="+56 9 1234 5678" />
                  @if (esInvalido(formApoderado, 'telefono')) { <p class="error-text">El teléfono es obligatorio.</p> }
                </div>
                <div>
                  <label class="label">Parentesco *</label>
                  <select formControlName="parentesco" class="input-field" [class.error]="esInvalido(formApoderado, 'parentesco')">
                    <option value="">Seleccione...</option>
                    <option value="Madre">Madre</option>
                    <option value="Padre">Padre</option>
                    <option value="Abuelo/a">Abuelo/a</option>
                    <option value="Tío/a">Tío/a</option>
                    <option value="Tutor legal">Tutor legal</option>
                    <option value="Otro">Otro</option>
                  </select>
                  @if (esInvalido(formApoderado, 'parentesco')) { <p class="error-text">Seleccione el parentesco.</p> }
                </div>
                <div class="sm:col-span-2">
                  <label class="label">
                    Contraseña
                    <span class="text-xs text-gray-400 font-normal ml-1">(vacío = auto-generar)</span>
                  </label>
                  <input type="password" formControlName="password" class="input-field" placeholder="Dejar vacío para generar" autocomplete="new-password" />
                  @if (esInvalido(formApoderado, 'password')) {
                    <p class="error-text">Mínimo 8 caracteres si se especifica.</p>
                  }
                </div>
              </form>
            </div>
          }

          <!-- Paso 3: Tutor/Suplente -->
          @if (pasoActual() === 2) {
            <div class="animate-slideUp">
              <h2 class="section-title mb-1">Paso 3: Tutor / Apoderado Suplente</h2>
              <p class="text-sm text-gray-500 mb-5">Datos del apoderado secundario (suplente).</p>

              <form [formGroup]="formTutor" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="label">Nombre *</label>
                  <input type="text" formControlName="nombre" class="input-field" [class.error]="esInvalido(formTutor, 'nombre')" placeholder="Carlos" />
                  @if (esInvalido(formTutor, 'nombre')) { <p class="error-text">El nombre es obligatorio.</p> }
                </div>
                <div>
                  <label class="label">Apellido *</label>
                  <input type="text" formControlName="apellido" class="input-field" [class.error]="esInvalido(formTutor, 'apellido')" placeholder="Pérez Lagos" />
                  @if (esInvalido(formTutor, 'apellido')) { <p class="error-text">El apellido es obligatorio.</p> }
                </div>
                <div>
                  <label class="label">RUT</label>
                  <input type="text" formControlName="rut" class="input-field" [class.error]="esInvalido(formTutor, 'rut')" placeholder="12345678-9" />
                  @if (esInvalido(formTutor, 'rut') && formTutor.get('rut')?.errors?.['rutInvalido']) {
                    <p class="error-text">Formato inválido. Use: 12345678-9</p>
                  }
                </div>
                <div>
                  <label class="label">Email *</label>
                  <input type="email" formControlName="email" class="input-field" [class.error]="esInvalido(formTutor, 'email')" placeholder="carlos@ejemplo.com" />
                  @if (esInvalido(formTutor, 'email')) { <p class="error-text">Ingrese un email válido.</p> }
                </div>
                <div>
                  <label class="label">Teléfono *</label>
                  <input type="tel" formControlName="telefono" class="input-field" [class.error]="esInvalido(formTutor, 'telefono')" placeholder="+56 9 8765 4321" />
                  @if (esInvalido(formTutor, 'telefono')) { <p class="error-text">El teléfono es obligatorio.</p> }
                </div>
                <div>
                  <label class="label">Parentesco *</label>
                  <select formControlName="parentesco" class="input-field" [class.error]="esInvalido(formTutor, 'parentesco')">
                    <option value="">Seleccione...</option>
                    <option value="Madre">Madre</option>
                    <option value="Padre">Padre</option>
                    <option value="Abuelo/a">Abuelo/a</option>
                    <option value="Tío/a">Tío/a</option>
                    <option value="Tutor legal">Tutor legal</option>
                    <option value="Otro">Otro</option>
                  </select>
                  @if (esInvalido(formTutor, 'parentesco')) { <p class="error-text">Seleccione el parentesco.</p> }
                </div>
                <div class="sm:col-span-2">
                  <label class="label">
                    Contraseña
                    <span class="text-xs text-gray-400 font-normal ml-1">(vacío = auto-generar)</span>
                  </label>
                  <input type="password" formControlName="password" class="input-field" placeholder="Dejar vacío para generar" autocomplete="new-password" />
                  @if (esInvalido(formTutor, 'password')) {
                    <p class="error-text">Mínimo 8 caracteres si se especifica.</p>
                  }
                </div>
              </form>
            </div>
          }

          <!-- Paso 4: Curso + Revisión -->
          @if (pasoActual() === 3) {
            <div class="animate-slideUp space-y-6">
              <h2 class="section-title mb-1">Paso 4: Curso y Revisión Final</h2>
              <p class="text-sm text-gray-500">Seleccione el curso y revise los datos antes de confirmar.</p>

              <!-- Selección de curso -->
              <div>
                <label class="label" for="curso">Curso *</label>
                @if (loadingCursos()) {
                  <app-spinner size="sm" label="Cargando cursos..." />
                } @else {
                  <select
                    id="curso"
                    [formControl]="controlCurso"
                    class="input-field"
                    [class.error]="controlCurso.invalid && controlCurso.touched"
                  >
                    <option [ngValue]="null">Seleccione un curso...</option>
                    @for (curso of cursos(); track curso.id) {
                      <option [ngValue]="curso.id">{{ curso.nombre }} ({{ curso.anio }})</option>
                    }
                  </select>
                  @if (controlCurso.invalid && controlCurso.touched) {
                    <p class="error-text">Debe seleccionar un curso.</p>
                  }
                }
              </div>

              <!-- Asignaturas heredadas del curso -->
              @if (controlCurso.value) {
                <div class="p-4 rounded-xl border border-primary-100 bg-primary-50/50">
                  <p class="text-xs font-semibold text-primary-700 uppercase tracking-wider mb-2">
                    Asignaturas que heredará el alumno
                  </p>
                  @if (loadingAsignaturas()) {
                    <app-spinner size="sm" label="Cargando asignaturas..." />
                  } @else if (asignaturasHeredadas().length === 0) {
                    <p class="text-xs text-amber-600">⚠ Este curso aún no tiene asignaturas. Puedes agregarlas en Académico.</p>
                  } @else {
                    <div class="flex flex-wrap gap-2">
                      @for (a of asignaturasHeredadas(); track a.id) {
                        <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-primary-800 border border-primary-200">{{ a.nombre }}</span>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Resumen -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Estudiante</p>
                  <p class="text-sm font-semibold text-gray-900">{{ formEstudiante.value.nombre }} {{ formEstudiante.value.apellido }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ formEstudiante.value.email }}</p>
                  @if (formEstudiante.value.rut) {
                    <p class="text-xs text-gray-500">RUT: {{ formEstudiante.value.rut }}</p>
                  }
                </div>
                <div class="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Apoderado Titular</p>
                  <p class="text-sm font-semibold text-gray-900">{{ formApoderado.value.nombre }} {{ formApoderado.value.apellido }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ formApoderado.value.email }}</p>
                  <p class="text-xs text-gray-500">{{ formApoderado.value.parentesco }}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tutor Suplente</p>
                  <p class="text-sm font-semibold text-gray-900">{{ formTutor.value.nombre }} {{ formTutor.value.apellido }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ formTutor.value.email }}</p>
                  <p class="text-xs text-gray-500">{{ formTutor.value.parentesco }}</p>
                </div>
              </div>
            </div>
          }

          <!-- Navegación del wizard -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              @if (pasoActual() > 0) {
                <button
                  type="button"
                  (click)="retroceder()"
                  class="btn-secondary"
                  [disabled]="enviando()"
                >
                  Anterior
                </button>
              }
            </div>

            <div class="flex items-center gap-3">
              <span class="text-xs text-gray-400 font-medium">Paso {{ pasoActual() + 1 }} de {{ pasos.length }}</span>

              @if (pasoActual() < pasos.length - 1) {
                <button
                  type="button"
                  (click)="avanzar()"
                  class="btn-primary"
                >
                  Siguiente
                </button>
              } @else {
                <button
                  type="button"
                  (click)="enviar()"
                  class="btn-accent"
                  [disabled]="enviando()"
                >
                  @if (enviando()) {
                    <app-spinner size="sm" />
                    <span>Matriculando...</span>
                  } @else {
                    <span>Confirmar Matrícula</span>
                  }
                </button>
              }
            </div>
          </div>

        </div>
      }
    </div>
  `,
})
export class MatriculaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly matriculaApi = inject(MatriculaApiService);
  private readonly cursoApi = inject(CursoApiService);
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly toast = inject(ToastService);

  readonly pasoActual = signal(0);
  readonly enviando = signal(false);
  readonly loadingCursos = signal(true);
  readonly cursos = signal<CursoDTO[]>([]);
  readonly resultado = signal<MatriculaCompletaResponse | null>(null);
  readonly asignaturasHeredadas = signal<AsignaturaDTO[]>([]);
  readonly loadingAsignaturas = signal(false);

  readonly pasos: Step[] = [
    { label: 'Estudiante', description: 'Datos personales' },
    { label: 'Apoderado', description: 'Titular' },
    { label: 'Tutor', description: 'Suplente' },
    { label: 'Curso', description: 'Confirmación' },
  ];

  private readonly passwordOptionalValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value || value.trim() === '') return null;
    return value.length >= 8 ? null : { minlength: true };
  };

  readonly formEstudiante = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    rut: ['', [rutValidator]],
    fechaNacimiento: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [this.passwordOptionalValidator]],
  });

  readonly formApoderado = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    rut: ['', [rutValidator]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    parentesco: ['', [Validators.required]],
    password: ['', [this.passwordOptionalValidator]],
  });

  readonly formTutor = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    rut: ['', [rutValidator]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    parentesco: ['', [Validators.required]],
    password: ['', [this.passwordOptionalValidator]],
  });

  readonly controlCurso = this.fb.control<number | null>(null, [Validators.required]);

  ngOnInit(): void {
    this.cargarCursos();
    // Al elegir un curso, mostrar las asignaturas que el alumno heredará
    this.controlCurso.valueChanges.subscribe((idCurso) => this.cargarAsignaturasCurso(idCurso));
  }

  private cargarAsignaturasCurso(idCurso: number | null): void {
    if (!idCurso) {
      this.asignaturasHeredadas.set([]);
      return;
    }
    this.loadingAsignaturas.set(true);
    this.academicoApi.asignaturasPorCurso(idCurso).subscribe({
      next: (lista) => {
        this.asignaturasHeredadas.set(lista);
        this.loadingAsignaturas.set(false);
      },
      error: () => { this.asignaturasHeredadas.set([]); this.loadingAsignaturas.set(false); },
    });
  }

  private cargarCursos(): void {
    this.loadingCursos.set(true);
    this.cursoApi.listar().subscribe({
      next: (cursos) => {
        this.cursos.set(cursos);
        this.loadingCursos.set(false);
      },
      error: () => {
        this.toast.error('No se pudieron cargar los cursos.');
        this.loadingCursos.set(false);
      },
    });
  }

  esInvalido(form: FormGroup, campo: string): boolean {
    const control = form.get(campo);
    return !!(control?.invalid && control.touched);
  }

  private formsDelPaso(): FormGroup | null {
    const paso = this.pasoActual();
    if (paso === 0) return this.formEstudiante;
    if (paso === 1) return this.formApoderado;
    if (paso === 2) return this.formTutor;
    return null;
  }

  avanzar(): void {
    const form = this.formsDelPaso();
    if (form) {
      form.markAllAsTouched();
      if (form.invalid) return;
    }
    this.pasoActual.update((p) => Math.min(p + 1, this.pasos.length - 1));
  }

  retroceder(): void {
    this.pasoActual.update((p) => Math.max(p - 1, 0));
  }

  enviar(): void {
    this.controlCurso.markAsTouched();
    if (this.controlCurso.invalid || this.enviando()) return;

    const est = this.formEstudiante.getRawValue();
    const apo = this.formApoderado.getRawValue();
    const tut = this.formTutor.getRawValue();

    this.enviando.set(true);

    this.matriculaApi.matricularCompleta({
      estudiante: {
        nombre: est.nombre ?? '',
        apellido: est.apellido ?? '',
        rut: est.rut ?? '',
        fechaNacimiento: est.fechaNacimiento ?? '',
        email: est.email ?? '',
        password: est.password ?? '',
      },
      apoderadoTitular: {
        nombre: apo.nombre ?? '',
        apellido: apo.apellido ?? '',
        rut: apo.rut ?? '',
        email: apo.email ?? '',
        telefono: apo.telefono ?? '',
        parentesco: apo.parentesco ?? '',
        password: apo.password ?? '',
      },
      tutor: {
        nombre: tut.nombre ?? '',
        apellido: tut.apellido ?? '',
        rut: tut.rut ?? '',
        email: tut.email ?? '',
        telefono: tut.telefono ?? '',
        parentesco: tut.parentesco ?? '',
        password: tut.password ?? '',
      },
      idCurso: this.controlCurso.value ?? 0,
    }).subscribe({
      next: (res) => {
        this.enviando.set(false);
        this.resultado.set(res);
        this.toast.success('Matrícula realizada exitosamente.');
      },
      error: () => {
        this.enviando.set(false);
      },
    });
  }

  copiarCredencial(cred: Credencial): void {
    const texto = `Rol: ${cred.rol}\nUsuario: ${cred.username}\nEmail: ${cred.email}\nContraseña: ${cred.passwordTemporal ?? '(ya establecida)'}`;
    navigator.clipboard.writeText(texto).then(() => {
      this.toast.success('Credencial copiada al portapapeles.');
    }).catch(() => {
      this.toast.warning('No se pudo copiar al portapapeles.');
    });
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '--';
    return new Date(fecha).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  reiniciar(): void {
    this.resultado.set(null);
    this.pasoActual.set(0);
    this.formEstudiante.reset();
    this.formApoderado.reset();
    this.formTutor.reset();
    this.controlCurso.reset();
  }
}
