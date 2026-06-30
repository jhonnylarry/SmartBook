import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApoderadoApiService } from '../../../core/api/apoderado-api.service';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { AnotacionApiService } from '../../../core/api/anotacion-api.service';
import { HorarioApiService } from '../../../core/api/horario-api.service';
import { PupiloDto } from '../../../core/models/apoderado.model';
import { BoletinAsignaturaDto } from '../../../core/models/boletin.model';
import { AnotacionDTO } from '../../../core/models/anotacion.model';
import { BloqueHorarioDto } from '../../../core/models/horario.model';
import { HorarioSemanalComponent } from '../../../shared/ui/horario-semanal/horario-semanal.component';
import { CalendarioComponent } from '../../director/calendario/calendario.component';
import { BoletinNotasComponent } from '../../../shared/ui/boletin-notas/boletin-notas.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

type Pestana = 'horario' | 'notas' | 'anotaciones' | 'calendario';

@Component({
  selector: 'app-pupilo-detalle',
  standalone: true,
  imports: [HorarioSemanalComponent, CalendarioComponent, BoletinNotasComponent, SkeletonComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- Cabecera -->
      <div class="flex items-center gap-3 shrink-0">
        <button (click)="volver()" class="shrink-0 p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors" aria-label="Volver">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div class="min-w-0">
          @if (pupilo(); as p) {
            <h1 class="page-title truncate">{{ p.nombreEstudiante }} {{ p.apellidoEstudiante }}</h1>
            <p class="text-slate-500 text-sm mt-0.5">{{ p.tipo === 'TITULAR' ? 'Eres su apoderado titular' : 'Eres su tutor' }}</p>
          } @else if (noEncontrado()) {
            <h1 class="page-title">Pupilo no encontrado</h1>
          } @else {
            <div class="h-6 w-44 bg-slate-200 rounded animate-pulse"></div>
          }
        </div>
      </div>

      @if (noEncontrado()) {
        <div class="flex-1 flex flex-col items-center justify-center gap-3 text-center py-16">
          <p class="text-slate-600 font-medium">No tienes acceso a este estudiante</p>
          <button (click)="volver()" class="btn-secondary text-sm">Volver a mis pupilos</button>
        </div>
      } @else if (pupilo()) {

        <!-- Pestañas -->
        <div class="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit shrink-0 overflow-x-auto">
          @for (t of pestanas; track t.key) {
            <button (click)="pestana.set(t.key)"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap"
              [class]="pestana() === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
              {{ t.label }}
            </button>
          }
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto">
          <!-- HORARIO -->
          @if (pestana() === 'horario') {
            <div class="card p-5">
              <app-horario-semanal [bloques]="bloques()" [loading]="cargandoHorario()" />
            </div>
          }

          <!-- NOTAS -->
          @if (pestana() === 'notas') {
            <app-boletin-notas [boletin]="boletin()" [loading]="cargandoNotas()" />
          }

          <!-- ANOTACIONES -->
          @if (pestana() === 'anotaciones') {
            @if (cargandoAnotaciones()) {
              <div class="space-y-2"><app-skeleton variant="custom" height="3rem" /><app-skeleton variant="custom" height="3rem" /></div>
            } @else if (anotaciones().length === 0) {
              <div class="card p-8 text-center text-slate-500 text-sm">Sin anotaciones registradas.</div>
            } @else {
              <ul class="flex flex-col gap-2">
                @for (a of anotaciones(); track a.id) {
                  <li class="card p-4 flex items-start gap-3">
                    <span class="mt-0.5 w-2.5 h-2.5 rounded-full shrink-0" [class]="a.tipo === 'POSITIVA' ? 'bg-emerald-500' : 'bg-red-500'"></span>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-sm font-semibold" [class]="a.tipo === 'POSITIVA' ? 'text-emerald-700' : 'text-red-700'">
                          {{ a.tipo === 'POSITIVA' ? 'Positiva' : 'Negativa' }}
                        </span>
                        <span class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">{{ gravedadLabel(a.gravedad) }}</span>
                        <span class="text-xs text-slate-400">{{ fecha(a.fecha) }}</span>
                      </div>
                      <p class="text-sm text-slate-600 mt-1">{{ a.descripcion }}</p>
                    </div>
                  </li>
                }
              </ul>
            }
          }

          <!-- CALENDARIO -->
          @if (pestana() === 'calendario') {
            <app-calendario [soloLectura]="true" />
          }
        </div>
      }
    </div>
  `,
})
export class PupiloDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apoderadoApi = inject(ApoderadoApiService);
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly anotacionApi = inject(AnotacionApiService);
  private readonly horarioApi = inject(HorarioApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pestana = signal<Pestana>('horario');
  readonly pestanas: { key: Pestana; label: string }[] = [
    { key: 'horario', label: 'Horario' },
    { key: 'notas', label: 'Notas' },
    { key: 'anotaciones', label: 'Anotaciones' },
    { key: 'calendario', label: 'Calendario' },
  ];

  readonly pupilo = signal<PupiloDto | null>(null);
  readonly noEncontrado = signal(false);
  readonly bloques = signal<BloqueHorarioDto[]>([]);
  readonly boletin = signal<BoletinAsignaturaDto[]>([]);
  readonly anotaciones = signal<AnotacionDTO[]>([]);
  readonly cargandoHorario = signal(true);
  readonly cargandoNotas = signal(true);
  readonly cargandoAnotaciones = signal(true);

  private idEstudiante = 0;

  ngOnInit(): void {
    this.idEstudiante = Number(this.route.snapshot.paramMap.get('idEstudiante') ?? 0);

    this.apoderadoApi.misPupilos().pipe(
      catchError(() => of([] as PupiloDto[])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((pupilos) => {
      const p = pupilos.find((x) => x.idEstudiante === this.idEstudiante) ?? null;
      if (!p) { this.noEncontrado.set(true); return; }
      this.pupilo.set(p);
      this.cargarHorario(p.idCurso);
      this.cargarBoletin();
      this.cargarAnotaciones();
    });
  }

  private cargarHorario(idCurso: number | null): void {
    if (idCurso == null) { this.cargandoHorario.set(false); return; }
    this.horarioApi.porCurso(idCurso).pipe(
      catchError(() => of([] as BloqueHorarioDto[])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((b) => {
      this.bloques.set(b);
      this.cargandoHorario.set(false);
    });
  }

  private cargarAnotaciones(): void {
    this.anotacionApi.deHijo(this.idEstudiante).pipe(
      catchError(() => of([] as AnotacionDTO[])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((a) => {
      this.anotaciones.set(a);
      this.cargandoAnotaciones.set(false);
    });
  }

  private cargarBoletin(): void {
    this.academicoApi.boletinDeHijo(this.idEstudiante).pipe(
      catchError(() => of([] as BoletinAsignaturaDto[])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((b) => {
      this.boletin.set(b);
      this.cargandoNotas.set(false);
    });
  }

  gravedadLabel(g: string): string {
    return ({ LEVE: 'Leve', GRAVE: 'Grave', MUY_GRAVE: 'Muy grave' } as Record<string, string>)[g] ?? g;
  }

  fecha(iso: string): string {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  volver(): void {
    this.router.navigate(['/apoderado/pupilos']);
  }
}
