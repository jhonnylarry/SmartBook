import { Component, inject, signal, input, effect } from '@angular/core';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { DocumentoEvaluacionDTO } from '../../../core/models/academico.model';

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Lista, sube, descarga y elimina los PDF (p.ej. "prueba física") adjuntos a una
 * evaluación. Reutilizado por el workspace de Director y el de Docente.
 * La descarga se hace como Blob vía HttpClient (el gateway exige el Bearer token,
 * por lo que un <a href> directo daría 401).
 */
@Component({
  selector: 'app-documentos-evaluacion',
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    <div class="flex flex-col gap-4">

      <!-- Subir -->
      @if (auth.canManageNotas()) {
        <div class="card p-4 border-dashed border-2 border-slate-200 bg-slate-50/60">
          <div class="flex flex-col sm:flex-row sm:items-center gap-3">
            <div class="flex-1">
              <p class="text-sm font-medium text-slate-700">Subir registro (PDF)</p>
              <p class="text-xs text-slate-400 mt-0.5">Sube el documento de la prueba física u otro respaldo. Máx. 10 MB.</p>
            </div>
            <input
              #fileInput
              type="file"
              accept="application/pdf"
              class="hidden"
              (change)="onArchivoSeleccionado($event)"
            />
            <button
              (click)="fileInput.click()"
              [disabled]="subiendo()"
              class="btn-primary shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (subiendo()) {
                <app-spinner size="sm" />
                Subiendo...
              } @else {
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Subir PDF
              }
            </button>
          </div>
        </div>
      }

      <!-- Listado -->
      @if (cargando()) {
        <div class="flex items-center gap-2 text-sm text-slate-500 py-4">
          <app-spinner size="sm" />
          Cargando documentos...
        </div>
      } @else if (documentos().length === 0) {
        <div class="flex flex-col items-center justify-center gap-2 text-center py-8">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p class="text-slate-500 text-sm">Sin documentos para esta evaluación.</p>
        </div>
      } @else {
        <div class="flex flex-col gap-2">
          @for (doc of documentos(); track doc.id) {
            <div class="card p-3 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-800 truncate">{{ doc.nombreArchivo }}</p>
                <p class="text-xs text-slate-400">{{ formatTamano(doc.tamanoBytes) }} · {{ formatFecha(doc.fechaCarga) }}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button
                  (click)="descargar(doc)"
                  [disabled]="descargandoId() === doc.id"
                  class="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-700 font-medium transition-colors border border-slate-200 flex items-center gap-1.5 disabled:opacity-50"
                >
                  @if (descargandoId() === doc.id) {
                    <app-spinner size="sm" />
                  } @else {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  }
                  Descargar
                </button>
                @if (auth.canManageNotas()) {
                  <button
                    (click)="eliminar(doc)"
                    class="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors border border-red-200"
                  >
                    Eliminar
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DocumentosEvaluacionComponent {
  private readonly api = inject(AcademicoApiService);
  private readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);

  readonly idEvaluacion = input.required<number>();

  readonly documentos = signal<DocumentoEvaluacionDTO[]>([]);
  readonly cargando = signal(false);
  readonly subiendo = signal(false);
  readonly descargandoId = signal<number | null>(null);

  constructor() {
    // Recarga la lista cada vez que cambia la evaluación seleccionada.
    effect(() => {
      const id = this.idEvaluacion();
      if (id) {
        this.cargar(id);
      }
    });
  }

  private cargar(idEvaluacion: number): void {
    this.cargando.set(true);
    this.api.documentosDeEvaluacion(idEvaluacion).subscribe({
      next: (docs) => {
        this.documentos.set(docs);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // permite re-seleccionar el mismo archivo
    if (!file) return;

    const esPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!esPdf) {
      this.toast.error('El archivo debe ser un PDF.');
      return;
    }
    if (file.size > MAX_BYTES) {
      this.toast.error('El archivo supera el tamaño máximo permitido (10 MB).');
      return;
    }

    this.subiendo.set(true);
    this.api.subirDocumentoEvaluacion(this.idEvaluacion(), file).subscribe({
      next: (doc) => {
        this.documentos.update((lista) => [...lista, doc]);
        this.subiendo.set(false);
        this.toast.success('Documento subido correctamente.');
      },
      error: () => {
        this.subiendo.set(false);
      },
    });
  }

  descargar(doc: DocumentoEvaluacionDTO): void {
    this.descargandoId.set(doc.id);
    this.api.descargarDocumentoEvaluacion(doc.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.nombreArchivo; // nombre desde la metadata (Content-Disposition no es legible vía gateway)
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.descargandoId.set(null);
      },
      error: () => {
        this.toast.error('No se pudo descargar el documento.');
        this.descargandoId.set(null);
      },
    });
  }

  eliminar(doc: DocumentoEvaluacionDTO): void {
    if (!confirm(`¿Eliminar el documento "${doc.nombreArchivo}"?`)) return;
    this.api.eliminarDocumentoEvaluacion(doc.id).subscribe({
      next: () => {
        this.documentos.update((lista) => lista.filter((d) => d.id !== doc.id));
        this.toast.success('Documento eliminado.');
      },
      error: () => {
        this.toast.error('No se pudo eliminar el documento.');
      },
    });
  }

  formatTamano(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  formatFecha(iso: string): string {
    if (!iso) return '--';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
