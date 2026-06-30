import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { MensajeriaApiService } from '../../core/api/mensajeria-api.service';
import { UsuarioApiService } from '../../core/api/usuario-api.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import {
  MensajeDto,
  ContactoDto,
  GrupoDto,
} from '../../core/models/mensajeria.model';
import { PerfilPublico } from '../../core/models/usuario.model';

/** Pestaña activa en la bandeja */
type Tab = 'recibidos' | 'enviados';

/** Modo del modal de redacción */
type ModoModal = 'directo' | 'difusion';

/**
 * Mensajes de difusión agrupados para la bandeja de enviados.
 * Una tarjeta por loteDifusion, mostrando el conteo de destinatarios.
 */
interface GrupoDifusion {
  loteDifusion: string;
  asunto: string;
  fechaEnvio: string;
  count: number;
}

/** Item unificado de la bandeja de enviados con clave de track única. */
interface EnviadoItem {
  key: string;
  tipo: 'directo' | 'difusion';
  msg: MensajeDto | null;
  grupo: GrupoDifusion | null;
}

/**
 * Feature "Mensajes" compartida por todos los roles (estudiante, docente, apoderado, director).
 * Se carga lazy desde cada *.routes.ts.
 */
@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, SkeletonComponent, SpinnerComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="page-title">Mensajes</h1>
          <p class="text-slate-500 text-sm mt-1">Comunicación interna del colegio.</p>
        </div>
        <button (click)="abrirRedactar()" class="btn-primary self-start sm:self-auto">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo mensaje
        </button>
      </div>

      <!-- Pestañas -->
      <div class="flex gap-1 border-b border-slate-200">
        <button
          (click)="tab.set('recibidos')"
          class="px-4 py-2 text-sm font-medium transition-colors duration-150 border-b-2 -mb-px"
          [class.border-primary-600]="tab() === 'recibidos'"
          [class.text-primary-700]="tab() === 'recibidos'"
          [class.border-transparent]="tab() !== 'recibidos'"
          [class.text-slate-500]="tab() !== 'recibidos'"
        >
          Recibidos
          @if (noLeidosCount() > 0) {
            <span class="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold">
              {{ noLeidosCount() }}
            </span>
          }
        </button>
        <button
          (click)="tab.set('enviados')"
          class="px-4 py-2 text-sm font-medium transition-colors duration-150 border-b-2 -mb-px"
          [class.border-primary-600]="tab() === 'enviados'"
          [class.text-primary-700]="tab() === 'enviados'"
          [class.border-transparent]="tab() !== 'enviados'"
          [class.text-slate-500]="tab() !== 'enviados'"
        >
          Enviados
        </button>
      </div>

      <!-- Contenido de la bandeja -->
      <div class="flex-1 min-h-0 overflow-auto pr-1">
        @if (cargando()) {
          <div class="flex flex-col gap-3">
            @for (i of [1,2,3,4]; track i) {
              <app-skeleton variant="tableRow" />
            }
          </div>
        } @else {
          @if (tab() === 'recibidos') {
            @if (recibidos().length === 0) {
              <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
                <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <svg class="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="text-slate-600 font-medium">Sin mensajes recibidos</p>
                  <p class="text-slate-400 text-sm mt-1">Cuando te escriban aparecerán aquí.</p>
                </div>
              </div>
            } @else {
              <div class="flex flex-col gap-2">
                @for (msg of recibidos(); track msg.id) {
                  <div
                    class="card p-4 flex flex-col gap-2 cursor-pointer transition-all duration-150"
                    [class.bg-white]="msg.leido"
                    [class.bg-primary-50]="!msg.leido"
                    [class.border-primary-200]="!msg.leido"
                    (click)="seleccionarRecibido(msg)"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-center gap-2 min-w-0">
                        @if (!msg.leido) {
                          <span class="w-2 h-2 rounded-full bg-primary-600 shrink-0" aria-label="No leído"></span>
                        }
                        <p class="text-sm font-semibold text-slate-900 truncate">{{ msg.asunto }}</p>
                      </div>
                      <span class="text-xs text-slate-400 shrink-0">{{ fechaRelativa(msg.fechaEnvio) }}</span>
                    </div>
                    <p class="text-xs text-slate-500">
                      De: <span class="font-medium text-slate-700">{{ nombreRemitente(msg.idRemitente) }}</span>
                    </p>
                    @if (mensajeExpandido() === msg.id) {
                      <div class="mt-2 pt-3 border-t border-slate-200 animate-fadeIn">
                        <p class="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{{ msg.contenido }}</p>
                        <div class="mt-3 flex justify-end">
                          <button
                            (click)="responder(msg); $event.stopPropagation()"
                            class="btn-secondary text-xs px-3 py-1.5"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            Responder
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          }

          @if (tab() === 'enviados') {
            @if (enviadosItems().length === 0) {
              <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
                <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <svg class="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div>
                  <p class="text-slate-600 font-medium">Sin mensajes enviados</p>
                  <p class="text-slate-400 text-sm mt-1">Los mensajes que envíes aparecerán aquí.</p>
                </div>
              </div>
            } @else {
              <div class="flex flex-col gap-2">
                @for (item of enviadosItems(); track item.key) {
                  @if (item.tipo === 'difusion') {
                    <div class="card p-4 flex flex-col gap-1 bg-violet-50 border-violet-200">
                      <div class="flex items-start justify-between gap-3">
                        <div class="flex items-center gap-2 min-w-0">
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-violet-200 text-violet-800">Difusión</span>
                          <p class="text-sm font-semibold text-slate-900 truncate">{{ item.grupo!.asunto }}</p>
                        </div>
                        <span class="text-xs text-slate-400 shrink-0">{{ fechaRelativa(item.grupo!.fechaEnvio) }}</span>
                      </div>
                      <p class="text-xs text-slate-500">
                        Enviado a <span class="font-medium text-violet-700">{{ item.grupo!.count }} destinatarios</span>
                      </p>
                    </div>
                  } @else {
                    <div class="card p-4 flex flex-col gap-1">
                      <div class="flex items-start justify-between gap-3">
                        <p class="text-sm font-semibold text-slate-900 truncate">{{ item.msg!.asunto }}</p>
                        <span class="text-xs text-slate-400 shrink-0">{{ fechaRelativa(item.msg!.fechaEnvio) }}</span>
                      </div>
                      <p class="text-xs text-slate-500">
                        Para: <span class="font-medium text-slate-700">{{ nombreDestinatario(item.msg!.idDestinatario) }}</span>
                      </p>
                    </div>
                  }
                }
              </div>
            }
          }
        }
      </div>
    </div>

    <!-- Modal de redacción -->
    <app-modal [open]="modalAbierto()" [title]="tituloModal()" size="lg" (closed)="cerrarModal()">
      <div class="flex flex-col gap-4">

        <!-- Toggle Directo / Difusión (solo si hay grupos) -->
        @if (grupos().length > 0) {
          <div class="flex gap-2 p-1 rounded-xl bg-slate-100 self-start">
            <button
              type="button"
              (click)="modoModal.set('directo')"
              class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
              [class.bg-white]="modoModal() === 'directo'"
              [class.text-slate-900]="modoModal() === 'directo'"
              [class.shadow-sm]="modoModal() === 'directo'"
              [class.text-slate-500]="modoModal() !== 'directo'"
            >
              Mensaje directo
            </button>
            <button
              type="button"
              (click)="modoModal.set('difusion')"
              class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
              [class.bg-white]="modoModal() === 'difusion'"
              [class.text-slate-900]="modoModal() === 'difusion'"
              [class.shadow-sm]="modoModal() === 'difusion'"
              [class.text-slate-500]="modoModal() !== 'difusion'"
            >
              Difusión
            </button>
          </div>
        }

        <!-- Formulario Directo -->
        @if (modoModal() === 'directo') {
          <form [formGroup]="formDirecto" (ngSubmit)="enviarDirecto()" class="flex flex-col gap-4">
            <!-- Selector de destinatario agrupado por origen -->
            <div>
              <label class="label">Destinatario *</label>
              @if (cargandoContactos()) {
                <div class="h-9 rounded-xl bg-slate-100 animate-pulse"></div>
              } @else {
                <select formControlName="idDestinatario" class="input-field" [class.error]="invalidoDirecto('idDestinatario')">
                  <option value="">Selecciona un destinatario...</option>
                  @for (grupo of contactosPorOrigen(); track grupo.origen) {
                    <optgroup [label]="grupo.origen">
                      @for (c of grupo.contactos; track c.idUsuario) {
                        <option [value]="c.idUsuario">{{ c.nombre }} ({{ c.rol }})</option>
                      }
                    </optgroup>
                  }
                </select>
              }
              @if (invalidoDirecto('idDestinatario')) {
                <p class="error-text">Selecciona un destinatario.</p>
              }
            </div>

            <div>
              <label class="label">Asunto *</label>
              <input
                type="text"
                formControlName="asunto"
                class="input-field"
                [class.error]="invalidoDirecto('asunto')"
                placeholder="Escribe el asunto..."
                maxlength="200"
              />
              @if (invalidoDirecto('asunto')) {
                <p class="error-text">El asunto es obligatorio (máx. 200 caracteres).</p>
              }
            </div>

            <div>
              <label class="label">Contenido *</label>
              <textarea
                formControlName="contenido"
                class="input-field min-h-[120px] resize-none"
                [class.error]="invalidoDirecto('contenido')"
                placeholder="Escribe tu mensaje..."
                maxlength="2000"
                rows="5"
              ></textarea>
              @if (invalidoDirecto('contenido')) {
                <p class="error-text">El contenido es obligatorio (máx. 2000 caracteres).</p>
              }
            </div>

            <div class="flex justify-end gap-3 pt-1">
              <button type="button" (click)="cerrarModal()" class="btn-secondary">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="enviando()">
                @if (enviando()) {
                  <app-spinner size="sm" />
                }
                Enviar
              </button>
            </div>
          </form>
        }

        <!-- Formulario Difusión -->
        @if (modoModal() === 'difusion') {
          <form [formGroup]="formDifusion" (ngSubmit)="enviarDifusion()" class="flex flex-col gap-4">
            <div>
              <label class="label">Grupo de difusión *</label>
              @if (cargandoGrupos()) {
                <div class="h-9 rounded-xl bg-slate-100 animate-pulse"></div>
              } @else {
                <select formControlName="grupoId" class="input-field" [class.error]="invalidoDifusion('grupoId')">
                  <option value="">Selecciona un grupo...</option>
                  @for (g of grupos(); track g.id) {
                    <option [value]="g.id">{{ g.nombre }} — {{ g.descripcion }}</option>
                  }
                </select>
              }
              @if (invalidoDifusion('grupoId')) {
                <p class="error-text">Selecciona un grupo.</p>
              }
            </div>

            <div>
              <label class="label">Asunto *</label>
              <input
                type="text"
                formControlName="asunto"
                class="input-field"
                [class.error]="invalidoDifusion('asunto')"
                placeholder="Escribe el asunto..."
                maxlength="200"
              />
              @if (invalidoDifusion('asunto')) {
                <p class="error-text">El asunto es obligatorio (máx. 200 caracteres).</p>
              }
            </div>

            <div>
              <label class="label">Contenido *</label>
              <textarea
                formControlName="contenido"
                class="input-field min-h-[120px] resize-none"
                [class.error]="invalidoDifusion('contenido')"
                placeholder="Escribe el mensaje de difusión..."
                maxlength="2000"
                rows="5"
              ></textarea>
              @if (invalidoDifusion('contenido')) {
                <p class="error-text">El contenido es obligatorio (máx. 2000 caracteres).</p>
              }
            </div>

            <div class="flex justify-end gap-3 pt-1">
              <button type="button" (click)="cerrarModal()" class="btn-secondary">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="enviando()">
                @if (enviando()) {
                  <app-spinner size="sm" />
                }
                Enviar difusión
              </button>
            </div>
          </form>
        }
      </div>
    </app-modal>
  `,
})
export class MensajesComponent implements OnInit {
  private readonly mensajeriaApi = inject(MensajeriaApiService);
  private readonly usuarioApi = inject(UsuarioApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // ─── Estado de bandeja ───────────────────────────────────────────────────
  readonly tab = signal<Tab>('recibidos');
  readonly cargando = signal(true);
  readonly recibidos = signal<MensajeDto[]>([]);
  readonly enviados = signal<MensajeDto[]>([]);
  readonly mensajeExpandido = signal<number | null>(null);

  /** Cache de perfiles: idUsuario → nombre para mostrar */
  private readonly perfilesCache = signal<Map<number, string>>(new Map());

  /** Conteo de mensajes no leídos */
  readonly noLeidosCount = computed(() => this.recibidos().filter((m) => !m.leido).length);

  /**
   * Enviados listos para mostrar: agrupa copias de difusión en una tarjeta,
   * deja los mensajes directos como están.
   * Cada item tiene un campo `key` único para usarlo en @for track.
   */
  readonly enviadosItems = computed((): EnviadoItem[] => {
    const lista = this.enviados();

    // Agrupar las copias de difusion (loteDifusion !== null)
    const difusionMap = new Map<string, GrupoDifusion>();
    const directos: MensajeDto[] = [];

    for (const msg of lista) {
      if (msg.loteDifusion !== null) {
        const existing = difusionMap.get(msg.loteDifusion);
        if (existing) {
          existing.count += 1;
        } else {
          difusionMap.set(msg.loteDifusion, {
            loteDifusion: msg.loteDifusion,
            asunto: msg.asunto,
            fechaEnvio: msg.fechaEnvio,
            count: 1,
          });
        }
      } else {
        directos.push(msg);
      }
    }

    const result: EnviadoItem[] = [];

    for (const msg of directos) {
      result.push({ key: `directo-${msg.id}`, tipo: 'directo', msg, grupo: null });
    }
    for (const grupo of difusionMap.values()) {
      result.push({ key: `difusion-${grupo.loteDifusion}`, tipo: 'difusion', msg: null, grupo });
    }

    // Orden cronológico descendente uniforme (directos y difusiones intercalados por fecha).
    result.sort((a, b) => {
      const fa = a.tipo === 'directo' ? a.msg!.fechaEnvio : a.grupo!.fechaEnvio;
      const fb = b.tipo === 'directo' ? b.msg!.fechaEnvio : b.grupo!.fechaEnvio;
      return fb.localeCompare(fa);
    });

    return result;
  });

  // ─── Modal y formularios ─────────────────────────────────────────────────
  readonly modalAbierto = signal(false);
  readonly modoModal = signal<ModoModal>('directo');
  readonly enviando = signal(false);
  readonly cargandoContactos = signal(true);
  readonly cargandoGrupos = signal(true);
  readonly contactos = signal<ContactoDto[]>([]);
  readonly grupos = signal<GrupoDto[]>([]);

  /** Contactos agrupados por campo `origen` para el `<optgroup>` */
  readonly contactosPorOrigen = computed(() => {
    const mapa = new Map<string, ContactoDto[]>();
    for (const c of this.contactos()) {
      const grupo = mapa.get(c.origen) ?? [];
      grupo.push(c);
      mapa.set(c.origen, grupo);
    }
    return Array.from(mapa.entries()).map(([origen, contactosList]) => ({
      origen,
      contactos: contactosList,
    }));
  });

  readonly tituloModal = computed(() =>
    this.modoModal() === 'difusion' ? 'Difusión' : 'Nuevo mensaje'
  );

  readonly formDirecto: FormGroup = this.fb.group({
    idDestinatario: ['', [Validators.required]],
    asunto: ['', [Validators.required, Validators.maxLength(200)]],
    contenido: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  readonly formDifusion: FormGroup = this.fb.group({
    grupoId: ['', [Validators.required]],
    asunto: ['', [Validators.required, Validators.maxLength(200)]],
    contenido: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  // ─── Ciclo de vida ───────────────────────────────────────────────────────

  ngOnInit(): void {
    this.cargarBandeja();
  }

  // ─── Carga de datos ──────────────────────────────────────────────────────

  private cargarBandeja(): void {
    this.cargando.set(true);

    forkJoin({
      recibidos: this.mensajeriaApi.recibidos().pipe(catchError(() => of([] as MensajeDto[]))),
      enviados: this.mensajeriaApi.enviados().pipe(catchError(() => of([] as MensajeDto[]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ recibidos, enviados }) => {
        this.recibidos.set(recibidos);
        this.enviados.set(enviados);
        this.cargando.set(false);
        this.resolverNombres(recibidos, enviados);
      });
  }

  /**
   * Resuelve nombres de remitentes y destinatarios en una sola llamada batch
   * y los almacena en perfilesCache.
   */
  private resolverNombres(recibidos: MensajeDto[], enviados: MensajeDto[]): void {
    const ids = new Set<number>();
    for (const m of recibidos) { ids.add(m.idRemitente); }
    for (const m of enviados) { ids.add(m.idDestinatario); }

    if (ids.size === 0) return;

    this.usuarioApi
      .perfiles(Array.from(ids))
      .pipe(
        catchError(() => of([] as PerfilPublico[])),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((perfiles) => {
        const map = new Map<number, string>();
        for (const p of perfiles) {
          map.set(p.id, p.username);
        }
        this.perfilesCache.set(map);
      });
  }

  private cargarContactosYGrupos(): void {
    this.cargandoContactos.set(true);
    this.cargandoGrupos.set(true);

    this.mensajeriaApi
      .contactos()
      .pipe(
        catchError(() => of([] as ContactoDto[])),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((lista) => {
        this.contactos.set(lista);
        this.cargandoContactos.set(false);
      });

    this.mensajeriaApi
      .grupos()
      .pipe(
        catchError(() => of([] as GrupoDto[])),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((lista) => {
        this.grupos.set(lista);
        this.cargandoGrupos.set(false);
      });
  }

  // ─── Acciones de bandeja ─────────────────────────────────────────────────

  seleccionarRecibido(msg: MensajeDto): void {
    const yaExpandido = this.mensajeExpandido() === msg.id;
    this.mensajeExpandido.set(yaExpandido ? null : msg.id);

    // Marcar como leído si no lo estaba
    if (!msg.leido) {
      this.mensajeriaApi
        .marcarLeido(msg.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.recibidos.update((lista) =>
              lista.map((m) => (m.id === msg.id ? { ...m, leido: true } : m))
            );
          },
          error: () => {},
        });
    }
  }

  responder(msg: MensajeDto): void {
    this.abrirRedactar();
    // Precarga el destinatario = remitente del mensaje recibido
    this.formDirecto.patchValue({
      idDestinatario: msg.idRemitente,
      asunto: msg.asunto.startsWith('Re: ') ? msg.asunto : `Re: ${msg.asunto}`,
    });
    this.modoModal.set('directo');
  }

  // ─── Modal ───────────────────────────────────────────────────────────────

  abrirRedactar(): void {
    this.formDirecto.reset({ idDestinatario: '', asunto: '', contenido: '' });
    this.formDifusion.reset({ grupoId: '', asunto: '', contenido: '' });
    this.modoModal.set('directo');
    this.modalAbierto.set(true);
    this.cargarContactosYGrupos();
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  enviarDirecto(): void {
    this.formDirecto.markAllAsTouched();
    if (this.formDirecto.invalid || this.enviando()) return;

    const raw = this.formDirecto.getRawValue() as {
      idDestinatario: string;
      asunto: string;
      contenido: string;
    };

    this.enviando.set(true);
    this.mensajeriaApi
      .enviar({
        idDestinatario: Number(raw.idDestinatario),
        asunto: raw.asunto.trim(),
        contenido: raw.contenido.trim(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (nuevo) => {
          this.enviando.set(false);
          this.cerrarModal();
          this.toast.success('Mensaje enviado.');
          // Agregar el nuevo mensaje a la bandeja de enviados
          this.enviados.update((lista) => [nuevo, ...lista]);
          // Resolver el nombre del destinatario si no está en caché
          const destId = nuevo.idDestinatario;
          if (!this.perfilesCache().has(destId)) {
            this.usuarioApi
              .perfiles([destId])
              .pipe(
                catchError(() => of([] as PerfilPublico[])),
                takeUntilDestroyed(this.destroyRef),
              )
              .subscribe((perfiles) => {
                if (perfiles.length > 0) {
                  this.perfilesCache.update((m) => {
                    const next = new Map(m);
                    next.set(perfiles[0].id, perfiles[0].username);
                    return next;
                  });
                }
              });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.enviando.set(false);
          if (err.status === 403) {
            this.toast.error('No tienes permiso para escribir a este destinatario.');
          } else {
            this.toast.error('No se pudo enviar el mensaje. Intenta nuevamente.');
          }
        },
      });
  }

  enviarDifusion(): void {
    this.formDifusion.markAllAsTouched();
    if (this.formDifusion.invalid || this.enviando()) return;

    const raw = this.formDifusion.getRawValue() as {
      grupoId: string;
      asunto: string;
      contenido: string;
    };

    this.enviando.set(true);
    this.mensajeriaApi
      .difusion({
        grupoId: raw.grupoId,
        asunto: raw.asunto.trim(),
        contenido: raw.contenido.trim(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.enviando.set(false);
          this.cerrarModal();
          this.toast.success(`Difusión enviada a ${res.enviados} destinatarios.`);
          // Recargar la bandeja de enviados para mostrar las nuevas copias agrupadas
          this.mensajeriaApi
            .enviados()
            .pipe(
              catchError(() => of([] as MensajeDto[])),
              takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((lista) => this.enviados.set(lista));
        },
        error: (err: unknown) => {
          this.enviando.set(false);
          const status = (err as { status?: number }).status;
          this.toast.error(status === 400
            ? 'Grupo no permitido o sin destinatarios.'
            : 'No se pudo enviar la difusión. Intenta nuevamente.');
        },
      });
  }

  // ─── Helpers de presentación ─────────────────────────────────────────────

  nombreRemitente(id: number): string {
    return this.perfilesCache().get(id) ?? `Usuario #${id}`;
  }

  nombreDestinatario(id: number): string {
    return this.perfilesCache().get(id) ?? `Usuario #${id}`;
  }

  invalidoDirecto(campo: string): boolean {
    const c = this.formDirecto.get(campo);
    return !!(c?.invalid && c.touched);
  }

  invalidoDifusion(campo: string): boolean {
    const c = this.formDifusion.get(campo);
    return !!(c?.invalid && c.touched);
  }

  /** Fecha relativa simple (hoy / ayer / dd/mm/aaaa). */
  fechaRelativa(iso: string): string {
    if (!iso) return '';
    const fecha = new Date(iso);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);

    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffH < 24) return `Hace ${diffH} h`;
    if (diffD === 1) return 'Ayer';
    const d = String(fecha.getDate()).padStart(2, '0');
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const y = fecha.getFullYear();
    return `${d}/${m}/${y}`;
  }
}
