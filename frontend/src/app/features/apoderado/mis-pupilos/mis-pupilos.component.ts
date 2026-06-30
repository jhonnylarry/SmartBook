import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApoderadoApiService } from '../../../core/api/apoderado-api.service';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { PupiloDto } from '../../../core/models/apoderado.model';
import { CursoDTO } from '../../../core/models/academico.model';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-mis-pupilos',
  standalone: true,
  imports: [SkeletonComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">
      <div>
        <h1 class="page-title">Mis Pupilos</h1>
        <p class="text-slate-500 text-sm mt-1">Estudiantes a tu cargo. Toca uno para ver su detalle.</p>
      </div>

      @if (cargando()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1,2,3]; track i) { <app-skeleton variant="card" /> }
        </div>
      } @else if (pupilos().length === 0) {
        <div class="flex-1 flex flex-col items-center justify-center gap-3 text-center py-16">
          <p class="text-slate-600 font-medium">No tienes pupilos asociados</p>
          <p class="text-slate-400 text-sm">Si crees que es un error, contacta con el colegio.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (p of pupilos(); track p.idEstudiante) {
            <button type="button" (click)="abrir(p)"
              class="group card p-5 text-left flex items-start gap-3.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-bold shadow-sm transition-transform duration-200 group-hover:scale-110"
                style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">
                {{ iniciales(p) }}
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="font-bold text-slate-900 truncate">{{ p.nombreEstudiante }} {{ p.apellidoEstudiante }}</h3>
                <p class="text-xs text-slate-500 mt-0.5">{{ cursoNombre(p.idCurso) }}</p>
                <span class="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                  [class]="p.tipo === 'TITULAR' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">
                  {{ p.tipo === 'TITULAR' ? 'Apoderado titular' : 'Tutor' }}
                </span>
              </div>
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class MisPupilosComponent implements OnInit {
  private readonly apoderadoApi = inject(ApoderadoApiService);
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly pupilos = signal<PupiloDto[]>([]);
  readonly cargando = signal(true);
  private readonly cursos = signal<Map<number, string>>(new Map());

  ngOnInit(): void {
    this.apoderadoApi.misPupilos().pipe(
      catchError(() => of([] as PupiloDto[])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((pupilos) => {
      this.pupilos.set(pupilos);
      this.cargando.set(false);
      const ids = [...new Set(pupilos.map((p) => p.idCurso).filter((id): id is number => id != null))];
      if (ids.length === 0) return;
      forkJoin(ids.map((id) => this.academicoApi.curso(id).pipe(catchError(() => of(null)))))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((cursos) => {
          const m = new Map<number, string>();
          cursos.forEach((c: CursoDTO | null) => { if (c) m.set(c.id, c.nombre); });
          this.cursos.set(m);
        });
    });
  }

  cursoNombre(idCurso: number | null): string {
    if (idCurso == null) return 'Sin curso';
    return this.cursos().get(idCurso) ?? `Curso #${idCurso}`;
  }

  iniciales(p: PupiloDto): string {
    return `${p.nombreEstudiante?.charAt(0) ?? ''}${p.apellidoEstudiante?.charAt(0) ?? ''}`.toUpperCase();
  }

  abrir(p: PupiloDto): void {
    this.router.navigate(['/apoderado/pupilo', p.idEstudiante]);
  }
}
