import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CampanaNotificacionesComponent } from '../../../shared/ui/campana-notificaciones/campana-notificaciones.component';
import { BadgeRolComponent } from '../../../shared/ui/badge-rol/badge-rol.component';
import { ToastContainerComponent } from '../../../shared/ui/toast/toast.component';

/**
 * Shell del workspace del Docente. La barra superior es la navegación única
 * (Mi Horario · Mis Asignaturas · Calendario · Notificaciones).
 */
@Component({
  selector: 'app-docente-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BadgeRolComponent, ToastContainerComponent, CampanaNotificacionesComponent],
  template: `
    <div class="flex flex-col h-screen overflow-hidden" style="background: var(--color-surface);">

      <!-- ══════════════ TOPBAR ══════════════ -->
      <header
        class="shrink-0 z-20 sticky top-0 border-b border-slate-200/60"
        style="background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); box-shadow: 0 1px 12px rgba(0,0,0,0.06);"
      >
        <div class="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

          <!-- ── Marca ── -->
          <a routerLink="/docente/inicio" class="flex items-center gap-2.5 shrink-0 group" aria-label="Inicio">
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

          <!-- ── Nav + usuario ── -->
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">

            <a
              routerLink="/docente/horario"
              routerLinkActive="!text-primary-700 !bg-primary-50 !border-primary-100"
              class="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600
                     hover:text-primary-700 hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all duration-150"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Mi Horario
            </a>

            <a
              routerLink="/docente/asignaturas"
              routerLinkActive="!text-primary-700 !bg-primary-50 !border-primary-100"
              class="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600
                     hover:text-primary-700 hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all duration-150"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Mis Asignaturas
            </a>

            <a
              routerLink="/docente/calendario"
              routerLinkActive="!text-primary-700 !bg-primary-50 !border-primary-100"
              class="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600
                     hover:text-primary-700 hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all duration-150"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendario
            </a>

            <a
              routerLink="/docente/notificaciones"
              routerLinkActive="!text-primary-700 !bg-primary-50 !border-primary-100"
              class="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600
                     hover:text-primary-700 hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all duration-150"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              Notificaciones
            </a>

            <a
              routerLink="/docente/mensajes"
              routerLinkActive="!text-primary-700 !bg-primary-50 !border-primary-100"
              class="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600
                     hover:text-primary-700 hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all duration-150"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Mensajes
            </a>

            <!-- Campana de notificaciones (dropdown + badge) -->
            <app-campana-notificaciones [inicioLink]="'/docente/notificaciones'" />

            <div class="hidden sm:block w-px h-5 bg-slate-200"></div>

            @if (auth.currentUser(); as user) {
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

    <!-- Toast notifications -->
    <app-toast-container />
  `,
})
export class DocenteShellComponent {
  readonly auth = inject(AuthService);
  readonly userMenuOpen = signal(false);

  toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v);
  }

  logout(): void {
    this.userMenuOpen.set(false);
    this.auth.logout();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.userMenuOpen()) this.userMenuOpen.set(false);
  }
}
