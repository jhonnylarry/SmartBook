import { Component, OnInit, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarioApiService } from '../../../core/api/calendario-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { EventoDto, TipoEvento, TIPOS_EVENTO } from '../../../core/models/calendario.model';

interface Celda {
  fecha: Date;
  clave: string;       // 'YYYY-MM-DD'
  dia: number;
  inMonth: boolean;
  hoy: boolean;
  eventos: EventoDto[];
}

const DIA_DEFECTO_INICIO = 'T08:00';
const DIA_DEFECTO_FIN = 'T09:00';

/**
 * Calendario escolar — vista de cuadrícula mensual (hand-built). Componente
 * compartido por los workspaces del Director y del Docente (eventos globales).
 * Solo abre modales internos; no navega a otras páginas → idéntico en ambos árboles.
 */
@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, SpinnerComponent, SkeletonComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h1 class="page-title">Calendario escolar</h1>
          <p class="text-slate-500 text-sm mt-1">Eventos del colegio: clases, reuniones, evaluaciones y feriados.</p>
        </div>
        @if (puedeGestionar()) {
          <button (click)="abrirCrearHoy()" class="btn-primary self-start sm:self-auto">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo evento
          </button>
        }
      </div>

      <!-- Barra de navegación de mes -->
      <div class="flex items-center justify-between gap-3 shrink-0">
        <div class="flex items-center gap-1">
          <button (click)="mesAnterior()" class="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors" aria-label="Mes anterior">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 class="section-title capitalize min-w-[10rem] text-center">{{ nombreMes() }}</h2>
          <button (click)="mesSiguiente()" class="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors" aria-label="Mes siguiente">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button (click)="hoy()" class="btn-secondary text-sm">Hoy</button>
      </div>

      <!-- Leyenda / filtros por tipo -->
      <div class="flex flex-wrap items-center gap-2 shrink-0">
        @for (t of tipos; track t) {
          <button
            (click)="toggleTipo(t)"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
            [class]="filtrosTipo().has(t) ? colorChip(t) : 'bg-white text-slate-400 border-slate-200 line-through'"
          >
            <span class="w-2 h-2 rounded-full" [class]="dotColor(t)"></span>
            {{ tipoLabel(t) }}
          </button>
        }
      </div>

      <!-- Cuadrícula -->
      <div class="card p-3 flex-1 min-h-0 overflow-auto">
        @if (loading()) {
          <div class="grid grid-cols-1 gap-3">
            @for (i of [1,2,3]; track i) { <app-skeleton variant="card" /> }
          </div>
        } @else {
          <!-- Cabecera de días -->
          <div class="grid grid-cols-7 gap-1 mb-1">
            @for (d of nombresDias; track d) {
              <div class="text-center text-xs font-semibold text-slate-500 py-1">{{ d }}</div>
            }
          </div>
          <!-- 6 semanas × 7 días -->
          <div class="grid grid-cols-7 gap-1">
            @for (c of celdas(); track c.clave) {
              <button
                type="button"
                (click)="abrirCrearEnDia(c.clave)"
                [disabled]="!puedeGestionar()"
                class="min-h-[72px] sm:min-h-[116px] flex flex-col text-left p-1.5 rounded-lg border border-slate-200/60 transition-colors hover:border-primary-300 hover:bg-primary-50/40 disabled:hover:bg-transparent disabled:hover:border-slate-200/60 disabled:cursor-default"
                [class.bg-slate-50]="!c.inMonth"
                [class.opacity-50]="!c.inMonth"
              >
                <div class="flex justify-end">
                  <span
                    class="text-xs w-5 h-5 inline-flex items-center justify-center rounded-full"
                    [class]="c.hoy ? 'bg-primary-600 text-white font-bold' : 'text-slate-600'"
                  >{{ c.dia }}</span>
                </div>

                <!-- Eventos (>= sm): bloques legibles con barra de color, hora y título -->
                <div class="hidden sm:flex flex-col gap-1 mt-1.5">
                  @for (ev of c.eventos.slice(0, 3); track ev.id) {
                    <span
                      (click)="abrirEditar(ev, $event)"
                      class="flex items-baseline gap-1.5 w-full rounded-md border-l-4 pl-2 pr-1.5 py-1 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                      [class]="claseEvento(ev.tipo)"
                      [title]="tooltipEvento(ev)"
                    >
                      @if (horaEvento(ev); as h) {
                        <span class="text-[10px] font-bold tabular-nums shrink-0 opacity-70">{{ h }}</span>
                      }
                      <span class="truncate text-[11px] font-semibold leading-snug">{{ ev.titulo }}</span>
                    </span>
                  }
                  @if (c.eventos.length > 3) {
                    <span class="text-[10px] font-semibold text-slate-500 px-1 mt-0.5">+{{ c.eventos.length - 3 }} eventos más</span>
                  }
                </div>

                <!-- Puntos (< sm) -->
                <div class="flex sm:hidden flex-wrap items-center gap-1 mt-1.5">
                  @for (ev of c.eventos.slice(0, 4); track ev.id) {
                    <span class="w-2 h-2 rounded-full" [class]="dotColor(ev.tipo)"></span>
                  }
                  @if (c.eventos.length > 4) {
                    <span class="text-[10px] font-semibold text-slate-500">+{{ c.eventos.length - 4 }}</span>
                  }
                </div>
              </button>
            }
          </div>
        }
      </div>

    </div>

    <!-- Modal Crear / Editar evento -->
    <app-modal
      [open]="modalForm()"
      [title]="eventoEditando() ? 'Editar evento' : 'Nuevo evento'"
      size="md"
      (closed)="cerrar()"
    >
      <form [formGroup]="formEvento" (ngSubmit)="guardar()" class="space-y-4">
        <div>
          <label class="label">Título *</label>
          <input
            type="text"
            formControlName="titulo"
            class="input-field"
            [class.error]="esInvalido('titulo')"
            placeholder="Ej: Reunión de apoderados"
            maxlength="150"
          />
          @if (esInvalido('titulo')) { <p class="error-text">El título es obligatorio.</p> }
        </div>

        <div>
          <label class="label">Tipo *</label>
          <select formControlName="tipo" class="input-field" [class.error]="esInvalido('tipo')">
            <option value="">-- Selecciona un tipo --</option>
            @for (t of tipos; track t) {
              <option [value]="t">{{ tipoLabel(t) }}</option>
            }
          </select>
          @if (esInvalido('tipo')) { <p class="error-text">Selecciona un tipo.</p> }
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="label">Inicio *</label>
            <input type="datetime-local" formControlName="fechaInicio" class="input-field" [class.error]="esInvalido('fechaInicio')" />
            @if (esInvalido('fechaInicio')) { <p class="error-text">La fecha de inicio es obligatoria.</p> }
          </div>
          <div>
            <label class="label">Fin *</label>
            <input type="datetime-local" formControlName="fechaFin" class="input-field" [class.error]="esInvalido('fechaFin')" />
            @if (esInvalido('fechaFin')) { <p class="error-text">La fecha de fin es obligatoria.</p> }
          </div>
        </div>

        <div>
          <label class="label">Descripción <span class="text-xs text-slate-400 font-normal">(opcional)</span></label>
          <textarea
            formControlName="descripcion"
            class="input-field"
            rows="3"
            maxlength="500"
            placeholder="Detalle del evento..."
          ></textarea>
        </div>

        <div class="flex items-center justify-between gap-3 pt-2">
          <div>
            @if (eventoEditando() && auth.canDeleteCalendario()) {
              <button type="button" (click)="eliminar()" class="btn-danger">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            }
          </div>
          <div class="flex items-center gap-3">
            <button type="button" (click)="cerrar()" class="btn-secondary">Cancelar</button>
            @if (puedeGestionar()) {
              <button type="submit" class="btn-primary" [disabled]="guardando()">
                @if (guardando()) { <app-spinner size="sm" /> }
                {{ eventoEditando() ? 'Guardar cambios' : 'Crear evento' }}
              </button>
            }
          </div>
        </div>
      </form>
    </app-modal>
  `,
})
export class CalendarioComponent implements OnInit {
  private readonly calendarioApi = inject(CalendarioApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  // ── Inputs opcionales ── cuando se usan, el componente pasa a modo "asignatura"
  readonly idAsignatura = input<number | undefined>(undefined);
  /** Cuando es true, el calendario es de solo lectura (sin botones de gestión). */
  readonly soloLectura = input<boolean>(false);

  /** Puede gestionar solo si el rol lo permite Y no está en modo lectura. */
  readonly puedeGestionar = computed(() => this.auth.canManageCalendario() && !this.soloLectura());

  readonly tipos = TIPOS_EVENTO;
  readonly nombresDias = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  readonly eventos = signal<EventoDto[]>([]);
  readonly loading = signal(false);
  readonly guardando = signal(false);

  readonly mesActual = signal<{ anio: number; mes: number }>({
    anio: new Date().getFullYear(),
    mes: new Date().getMonth(),
  });
  readonly filtrosTipo = signal<Set<TipoEvento>>(new Set(TIPOS_EVENTO));

  readonly modalForm = signal(false);
  readonly eventoEditando = signal<EventoDto | null>(null);

  readonly formEvento: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    tipo: ['', [Validators.required]],
    fechaInicio: ['', [Validators.required]],
    fechaFin: ['', [Validators.required]],
    descripcion: ['', [Validators.maxLength(500)]],
  });

  readonly nombreMes = computed(() => {
    const { anio, mes } = this.mesActual();
    return new Date(anio, mes, 1).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  });

  readonly celdas = computed<Celda[]>(() => {
    const { anio, mes } = this.mesActual();
    const filtros = this.filtrosTipo();

    // Bucket de eventos visibles por día (clave de string, sin desfase de zona)
    const porDia = new Map<string, EventoDto[]>();
    for (const ev of this.eventos()) {
      if (!filtros.has(ev.tipo)) continue;
      const k = ev.fechaInicio.slice(0, 10);
      const arr = porDia.get(k);
      if (arr) arr.push(ev);
      else porDia.set(k, [ev]);
    }
    for (const arr of porDia.values()) {
      arr.sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
    }

    const offset = (new Date(anio, mes, 1).getDay() + 6) % 7; // Lunes = 0
    const hoyClave = this.claveDia(new Date());

    const celdas: Celda[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(anio, mes, 1 - offset + i); // Date normaliza límites/años bisiestos
      const clave = this.claveDia(d);
      celdas.push({
        fecha: d,
        clave,
        dia: d.getDate(),
        inMonth: d.getMonth() === mes,
        hoy: clave === hoyClave,
        eventos: porDia.get(clave) ?? [],
      });
    }
    return celdas;
  });

  constructor() {
    // Recarga los eventos cada vez que cambia idAsignatura (patrón de documentos-evaluacion).
    // En la ruta global (sin input) idAsignatura() es undefined y el efecto
    // igualmente dispara la carga inicial — haciendo ngOnInit redundante para ese caso.
    effect(() => {
      const id = this.idAsignatura();
      this.cargar(id);
    });
  }

  ngOnInit(): void {
    // El efecto del constructor ya dispara la carga inicial.
    // Se mantiene ngOnInit por compatibilidad con la interfaz OnInit declarada.
  }

  cargar(idAsignatura?: number): void {
    this.loading.set(true);
    const req = idAsignatura !== undefined
      ? this.calendarioApi.porAsignatura(idAsignatura)
      : this.calendarioApi.listar();
    req.subscribe({
      next: (lista) => {
        this.eventos.set(lista);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  // ── Navegación de mes ──
  mesAnterior(): void {
    this.mesActual.update((m) => (m.mes === 0 ? { anio: m.anio - 1, mes: 11 } : { anio: m.anio, mes: m.mes - 1 }));
  }
  mesSiguiente(): void {
    this.mesActual.update((m) => (m.mes === 11 ? { anio: m.anio + 1, mes: 0 } : { anio: m.anio, mes: m.mes + 1 }));
  }
  hoy(): void {
    const n = new Date();
    this.mesActual.set({ anio: n.getFullYear(), mes: n.getMonth() });
  }

  toggleTipo(t: TipoEvento): void {
    this.filtrosTipo.update((set) => {
      const next = new Set(set);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  // ── Modal ──
  abrirCrearHoy(): void {
    this.abrirCrearEnDia(this.claveDia(new Date()));
  }

  abrirCrearEnDia(clave: string): void {
    if (!this.puedeGestionar()) return;
    this.eventoEditando.set(null);
    this.formEvento.reset({
      titulo: '',
      tipo: '',
      fechaInicio: clave + DIA_DEFECTO_INICIO,
      fechaFin: clave + DIA_DEFECTO_FIN,
      descripcion: '',
    });
    this.modalForm.set(true);
  }

  abrirEditar(ev: EventoDto, event: Event): void {
    event.stopPropagation(); // evita que el clic en el chip dispare "crear" de la celda
    this.eventoEditando.set(ev);
    this.formEvento.reset({
      titulo: ev.titulo,
      tipo: ev.tipo,
      fechaInicio: ev.fechaInicio.slice(0, 16), // ISO → datetime-local (YYYY-MM-DDTHH:mm)
      fechaFin: ev.fechaFin.slice(0, 16),
      descripcion: ev.descripcion ?? '',
    });
    this.modalForm.set(true);
  }

  cerrar(): void {
    this.modalForm.set(false);
    this.eventoEditando.set(null);
  }

  guardar(): void {
    this.formEvento.markAllAsTouched();
    if (this.formEvento.invalid || this.guardando()) return;

    const v = this.formEvento.getRawValue() as {
      titulo: string; tipo: TipoEvento; fechaInicio: string; fechaFin: string; descripcion: string;
    };
    const ini = this.normalizarFecha(v.fechaInicio);
    const fin = this.normalizarFecha(v.fechaFin);
    if (fin < ini) {
      this.toast.error('La fecha de fin debe ser igual o posterior a la de inicio.');
      return;
    }

    this.guardando.set(true);
    const editando = this.eventoEditando();
    const obs = editando
      ? this.calendarioApi.actualizar(editando.id, {
          titulo: v.titulo.trim(),
          descripcion: v.descripcion?.trim() || undefined,
          tipo: v.tipo,
          fechaInicio: ini,
          fechaFin: fin,
        })
      : this.calendarioApi.crear({
          titulo: v.titulo.trim(),
          descripcion: v.descripcion?.trim() || undefined,
          tipo: v.tipo,
          fechaInicio: ini,
          fechaFin: fin,
          idCreador: this.auth.currentUser()?.id,
          // Solo incluir idAsignatura cuando estamos en contexto de asignatura
          ...(this.idAsignatura() !== undefined ? { idAsignatura: this.idAsignatura() } : {}),
        });

    obs.subscribe({
      next: () => {
        this.guardando.set(false);
        this.toast.success(editando ? 'Evento actualizado.' : 'Evento creado.');
        this.cerrar();
        this.cargar(this.idAsignatura());
      },
      error: () => {
        this.guardando.set(false);
      },
    });
  }

  eliminar(): void {
    const ev = this.eventoEditando();
    if (!ev) return;
    if (!confirm(`¿Eliminar el evento "${ev.titulo}"? Esta acción no se puede deshacer.`)) return;
    this.calendarioApi.eliminar(ev.id).subscribe({
      next: () => {
        this.toast.success('Evento eliminado.');
        this.cerrar();
        this.cargar(this.idAsignatura());
      },
      error: () => {
        this.toast.error('No se pudo eliminar el evento.');
      },
    });
  }

  // ── Helpers ──
  esInvalido(campo: string): boolean {
    const c = this.formEvento.get(campo);
    return !!(c?.invalid && c.touched);
  }

  private claveDia(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  private normalizarFecha(v: string): string {
    // datetime-local da YYYY-MM-DDTHH:mm (16); el backend necesita HH:mm:ss
    return v.length === 16 ? v + ':00' : v;
  }

  colorChip(t: TipoEvento): string {
    switch (t) {
      case 'CLASE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REUNION': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'EVALUACION': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'FERIADO': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200'; // OTRO
    }
  }

  dotColor(t: TipoEvento): string {
    switch (t) {
      case 'CLASE': return 'bg-blue-500';
      case 'REUNION': return 'bg-indigo-500';
      case 'EVALUACION': return 'bg-amber-500';
      case 'FERIADO': return 'bg-green-500';
      default: return 'bg-slate-400'; // OTRO
    }
  }

  /** Bloque de evento sólido y legible: fondo tenue + barra lateral de color + hover. */
  claseEvento(t: TipoEvento): string {
    switch (t) {
      case 'CLASE': return 'bg-blue-50 text-blue-900 border-blue-500 hover:bg-blue-100';
      case 'REUNION': return 'bg-indigo-50 text-indigo-900 border-indigo-500 hover:bg-indigo-100';
      case 'EVALUACION': return 'bg-amber-50 text-amber-900 border-amber-500 hover:bg-amber-100';
      case 'FERIADO': return 'bg-emerald-50 text-emerald-900 border-emerald-500 hover:bg-emerald-100';
      default: return 'bg-slate-100 text-slate-700 border-slate-400 hover:bg-slate-200'; // OTRO
    }
  }

  /** Hora de inicio HH:mm para el bloque (los feriados no muestran hora). */
  horaEvento(ev: EventoDto): string {
    if (ev.tipo === 'FERIADO') return '';
    return ev.fechaInicio.slice(11, 16);
  }

  /** Tooltip enriquecido: «hora · título» y, si existe, la descripción en segunda línea. */
  tooltipEvento(ev: EventoDto): string {
    const h = this.horaEvento(ev);
    const cabecera = (h ? h + ' · ' : '') + ev.titulo;
    return ev.descripcion ? `${cabecera}\n${ev.descripcion}` : cabecera;
  }

  tipoLabel(t: TipoEvento): string {
    const labels: Record<TipoEvento, string> = {
      CLASE: 'Clase',
      REUNION: 'Reunión',
      EVALUACION: 'Evaluación',
      FERIADO: 'Feriado',
      OTRO: 'Otro',
    };
    return labels[t];
  }
}
