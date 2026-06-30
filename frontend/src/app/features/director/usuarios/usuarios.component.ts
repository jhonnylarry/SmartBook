import { Component, inject, signal, computed, OnInit, TemplateRef, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { UsuarioApiService } from '../../../core/api/usuario-api.service';
import { Usuario, Rol, UpdateUsuarioRequest } from '../../../core/models/usuario.model';
import { DataTableComponent, TableColumn } from '../../../shared/ui/data-table/data-table.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AuthService } from '../../../core/auth/auth.service';

const ROLES: Rol[] = ['ADMINISTRADOR', 'DIRECTOR', 'DOCENTE', 'INSPECTOR', 'ADMINISTRATIVO', 'APODERADO', 'ESTUDIANTE'];

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DataTableComponent, ModalComponent, SpinnerComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="page-title">{{ auth.canManageUsuarios() ? 'Gestión de Usuarios' : 'Usuarios' }}</h1>
          <p class="text-slate-500 text-sm mt-1">
            {{ auth.canManageUsuarios() ? 'Administre las cuentas de acceso al sistema.' : 'Consulte las cuentas de acceso al sistema.' }}
          </p>
        </div>
        @if (auth.canCreateUsuarios()) {
          <button (click)="abrirModalCrear()" class="btn-primary self-start sm:self-auto">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Usuario
          </button>
        }
      </div>

      <!-- Filtros -->
      <div class="card p-4 shrink-0">
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            [(ngModel)]="filtroTexto"
            (ngModelChange)="filtrar()"
            placeholder="Buscar por usuario o email..."
            class="input-field flex-1"
          />
          <select [(ngModel)]="filtroRol" (ngModelChange)="filtrar()" class="input-field sm:w-48">
            <option value="">Todos los roles</option>
            @for (rol of roles; track rol) {
              <option [value]="rol">{{ rolLabel(rol) }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Tabla (ocupa el alto restante) -->
      <div class="flex-1 min-h-0">
        <app-data-table
          class="block h-full"
          [columns]="columnas"
          [rows]="usuariosFiltrados()"
          [loading]="loading()"
          emptyMessage="No hay usuarios registrados."
          [actionsTemplate]="auth.canManageUsuarios() ? (accionesRef() ?? null) : null"
        />
      </div>

      <!-- Template de acciones -->
      <ng-template #acciones let-row>
        <div class="flex items-center justify-end gap-2">
          <button
            (click)="abrirModalEditar(row)"
            class="text-xs px-2.5 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium transition-colors border border-primary-200"
          >
            Editar
          </button>
          <button
            (click)="toggleActivo(row)"
            class="text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors border"
            [class]="row['activo'] ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200' : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'"
          >
            {{ row['activo'] ? 'Desactivar' : 'Activar' }}
          </button>
        </div>
      </ng-template>

    </div>

    <!-- Modal crear -->
    <app-modal
      [open]="modalCrear()"
      title="Crear Nuevo Usuario"
      (closed)="cerrarModalCrear()"
    >
      <form [formGroup]="formCrear" (ngSubmit)="crearUsuario()" class="space-y-4">
        <div>
          <label class="label">Nombre de usuario *</label>
          <input type="text" formControlName="username" class="input-field" [class.error]="esInvalido(formCrear, 'username')" placeholder="nombre.usuario" />
          @if (esInvalido(formCrear, 'username')) { <p class="error-text">Máximo 50 caracteres, obligatorio.</p> }
        </div>
        <div>
          <label class="label">Email *</label>
          <input type="email" formControlName="email" class="input-field" [class.error]="esInvalido(formCrear, 'email')" placeholder="usuario@colegio.cl" />
          @if (esInvalido(formCrear, 'email')) { <p class="error-text">Ingrese un email válido.</p> }
        </div>
        <div>
          <label class="label">Contraseña * <span class="text-xs text-gray-400 font-normal">(8-100 chars)</span></label>
          <input type="password" formControlName="password" class="input-field" [class.error]="esInvalido(formCrear, 'password')" autocomplete="new-password" />
          @if (esInvalido(formCrear, 'password')) { <p class="error-text">Mínimo 8, máximo 100 caracteres.</p> }
        </div>
        <div>
          <label class="label">Rol *</label>
          <select formControlName="rol" class="input-field" [class.error]="esInvalido(formCrear, 'rol')">
            <option value="">Seleccione un rol...</option>
            @for (rol of rolesCreables(); track rol) {
              <option [value]="rol">{{ rolLabel(rol) }}</option>
            }
          </select>
          @if (esInvalido(formCrear, 'rol')) { <p class="error-text">Seleccione un rol.</p> }
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" (click)="cerrarModalCrear()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="guardando()">
            @if (guardando()) { <app-spinner size="sm" /> }
            Crear Usuario
          </button>
        </div>
      </form>
    </app-modal>

    <!-- Modal editar -->
    <app-modal
      [open]="modalEditar()"
      title="Editar Usuario"
      (closed)="cerrarModalEditar()"
    >
      @if (usuarioEditando()) {
        <div class="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p class="text-sm font-semibold text-gray-900">{{ usuarioEditando()!.username }}</p>
          <p class="text-xs text-gray-500">{{ usuarioEditando()!.email }}</p>
        </div>
        <form [formGroup]="formEditar" (ngSubmit)="actualizarUsuario()" class="space-y-4">
          <div>
            <label class="label">Nuevo Email</label>
            <input type="email" formControlName="email" class="input-field" [class.error]="esInvalido(formEditar, 'email')" />
            @if (esInvalido(formEditar, 'email')) { <p class="error-text">Ingrese un email válido.</p> }
          </div>
          <div>
            <label class="label">Nueva Contraseña <span class="text-xs text-gray-400 font-normal">(vacío = no cambiar)</span></label>
            <input type="password" formControlName="password" class="input-field" autocomplete="new-password" />
            @if (esInvalido(formEditar, 'password')) { <p class="error-text">Mínimo 8 caracteres.</p> }
          </div>
          <div>
            <label class="label">Rol</label>
            <select formControlName="rol" class="input-field">
              @for (rol of roles; track rol) {
                <option [value]="rol">{{ rolLabel(rol) }}</option>
              }
            </select>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" (click)="cerrarModalEditar()" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary" [disabled]="guardando()">
              @if (guardando()) { <app-spinner size="sm" /> }
              Guardar Cambios
            </button>
          </div>
        </form>
      }
    </app-modal>
  `,
})
export class UsuariosComponent implements OnInit {
  private readonly usuarioApi = inject(UsuarioApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  accionesRef = viewChild<TemplateRef<unknown>>('acciones');

  readonly loading = signal(false);
  readonly guardando = signal(false);
  readonly modalCrear = signal(false);
  readonly modalEditar = signal(false);
  readonly usuarioEditando = signal<Usuario | null>(null);

  private readonly _usuarios = signal<Record<string, unknown>[]>([]);
  readonly usuariosFiltrados = signal<Record<string, unknown>[]>([]);

  filtroTexto = '';
  filtroRol = '';

  readonly roles: Rol[] = ROLES;

  /** Roles que el usuario actual puede asignar al crear una cuenta: un no-ADMINISTRADOR no crea ADMINISTRADOR/DIRECTOR. */
  readonly rolesCreables = computed<Rol[]>(() =>
    this.auth.hasRole('ADMINISTRADOR')
      ? this.roles
      : this.roles.filter((r) => r !== 'ADMINISTRADOR' && r !== 'DIRECTOR'),
  );

  readonly columnas: TableColumn[] = [
    { key: 'username', label: 'Usuario' },
    { key: 'email', label: 'Email' },
    { key: 'rol', label: 'Rol', render: (v) => this.rolLabel(v as string) },
    { key: 'activo', label: 'Estado', render: (v) => (v ? 'Activo' : 'Inactivo') },
    { key: 'fechaCreacion', label: 'Creado', render: (v) => this.formatFecha(v as string) },
  ];

  readonly formCrear = this.fb.group({
    username: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    rol: ['', [Validators.required]],
  });

  readonly formEditar = this.fb.group({
    email: ['', [Validators.email]],
    password: ['', [Validators.minLength(8)]],
    rol: [''],
  });

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  private cargarUsuarios(): void {
    this.loading.set(true);
    this.usuarioApi.listar().subscribe({
      next: (usuarios) => {
        const rows = usuarios.map((u) => ({ ...u } as unknown as Record<string, unknown>));
        this._usuarios.set(rows);
        this.usuariosFiltrados.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  filtrar(): void {
    const texto = this.filtroTexto.toLowerCase();
    const rol = this.filtroRol;
    const filtrados = this._usuarios().filter((u) => {
      const matchTexto = !texto ||
        String(u['username']).toLowerCase().includes(texto) ||
        String(u['email']).toLowerCase().includes(texto);
      const matchRol = !rol || u['rol'] === rol;
      return matchTexto && matchRol;
    });
    this.usuariosFiltrados.set(filtrados);
  }

  abrirModalCrear(): void {
    this.formCrear.reset();
    this.modalCrear.set(true);
  }

  cerrarModalCrear(): void {
    this.modalCrear.set(false);
  }

  crearUsuario(): void {
    this.formCrear.markAllAsTouched();
    if (this.formCrear.invalid || this.guardando()) return;
    const v = this.formCrear.getRawValue();
    this.guardando.set(true);
    this.usuarioApi.crear({
      username: v.username ?? '',
      email: v.email ?? '',
      password: v.password ?? '',
      rol: (v.rol ?? '') as Rol,
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModalCrear();
        this.toast.success('Usuario creado exitosamente.');
        this.cargarUsuarios();
      },
      error: () => { this.guardando.set(false); },
    });
  }

  abrirModalEditar(row: Record<string, unknown>): void {
    const usuario = row as unknown as Usuario;
    this.usuarioEditando.set(usuario);
    this.formEditar.patchValue({ email: usuario.email, password: '', rol: usuario.rol });
    this.modalEditar.set(true);
  }

  cerrarModalEditar(): void {
    this.modalEditar.set(false);
    this.usuarioEditando.set(null);
  }

  actualizarUsuario(): void {
    this.formEditar.markAllAsTouched();
    if (this.formEditar.invalid || this.guardando()) return;
    const usuario = this.usuarioEditando();
    if (!usuario) return;
    const v = this.formEditar.getRawValue();
    const body: UpdateUsuarioRequest = {};
    if (v.email) body.email = v.email;
    if (v.password) body.password = v.password;
    if (v.rol) body.rol = v.rol as Rol;
    this.guardando.set(true);
    this.usuarioApi.actualizar(usuario.id, body).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModalEditar();
        this.toast.success('Usuario actualizado.');
        this.cargarUsuarios();
      },
      error: () => { this.guardando.set(false); },
    });
  }

  toggleActivo(row: Record<string, unknown>): void {
    const usuario = row as unknown as Usuario;
    this.usuarioApi.actualizar(usuario.id, { activo: !usuario.activo }).subscribe({
      next: () => {
        this.toast.success(usuario.activo ? 'Usuario desactivado.' : 'Usuario activado.');
        this.cargarUsuarios();
      },
    });
  }

  esInvalido(form: FormGroup, campo: string): boolean {
    const control = form.get(campo);
    return !!(control?.invalid && control.touched);
  }

  rolLabel(rol: string): string {
    const labels: Record<string, string> = {
      ADMINISTRADOR: 'Administrador', DIRECTOR: 'Director', DOCENTE: 'Docente',
      INSPECTOR: 'Inspector', ADMINISTRATIVO: 'Administrativo', APODERADO: 'Apoderado', ESTUDIANTE: 'Estudiante',
    };
    return labels[rol] ?? rol;
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '--';
    return new Date(fecha).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
