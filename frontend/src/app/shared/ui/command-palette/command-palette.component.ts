import {
  Component,
  inject,
  signal,
  computed,
  ElementRef,
  HostListener,
  OnInit,
  AfterViewInit,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandPaletteService } from './command-palette.service';
import { AuthService } from '../../../core/auth/auth.service';

interface PaletteCommand {
  id: string;
  group: 'Navegación' | 'Acciones rápidas';
  title: string;
  description: string;
  icon: string; // SVG path d=""
  iconBg: string;   // clase Tailwind para fondo del ícono
  iconColor: string; // clase Tailwind para color del ícono
  shortcut?: string;
  requiresUsuarios?: boolean; // visible solo si el rol puede ver usuarios
  action: () => void;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- (El FAB de acciones rápidas se quitó; el command palette se abre con Ctrl+K / ⌘K) -->

    <!-- Overlay + Panel -->
    @if (palette.isOpen()) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
        (click)="onBackdropClick($event)"
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette — Acciones rápidas"
      >
        <!-- Fondo difuminado -->
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"></div>

        <!-- Panel -->
        <div
          #panelRef
          class="relative w-full max-w-xl rounded-2xl overflow-hidden animate-scaleIn z-10"
          style="background: rgba(255,255,255,0.94); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 20px 60px rgba(2,6,23,0.22);"
          (click)="$event.stopPropagation()"
        >
          <!-- Input de búsqueda -->
          <div class="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
            <svg class="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              #searchInput
              type="text"
              [(ngModel)]="query"
              (ngModelChange)="onQueryChange()"
              (keydown)="onKeydown($event)"
              placeholder="Buscar acciones…"
              class="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              autocomplete="off"
              spellcheck="false"
            />
            <kbd class="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold text-slate-500 border border-slate-200 bg-white">Esc</kbd>
          </div>

          <!-- Lista de comandos -->
          <div class="overflow-y-auto max-h-80 scrollbar-thin py-2">

            @if (filteredGroups().length === 0) {
              <!-- Estado vacío -->
              <div class="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                </div>
                <p class="text-sm font-medium text-slate-600">Sin resultados para "{{ query }}"</p>
                <p class="text-xs text-slate-400 mt-1">Intenta con otro término</p>
              </div>
            } @else {
              @for (group of filteredGroups(); track group.name) {
                <!-- Encabezado de grupo -->
                <div class="px-4 pt-3 pb-1">
                  <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{{ group.name }}</p>
                </div>

                @for (cmd of group.commands; track cmd.id) {
                  <!-- Fila de comando -->
                  <button
                    type="button"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 group relative"
                    [class.bg-primary-50]="activeIndex() === cmd._flatIndex"
                    [class.ring-inset]="activeIndex() === cmd._flatIndex"
                    (click)="execute(cmd)"
                    (mouseenter)="activeIndex.set(cmd._flatIndex)"
                  >
                    <!-- Indicador de selección -->
                    @if (activeIndex() === cmd._flatIndex) {
                      <div class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-accent-500"></div>
                    }

                    <!-- Icono -->
                    <div
                      class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      [class]="cmd.iconBg"
                    >
                      <svg class="w-4.5 h-4.5" [class]="cmd.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="cmd.icon" />
                      </svg>
                    </div>

                    <!-- Texto -->
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-slate-900 truncate">{{ cmd.title }}</p>
                      <p class="text-xs text-slate-400 truncate mt-0.5">{{ cmd.description }}</p>
                    </div>

                    <!-- Hint -->
                    <div class="shrink-0 flex items-center gap-1">
                      @if (cmd.shortcut) {
                        <kbd class="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 border border-slate-200 bg-white">{{ cmd.shortcut }}</kbd>
                      } @else {
                        <kbd class="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 border border-slate-200 bg-white">↵</kbd>
                      }
                    </div>
                  </button>
                }
              }
            }
          </div>

          <!-- Footer -->
          <div class="border-t border-slate-100 px-4 py-2 flex items-center gap-4 text-xs text-slate-400">
            <span class="flex items-center gap-1"><kbd class="font-mono">↑↓</kbd> navegar</span>
            <span class="flex items-center gap-1"><kbd class="font-mono">↵</kbd> ejecutar</span>
            <span class="flex items-center gap-1"><kbd class="font-mono">Esc</kbd> cerrar</span>
          </div>
        </div>
      </div>
    }
  `,
})
export class CommandPaletteComponent implements OnInit, AfterViewInit {
  readonly palette = inject(CommandPaletteService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  query = '';
  readonly activeIndex = signal(0);

  // Todos los comandos disponibles
  private readonly allCommands: PaletteCommand[] = [
    {
      id: 'nav-dashboard',
      group: 'Navegación',
      title: 'Ir al Dashboard',
      description: 'Panel de control principal del Director',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-700',
      action: () => this.navigate('/director/dashboard'),
    },
    {
      id: 'nav-estudiantes',
      group: 'Navegación',
      title: 'Ver Estudiantes',
      description: 'Listado completo de estudiantes matriculados',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-700',
      action: () => this.navigate('/director/estudiantes'),
    },
    {
      id: 'nav-academico',
      group: 'Navegación',
      title: 'Ver Académico',
      description: 'Cursos, asignaturas, evaluaciones y notas',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-700',
      action: () => this.navigate('/director/academico'),
    },
    {
      id: 'nav-anotaciones',
      group: 'Navegación',
      title: 'Ver Anotaciones',
      description: 'Registro conductual de estudiantes',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-700',
      action: () => this.navigate('/director/anotaciones'),
    },
    {
      id: 'nav-hoja-vida',
      group: 'Navegación',
      title: 'Ver Hoja de Vida',
      description: 'Antecedentes y documentos del alumno',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-700',
      action: () => this.navigate('/director/hoja-vida'),
    },
    {
      id: 'nav-calendario',
      group: 'Navegación',
      title: 'Ver Calendario',
      description: 'Eventos y calendario escolar',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-700',
      action: () => this.navigate('/director/calendario'),
    },
    {
      id: 'nav-materias',
      group: 'Navegación',
      title: 'Ver Materias',
      description: 'Catálogo de asignaturas por nivel de enseñanza',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-700',
      action: () => this.navigate('/director/materias'),
    },
    {
      id: 'nav-usuarios',
      group: 'Navegación',
      title: 'Ver Usuarios',
      description: 'Consultar cuentas del sistema',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      iconBg: 'bg-accent-100',
      iconColor: 'text-accent-700',
      requiresUsuarios: true,
      action: () => this.navigate('/director/usuarios'),
    },
    {
      id: 'action-matricula',
      group: 'Acciones rápidas',
      title: 'Matricular alumno nuevo',
      description: 'Iniciar proceso de matrícula completo',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700',
      action: () => this.navigate('/director/matricula'),
    },
    {
      id: 'action-crear-usuario',
      group: 'Acciones rápidas',
      title: 'Crear usuario',
      description: 'Ir a usuarios para crear una cuenta nueva',
      icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-700',
      requiresUsuarios: true,
      action: () => this.navigate('/director/usuarios'),
    },
  ];

  // Índice plano asignado a cada comando para navegación por teclado
  private flatCommands: (PaletteCommand & { _flatIndex: number })[] = [];

  readonly filteredGroups = computed(() => {
    // Comandos disponibles según las capacidades del rol
    const available = this.allCommands.filter(
      (c) => !c.requiresUsuarios || this.auth.canViewUsuarios()
    );
    const q = this.query.toLowerCase().trim();
    const filtered = q
      ? available.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q)
        )
      : available;

    // Asignar índices planos
    let idx = 0;
    this.flatCommands = filtered.map((c) => ({ ...c, _flatIndex: idx++ }));

    // Agrupar
    const groups: Record<string, (PaletteCommand & { _flatIndex: number })[]> = {};
    for (const cmd of this.flatCommands) {
      if (!groups[cmd.group]) groups[cmd.group] = [];
      groups[cmd.group].push(cmd);
    }

    return Object.entries(groups).map(([name, commands]) => ({ name, commands }));
  });

  ngOnInit(): void {
    // Resetear al abrir/cerrar
  }

  ngAfterViewInit(): void {
    // Autofocus se maneja vía la reactividad del template
  }

  // Ctrl+K / Cmd+K global
  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.palette.toggle();
      if (this.palette.isOpen()) {
        this.resetState();
        requestAnimationFrame(() => this.searchInput()?.nativeElement.focus());
      }
    }
    if (event.key === 'Escape' && this.palette.isOpen()) {
      this.close();
    }
  }

  onQueryChange(): void {
    this.activeIndex.set(0);
  }

  onKeydown(event: KeyboardEvent): void {
    const total = this.flatCommands.length;
    if (total === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.min(i + 1, total - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const active = this.flatCommands[this.activeIndex()];
      if (active) this.execute(active);
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  execute(cmd: PaletteCommand): void {
    this.close();
    cmd.action();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  close(): void {
    this.palette.close();
    this.resetState();
  }

  private navigate(route: string): void {
    this.router.navigate([route]);
  }

  private resetState(): void {
    this.query = '';
    this.activeIndex.set(0);
  }
}
