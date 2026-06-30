import { Component, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { UsageTrackingService } from '../../../core/usage/usage-tracking.service';
import { BadgeRolComponent } from '../../../shared/ui/badge-rol/badge-rol.component';
import { ToastContainerComponent } from '../../../shared/ui/toast/toast.component';
import { CampanaNotificacionesComponent } from '../../../shared/ui/campana-notificaciones/campana-notificaciones.component';

interface NavItem {
  label: string;
  route: string;
  svgPath: string;
  description: string;
  gradFrom: string;
  gradTo: string;
  cap?: 'usuarios';
}

@Component({
  selector: 'app-administrativo-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    BadgeRolComponent,
    ToastContainerComponent,
    CampanaNotificacionesComponent,
  ],
  template: `
    <div class="flex flex-col h-screen overflow-hidden" style="background: var(--color-surface);">

      <!-- ══════════════ TOPBAR ══════════════ -->
      <header
        class="shrink-0 z-20 sticky top-0 border-b border-slate-200/60"
        style="background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); box-shadow: 0 1px 12px rgba(0,0,0,0.06);"
      >
        <div class="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

          <!-- ── Marca ── -->
          <a routerLink="/administrativo/estudiantes" class="flex items-center gap-2.5 shrink-0 group" aria-label="Ir al inicio">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center relative shrink-0 transition-transform duration-150 group-hover:scale-105"
              style="background: rgba(245,158,11,0.15); border: 1.5px solid rgba(245,158,11,0.5); box-shadow: 0 0 12px rgba(245,158,11,0.15);">
              <img src="assets/logo-cbo.svg" alt="Escudo CBO" class="w-6 h-6"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
              <div class="hidden w-full h-full items-center justify-center">
                <span class="text-accent-500 font-black text-xs">CBO</span>
              </div>
            </div>
            <div class="hidden sm:block leading-tight">
              <p class="text-sm font-bold text-slate-800">Bernardo O'Higgins</p>
              <p class="text-[10px] text-slate-400 font-medium tracking-wide">Panel · {{ auth.roleLabel() }}</p>
            </div>
          </a>

          <!-- ── Controles derecha ── -->
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">

            <!-- Campana de notificaciones (dropdown + badge) -->
            <div class="hidden sm:block"><app-campana-notificaciones /></div>

            <div class="hidden sm:block w-px h-5 bg-slate-200"></div>

            @if (auth.currentUser(); as user) {
              <!-- Avatar + dropdown -->
              <div class="relative">
                <button
                  (click)="toggleUserMenu()"
                  class="flex items-center gap-2.5 rounded-xl px-1.5 sm:px-2 py-1.5
                         hover:bg-slate-100 border border-transparent hover:border-slate-200
                         transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  [attr.aria-expanded]="userMenuOpen()"
                  aria-haspopup="true"
                  aria-label="Menú de usuario"
                >
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style="background: linear-gradient(135deg, #1E3A8A 0%, #2547A0 100%); box-shadow: 0 2px 8px rgba(19,41,75,0.3);"
                    aria-hidden="true"
                  >
                    {{ user.username.charAt(0).toUpperCase() }}
                  </div>
                  <div class="hidden lg:block text-left min-w-0">
                    <p class="text-sm font-semibold text-slate-800 truncate leading-tight">{{ user.username }}</p>
                    <app-badge-rol [rol]="user.rol" class="mt-0.5" />
                  </div>
                  <svg class="hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform duration-150 shrink-0"
                    [class.rotate-180]="userMenuOpen()"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                @if (userMenuOpen()) {
                  <div
                    class="absolute right-0 top-full mt-2 w-56 rounded-2xl py-2 z-30 animate-slideDown"
                    style="background: rgba(255,255,255,0.96); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 12px 40px rgba(2,6,23,0.16);"
                    role="menu"
                  >
                    <div class="px-4 py-3 border-b border-slate-100">
                      <p class="text-sm font-semibold text-slate-900">{{ user.username }}</p>
                      <p class="text-xs text-slate-500 mt-0.5 truncate">{{ user.email }}</p>
                      <div class="mt-2">
                        <app-badge-rol [rol]="user.rol" />
                      </div>
                    </div>

                    <div class="px-2 pt-2">
                      <button
                        (click)="logout()"
                        class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600
                               hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                        role="menuitem"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>

                  <div class="fixed inset-0 z-20" (click)="userMenuOpen.set(false)" aria-hidden="true"></div>
                }
              </div>
            }
          </div>
        </div>
      </header>

      <!-- ══════════════ CONTENIDO ══════════════ -->
      <main class="flex-1 min-h-0 overflow-y-auto">
        <div class="max-w-[1400px] mx-auto w-full min-h-full p-5 sm:p-6 flex flex-col animate-fadeIn">
          <router-outlet />
        </div>
      </main>
    </div>

    <!-- ══════════════ FAB FLOTANTE DEL MENÚ + SPEED-DIAL (parte baja, centro) ══════════════ -->
    <div class="fixed bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div
        class="pointer-events-auto relative"
        (mouseenter)="onFabEnter()"
        (mouseleave)="onFabLeave()"
      >
        <!-- FAB central -->
        <button
          (click)="openLauncher()"
          class="menu-fab group relative z-10 w-16 h-16 rounded-full text-white flex items-center justify-center
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2
                 transition-transform duration-200 hover:scale-110 active:scale-95"
          style="background: linear-gradient(135deg, #1E3A8A 0%, #13294B 100%); box-shadow: 0 12px 30px rgba(19,41,75,0.45);"
          [attr.aria-expanded]="launcherOpen()"
          aria-haspopup="true"
          aria-label="Abrir menú de secciones"
          title="Menú de secciones"
        >
          <span class="absolute inset-0 rounded-full pointer-events-none" style="box-shadow: inset 0 0 0 1.5px rgba(245,158,11,0.45);"></span>
          <svg class="w-7 h-7 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Speed-dial: 2 atajos a la derecha y 2 a la izquierda (aparecen al hover, en abanico) -->
        @if (fabHovering()) {
          @for (item of quickAccess(); track item.route; let i = $index) {
            <div
              class="absolute bottom-2 left-1/2"
              [style.transform]="'translate(calc(-50% + ' + fanSlots[i].x + 'px), ' + fanSlots[i].y + 'px)'"
            >
              <button
                (click)="go(item.route)"
                class="speed-item relative w-12 h-12 rounded-full flex items-center justify-center text-white
                       transition-transform duration-150 hover:scale-110
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2"
                [style]="'background: linear-gradient(135deg, ' + item.gradFrom + ' 0%, ' + item.gradTo + ' 100%); box-shadow: 0 6px 18px rgba(19,41,75,0.35); animation: speedItemIn 0.3s cubic-bezier(0.34,1.56,0.64,1) ' + (i * 45) + 'ms backwards;'"
                [attr.aria-label]="'Ir a ' + item.label"
              >
                <!-- Etiqueta hacia el lado externo -->
                <span
                  class="absolute top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-100"
                  [class.left-full]="fanSlots[i].side === 'r'"
                  [class.ml-2]="fanSlots[i].side === 'r'"
                  [class.right-full]="fanSlots[i].side === 'l'"
                  [class.mr-2]="fanSlots[i].side === 'l'"
                  style="box-shadow: 0 4px 12px rgba(2,6,23,0.10);"
                >{{ item.label }}</span>
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.85" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.svgPath" />
                </svg>
              </button>
            </div>
          }
        }
      </div>
    </div>

    <!-- ══════════════ LAUNCHER CENTRADO ══════════════ -->
    @if (launcherOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-label="Secciones">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
          [class.animate-bd-in]="!launcherClosing()"
          [class.animate-bd-out]="launcherClosing()"
          (click)="closeLauncher()"
        ></div>

        <!-- Panel (emerge desde el botón) -->
        <div
          class="launcher-panel relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden"
          [class.animate-launchOpen]="!launcherClosing()"
          [class.animate-launchClose]="launcherClosing()"
          style="background: rgba(255,255,255,0.96); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 28px 80px rgba(2,6,23,0.30);"
        >
          <!-- Encabezado -->
          <div class="flex items-center justify-between px-6 pt-5 pb-3">
            <div>
              <p class="text-[11px] font-semibold text-accent-600 uppercase tracking-widest">Secciones</p>
              <h2 class="text-lg font-bold text-slate-900">¿A dónde vas?</h2>
            </div>
            <button
              (click)="closeLauncher()"
              class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 hover:rotate-90
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              aria-label="Cerrar"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Grid de tarjetas -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 px-6 pb-6">
            @for (item of visibleNavItems(); track item.route; let i = $index) {
              <button
                type="button"
                (click)="go(item.route)"
                class="group relative text-left rounded-2xl border p-4 flex items-start gap-3.5 transition-all duration-200 hover:-translate-y-1"
                [class.border-slate-200]="!isActive(item.route)"
                [class.border-primary-300]="isActive(item.route)"
                [class.bg-white]="!isActive(item.route)"
                [class.bg-primary-50]="isActive(item.route)"
                [style.animation]="'rowIn 0.4s cubic-bezier(0.22,1,0.36,1) ' + (i * 60) + 'ms both'"
                style="box-shadow: 0 1px 3px rgba(0,0,0,0.06);"
              >
                <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110"
                  [style]="'background: linear-gradient(135deg, ' + item.gradFrom + ' 0%, ' + item.gradTo + ' 100%);'">
                  <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.svgPath" />
                  </svg>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-bold text-slate-900">{{ item.label }}</p>
                    @if (isActive(item.route)) {
                      <span class="text-[9px] font-bold uppercase tracking-wide text-primary-700 bg-primary-100 px-1.5 py-0.5 rounded-full">aquí</span>
                    }
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">{{ item.description }}</p>
                </div>
                <svg class="w-4 h-4 text-slate-300 self-center group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all duration-150"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            }
          </div>

          <!-- Footer -->
          <div class="border-t border-slate-100 px-6 py-3 flex items-center gap-4 text-xs text-slate-400">
            <span class="flex items-center gap-1.5"><kbd class="font-mono border border-slate-200 rounded px-1.5 py-0.5 bg-white">Esc</kbd> cerrar</span>
          </div>
        </div>
      </div>
    }

    <!-- Toast notifications -->
    <app-toast-container />
  `,
  styles: [`
    .w-4\\.5 { width: 1.125rem; }
    .h-4\\.5 { height: 1.125rem; }
    /* Entrada del FAB del Menú al aparecer en pantalla (sin fill: deja libre el hover) */
    .menu-fab {
      animation: menuFabIn 0.55s var(--ease-bounce, cubic-bezier(0.34,1.56,0.64,1)) 1;
    }
    @keyframes menuFabIn {
      0%   { opacity: 0; transform: translateY(28px) scale(0.4); }
      60%  { opacity: 1; }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Launcher estilo Apple: emerge desde el botón (abajo-centro) con spring y se contrae al cerrar */
    .launcher-panel { transform-origin: bottom center; will-change: transform, opacity; }
    .animate-launchOpen { animation: launchOpen 0.46s cubic-bezier(0.33, 1.4, 0.5, 1) both; }
    .animate-launchClose { animation: launchClose 0.2s cubic-bezier(0.4, 0, 1, 1) both; }
    @keyframes launchOpen {
      0%   { opacity: 0; transform: translateY(46px) scale(0.28); }
      55%  { opacity: 1; }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes launchClose {
      0%   { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(40px) scale(0.4); }
    }
    .animate-bd-in  { animation: fadeIn 0.3s ease both; }
    .animate-bd-out { animation: bdOut 0.2s ease both; }
    @keyframes bdOut { from { opacity: 1; } to { opacity: 0; } }

    /* Speed-dial: entrada de cada acceso rápido (backwards: oculto durante su delay, libre para hover al terminar) */
    @keyframes speedItemIn {
      0%   { opacity: 0; transform: translateY(12px) scale(0.4); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    @media (prefers-reduced-motion: reduce) {
      .menu-fab, .animate-launchOpen, .animate-launchClose, .animate-bd-in, .animate-bd-out, .speed-item { animation: none !important; }
    }
  `],
})
export class AdministrativoShellComponent implements OnDestroy {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly usage = inject(UsageTrackingService);

  readonly userMenuOpen = signal(false);
  readonly launcherOpen = signal(false);
  readonly launcherClosing = signal(false);
  readonly fabHovering = signal(false);
  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  /** Top-4 accesos rápidos (secciones visibles ordenadas por uso). */
  readonly quickAccess = computed(() => {
    const items = this.visibleNavItems();
    const topRoutes = this.usage.top(items.map((i) => i.route), 4);
    return topRoutes
      .map((r) => items.find((i) => i.route === r))
      .filter((i): i is NavItem => !!i);
  });

  readonly navItems: NavItem[] = [
    {
      label: 'Matrícula',
      route: '/administrativo/matricula',
      description: 'Matricular alumno con apoderados',
      svgPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      gradFrom: '#1E3A8A', gradTo: '#13294B',
    },
    {
      label: 'Estudiantes',
      route: '/administrativo/estudiantes',
      description: 'Listado y fichas con matrículas',
      svgPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      gradFrom: '#10B981', gradTo: '#047857',
    },
    {
      label: 'Académico',
      route: '/administrativo/academico',
      description: 'Cursos y asignaturas: asignar profesores',
      svgPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      gradFrom: '#6366f1', gradTo: '#4338ca',
    },
    {
      label: 'Materias',
      route: '/administrativo/materias',
      description: 'Catálogo de asignaturas por nivel',
      svgPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      gradFrom: '#0d9488', gradTo: '#0f766e',
    },
    {
      label: 'Hoja de Vida',
      route: '/administrativo/hoja-vida',
      description: 'Antecedentes y documentos del alumno',
      svgPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      gradFrom: '#0ea5e9', gradTo: '#0369a1',
    },
    {
      label: 'Usuarios',
      route: '/administrativo/usuarios',
      description: 'Crear cuentas de acceso al sistema',
      svgPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      gradFrom: '#F59E0B', gradTo: '#d97706',
      cap: 'usuarios',
    },
  ];

  readonly visibleNavItems = computed<NavItem[]>(() =>
    this.navItems.filter((i) => i.cap !== 'usuarios' || this.auth.canViewUsuarios()),
  );

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  openLauncher(): void {
    if (this.closeTimer) { clearTimeout(this.closeTimer); this.closeTimer = null; }
    this.fabHovering.set(false);
    this.userMenuOpen.set(false);
    this.launcherClosing.set(false);
    this.launcherOpen.set(true);
  }

  // ── Speed-dial: hover sobre el área del FAB ──
  onFabEnter(): void {
    if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = null; }
    this.fabHovering.set(true);
  }

  onFabLeave(): void {
    // gracia para cruzar el espacio entre el FAB y los atajos del abanico sin parpadeo
    this.hideTimer = setTimeout(() => {
      this.fabHovering.set(false);
      this.hideTimer = null;
    }, 220);
  }

  /** Posiciones del abanico: 2 a la derecha (índices 0,2) y 2 a la izquierda (1,3). */
  readonly fanSlots: { x: number; y: number; side: 'r' | 'l' }[] = [
    { x: 76, y: -40, side: 'r' },   // 0: derecha-baja (más usado)
    { x: -76, y: -40, side: 'l' },  // 1: izquierda-baja
    { x: 46, y: -88, side: 'r' },   // 2: derecha-alta
    { x: -46, y: -88, side: 'l' },  // 3: izquierda-alta
  ];

  closeLauncher(): void {
    if (this.launcherClosing()) return;
    // Animación de cierre (se contrae de vuelta hacia el botón) y luego se remueve
    this.launcherClosing.set(true);
    this.closeTimer = setTimeout(() => {
      this.launcherOpen.set(false);
      this.launcherClosing.set(false);
      this.closeTimer = null;
    }, 200);
  }

  go(route: string): void {
    if (this.closeTimer) { clearTimeout(this.closeTimer); this.closeTimer = null; }
    this.launcherOpen.set(false);
    this.launcherClosing.set(false);
    this.router.navigate([route]);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v);
  }

  logout(): void {
    this.userMenuOpen.set(false);
    this.auth.logout();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.launcherOpen()) this.closeLauncher();
    if (this.userMenuOpen()) this.userMenuOpen.set(false);
  }

  ngOnDestroy(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }
}
