import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EstudianteApiService } from '../../../core/api/estudiante-api.service';
import { CursoApiService } from '../../../core/api/curso-api.service';
import { MatriculaApiService } from '../../../core/api/matricula-api.service';
import { UsuarioApiService } from '../../../core/api/usuario-api.service';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { AuthService } from '../../../core/auth/auth.service';

interface StatCard {
  label: string;
  rawValue: number;
  displayValue: string;
  description: string;
  svgPath: string;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
  route?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, SkeletonComponent, NgTemplateOutlet],
  template: `
    <div class="space-y-6 animate-fadeIn w-full">

      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="page-title tracking-tight">Panel de Control</h1>
          <p class="text-slate-500 text-sm mt-1.5">
            Bienvenido, <span class="font-semibold text-primary-700">{{ auth.currentUser()?.username }}</span>. Resumen general del colegio.
          </p>
        </div>
        <!-- Chip de rol del usuario -->
        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-primary-100 bg-primary-50 self-start sm:self-auto">
          <svg class="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="text-xs font-semibold text-primary-700">{{ auth.roleLabel() }}</span>
        </div>
      </div>

      <!-- ── Tarjetas de estadísticas (datos reales) ── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        @if (loading()) {
          @for (_ of skeletons; track $index) {
            <app-skeleton variant="card" />
          }
        } @else {
          @for (card of statCards(); track card.label; let i = $index) {
            @if (card.route) {
              <a
                [routerLink]="card.route"
                class="group relative overflow-hidden rounded-2xl border border-slate-100/80 bg-white no-underline block
                       transition-all duration-300 ease-smooth hover:-translate-y-1.5 cursor-pointer"
                style="box-shadow: 0 1px 3px rgba(0,0,0,0.07);"
                [style.animation]="'rowIn 0.4s cubic-bezier(0.22,1,0.36,1) ' + (i * 70) + 'ms both'"
              >
                <ng-container [ngTemplateOutlet]="cardBody" [ngTemplateOutletContext]="{ $implicit: card }" />
              </a>
            } @else {
              <div
                class="relative overflow-hidden rounded-2xl border border-slate-100/80 bg-white"
                style="box-shadow: 0 1px 3px rgba(0,0,0,0.07);"
                [style.animation]="'rowIn 0.4s cubic-bezier(0.22,1,0.36,1) ' + (i * 70) + 'ms both'"
              >
                <ng-container [ngTemplateOutlet]="cardBody" [ngTemplateOutletContext]="{ $implicit: card }" />
              </div>
            }
          }
        }
      </div>

      <!-- Plantilla del cuerpo de la tarjeta -->
      <ng-template #cardBody let-card>
        <!-- Glow al hover -->
        <div class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          [style]="'box-shadow: inset 0 0 0 1.5px ' + card.glowColor + '40;'"></div>
        <!-- Halo gradiente -->
        <div class="absolute top-0 right-0 w-28 h-28 rounded-full opacity-5 -translate-y-8 translate-x-8 pointer-events-none transition-all duration-300 group-hover:opacity-10 group-hover:scale-125"
          [style]="'background: radial-gradient(circle, ' + card.gradientFrom + ', transparent)'"></div>

        <div class="relative p-5">
          <div class="flex items-start justify-between mb-4">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-110"
              [style]="'background: linear-gradient(135deg, ' + card.gradientFrom + ' 0%, ' + card.gradientTo + ' 100%);'">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="card.svgPath" />
              </svg>
            </div>
            @if (card.route) {
              <svg class="w-4 h-4 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all duration-150"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            }
          </div>
          <p class="text-3xl font-bold text-slate-900 tabular-nums"
            [style]="'background: linear-gradient(135deg, #13294B, ' + card.gradientFrom + '); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;'"
          >{{ card.displayValue }}</p>
          <p class="text-sm font-semibold text-slate-700 mt-1">{{ card.label }}</p>
          <p class="text-xs text-slate-400 mt-0.5">{{ card.description }}</p>
        </div>

        <div class="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300 ease-smooth"
          [style]="'background: linear-gradient(90deg, ' + card.gradientFrom + ', ' + card.gradientTo + ');'"></div>
      </ng-template>

      <!-- ── Accesos rápidos ── -->
      <div class="card">
        <div class="flex items-center justify-between mb-5">
          <h2 class="section-title">Acciones Rápidas</h2>
          <div class="w-1 h-5 rounded-full bg-accent-500"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <!-- Matrícula -->
          <a routerLink="/director/matricula"
            class="group flex flex-col gap-3 p-5 rounded-2xl border border-primary-100 no-underline transition-all duration-300 ease-smooth hover:-translate-y-1 cursor-pointer"
            style="background: linear-gradient(135deg, #eff4ff 0%, #dbe8ff 100%);">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200"
              style="background: linear-gradient(135deg, #1E3A8A 0%, #13294B 100%);">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-bold text-primary-900">Nueva Matrícula</p>
              <p class="text-xs text-primary-600 mt-0.5">Registrar estudiante con apoderados</p>
            </div>
            <div class="flex items-center gap-1 text-xs font-semibold text-primary-600 mt-auto">
              <span>Ir ahora</span>
              <svg class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          <!-- Estudiantes -->
          <a routerLink="/director/estudiantes"
            class="group flex flex-col gap-3 p-5 rounded-2xl border border-emerald-100 no-underline transition-all duration-300 ease-smooth hover:-translate-y-1 cursor-pointer"
            style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200"
              style="background: linear-gradient(135deg, #10B981 0%, #047857 100%);">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-bold text-emerald-900">Ver Estudiantes</p>
              <p class="text-xs text-emerald-700 mt-0.5">Listado y fichas con matrículas</p>
            </div>
            <div class="flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-auto">
              <span>Ir ahora</span>
              <svg class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          <!-- Usuarios (según rol) -->
          @if (auth.canViewUsuarios()) {
            <a routerLink="/director/usuarios"
              class="group flex flex-col gap-3 p-5 rounded-2xl border border-accent-100 no-underline transition-all duration-300 ease-smooth hover:-translate-y-1 cursor-pointer"
              style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200"
                style="background: linear-gradient(135deg, #F59E0B 0%, #d97706 100%);">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-bold text-accent-900">{{ auth.canManageUsuarios() ? 'Gestión de Usuarios' : 'Consultar Usuarios' }}</p>
                <p class="text-xs text-accent-700 mt-0.5">{{ auth.canManageUsuarios() ? 'Crear y administrar cuentas' : 'Consultar cuentas del sistema' }}</p>
              </div>
              <div class="flex items-center gap-1 text-xs font-semibold text-accent-700 mt-auto">
                <span>Ir ahora</span>
                <svg class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          }

        </div>
      </div>

      <!-- ── Banner institucional (identidad del colegio, sin metadata de software) ── -->
      <div class="relative overflow-hidden rounded-2xl p-6 text-white"
        style="background: linear-gradient(135deg, #13294B 0%, #1E3A8A 50%, #2547A0 100%);">
        <div class="absolute inset-0 pointer-events-none opacity-10"
          style="background-image: radial-gradient(circle at 80% 50%, #FBBF24 0%, transparent 50%), radial-gradient(circle at 10% 80%, #60a5fa 0%, transparent 40%);"></div>
        <div class="relative flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/20"
            style="background: rgba(245,158,11,0.2);">
            <img src="assets/logo-cbo.svg" alt="CBO" class="w-9 h-9" onerror="this.style.display='none'" />
          </div>
          <div>
            <h3 class="font-bold text-white text-base">Colegio Bernardo O'Higgins</h3>
            <p class="text-white/60 text-sm mt-0.5">{{ fechaHoy }}</p>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly estudianteApi = inject(EstudianteApiService);
  private readonly cursoApi = inject(CursoApiService);
  private readonly matriculaApi = inject(MatriculaApiService);
  private readonly usuarioApi = inject(UsuarioApiService);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly statCards = signal<StatCard[]>([]);
  readonly skeletons = [1, 2, 3, 4];

  readonly fechaHoy = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  private countUpTimers: ReturnType<typeof setInterval>[] = [];

  ngOnInit(): void {
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.countUpTimers.forEach(clearInterval);
  }

  private loadStats(): void {
    this.loading.set(true);
    forkJoin({
      estudiantes: this.estudianteApi.listar().pipe(catchError(() => of([]))),
      cursos: this.cursoApi.listar().pipe(catchError(() => of([]))),
      matriculas: this.matriculaApi.listar().pipe(catchError(() => of([]))),
      usuarios: this.auth.canViewUsuarios()
        ? this.usuarioApi.listar().pipe(catchError(() => of([])))
        : of([]),
    }).subscribe(({ estudiantes, cursos, matriculas, usuarios }) => {
      const vigentes = matriculas.filter((m) => m.estado === 'VIGENTE').length;

      const cards: StatCard[] = [
        {
          label: 'Estudiantes', rawValue: estudiantes.length, displayValue: '0',
          description: 'Registrados en el sistema',
          svgPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
          gradientFrom: '#10B981', gradientTo: '#047857', glowColor: '#10B981',
          route: '/director/estudiantes',
        },
        {
          label: 'Cursos', rawValue: cursos.length, displayValue: '0',
          description: 'Cursos del establecimiento',
          svgPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
          gradientFrom: '#2547A0', gradientTo: '#13294B', glowColor: '#2547A0',
        },
        {
          label: 'Matrículas vigentes', rawValue: vigentes, displayValue: '0',
          description: 'Matrículas activas este período',
          svgPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
          gradientFrom: '#8b5cf6', gradientTo: '#6d28d9', glowColor: '#8b5cf6',
        },
      ];

      if (this.auth.canViewUsuarios()) {
        cards.push({
          label: 'Usuarios', rawValue: usuarios.length, displayValue: '0',
          description: 'Cuentas de acceso al sistema',
          svgPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
          gradientFrom: '#F59E0B', gradientTo: '#d97706', glowColor: '#F59E0B',
          route: '/director/usuarios',
        });
      }

      this.statCards.set(cards);
      this.loading.set(false);

      // Count-up para cada tarjeta numérica
      cards.forEach((c, idx) => {
        if (c.rawValue > 0) this.animateCount(c.rawValue, idx);
        else this.setDisplay(idx, '0');
      });
    });
  }

  private setDisplay(index: number, value: string): void {
    this.statCards.update((cards) => {
      const updated = [...cards];
      if (updated[index]) updated[index] = { ...updated[index], displayValue: value };
      return updated;
    });
  }

  private animateCount(target: number, cardIndex: number): void {
    const steps = 30;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const current = Math.min(Math.round(increment * step), target);
      this.setDisplay(cardIndex, String(current));
      if (current >= target) clearInterval(timer);
    }, 1000 / steps);
    this.countUpTimers.push(timer);
  }
}
