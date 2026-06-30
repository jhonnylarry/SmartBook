import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { VidaApiService } from '../../../core/api/vida-api.service';
import { EstudianteApiService } from '../../../core/api/estudiante-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import {
  HojaVidaEstudianteDTO,
  AntecedenteAcademicoDTO,
  AntecedenteFamiliarDTO,
  AntecedenteMedicoDTO,
  DocumentoAdjuntoDTO,
} from '../../../core/models/vida-estudiante.model';
import { EstudianteDTO } from '../../../core/models/estudiante.model';

type PestanaActiva = 'academicos' | 'familiares' | 'medicos' | 'documentos';
type ModalTipo = 'hoja' | 'academico' | 'familiar' | 'medico' | 'documento' | null;

@Component({
  selector: 'app-hoja-vida',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, ModalComponent, SkeletonComponent, SpinnerComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="page-title">Hoja de Vida</h1>
          <p class="text-slate-500 text-sm mt-1">Antecedentes y documentos del estudiante.</p>
        </div>
      </div>

      <!-- Selector de estudiante -->
      <div class="card p-4 shrink-0">
        <label class="label mb-2 block">Seleccionar estudiante</label>
        @if (loadingEstudiantes()) {
          <div class="flex items-center gap-2 text-sm text-slate-500">
            <app-spinner size="sm" />
            Cargando estudiantes...
          </div>
        } @else {
          <select
            [(ngModel)]="idEstudianteStr"
            (ngModelChange)="onCambioEstudiante($event)"
            class="input-field"
          >
            <option value="">-- Selecciona un estudiante --</option>
            @for (est of estudiantes(); track est.id) {
              <option [value]="est.id.toString()">{{ est.nombre }} {{ est.apellido }} &mdash; {{ est.rut }}</option>
            }
          </select>
        }
      </div>

      <!-- Sin estudiante seleccionado -->
      @if (!estudianteSeleccionado()) {
        <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <p class="text-slate-600 font-medium">Selecciona un estudiante</p>
            <p class="text-slate-400 text-sm mt-1">La hoja de vida del estudiante aparecera aqui.</p>
          </div>
        </div>

      } @else if (loadingHoja()) {
        <!-- Cargando hoja -->
        <div class="flex flex-col gap-3">
          @for (i of [1,2]; track i) {
            <app-skeleton variant="card" />
          }
        </div>

      } @else if (!hoja()) {
        <!-- Sin hoja de vida -->
        <div class="card p-6 flex flex-col items-center gap-4 text-center">
          <div class="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
            <svg class="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <p class="text-slate-700 font-semibold">Sin hoja de vida</p>
            <p class="text-slate-400 text-sm mt-1">Este estudiante aun no tiene una hoja de vida registrada.</p>
          </div>
          @if (auth.canManageHojaVida()) {
            <button (click)="abrirModalHoja()" class="btn-primary mt-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Crear hoja de vida
            </button>
          }
        </div>

      } @else {
        <!-- Hoja de vida existente -->
        <div class="flex flex-col gap-4 flex-1 min-h-0 overflow-auto pr-1">

          <!-- Card cabecera -->
          <div class="card p-5">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100">
                    Ano academico {{ hoja()!.anioAcademico }}
                  </span>
                </div>
                @if (hoja()!.observaciones) {
                  <p class="text-sm text-slate-600 mt-2 leading-relaxed">{{ hoja()!.observaciones }}</p>
                } @else {
                  <p class="text-sm text-slate-400 italic mt-2">Sin observaciones generales.</p>
                }
                <p class="text-xs text-slate-400 mt-1">Creada: {{ formatFecha(hoja()!.fechaCreacion) }}</p>
              </div>
              @if (auth.canManageHojaVida()) {
                <button (click)="abrirModalHoja(true)" class="btn-secondary self-start shrink-0">Editar</button>
              }
            </div>
          </div>

          <!-- Pestanas de secciones -->
          <div class="flex gap-1 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto">
            @for (tab of pestanas; track tab.id) {
              <button
                (click)="pestanaActiva.set(tab.id)"
                class="flex-1 min-w-max text-xs font-semibold py-2 px-3 rounded-lg transition-all duration-200 whitespace-nowrap"
                [class]="pestanaActiva() === tab.id
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'"
              >
                {{ tab.label }}
              </button>
            }
          </div>

          <!-- Secciones -->

          <!-- ── Academicos ── -->
          @if (pestanaActiva() === 'academicos') {
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <h3 class="section-title">Antecedentes Academicos</h3>
                @if (auth.canManageHojaVida()) {
                  <button (click)="abrirModal('academico')" class="btn-primary text-xs px-3 py-1.5">+ Agregar</button>
                }
              </div>
              @if (loadingSeccion()) {
                @for (i of [1,2]; track i) { <app-skeleton variant="card" /> }
              } @else if (academicos().length === 0) {
                <p class="text-sm text-slate-400 italic px-1">Sin antecedentes academicos registrados.</p>
              } @else {
                @for (ac of academicos(); track ac.id) {
                  <div class="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <p class="text-xs text-slate-400">Colegio de procedencia</p>
                        <p class="text-sm font-medium text-slate-800">{{ ac.colegioProcedencia || '--' }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-400">Fecha de ingreso</p>
                        <p class="text-sm font-medium text-slate-800">{{ formatFecha(ac.fechaIngreso ?? '') }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-400">Vive con</p>
                        <p class="text-sm font-medium text-slate-800">{{ ac.viveCon || '--' }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-400">Promedio general</p>
                        <p class="text-sm font-bold text-primary-700">{{ ac.promedioGeneral != null ? ac.promedioGeneral.toFixed(1) : '--' }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      @if (auth.canManageHojaVida()) {
                        <button (click)="abrirModalEdicion('academico', ac)" class="text-xs px-2.5 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium border border-primary-200 transition-colors">Editar</button>
                      }
                      @if (auth.hasRole('ADMINISTRADOR')) {
                        <button (click)="eliminar('academico', ac.id)" class="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium border border-red-200 transition-colors">Eliminar</button>
                      }
                    </div>
                  </div>
                }
              }
            </div>
          }

          <!-- ── Familiares ── -->
          @if (pestanaActiva() === 'familiares') {
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <h3 class="section-title">Antecedentes Familiares</h3>
                @if (auth.canManageAntecedentesSensibles()) {
                  <button (click)="abrirModal('familiar')" class="btn-primary text-xs px-3 py-1.5">+ Agregar</button>
                }
              </div>
              @if (loadingSeccion()) {
                @for (i of [1,2]; track i) { <app-skeleton variant="card" /> }
              } @else if (familiares().length === 0) {
                <p class="text-sm text-slate-400 italic px-1">Sin antecedentes familiares registrados.</p>
              } @else {
                @for (fam of familiares(); track fam.id) {
                  <div class="card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                    [class.ring-2]="fam.esContactoEmergencia"
                    [class.ring-red-300]="fam.esContactoEmergencia"
                  >
                    <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <p class="text-xs text-slate-400">Nombre</p>
                        <div class="flex items-center gap-2">
                          <p class="text-sm font-medium text-slate-800">{{ fam.nombre }}</p>
                          @if (fam.esContactoEmergencia) {
                            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                              Contacto emergencia
                            </span>
                          }
                        </div>
                      </div>
                      <div>
                        <p class="text-xs text-slate-400">Parentesco</p>
                        <p class="text-sm font-medium text-slate-800">{{ fam.parentesco }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-400">Telefono</p>
                        <p class="text-sm font-medium text-slate-800">{{ fam.telefono || '--' }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-400">Ocupacion</p>
                        <p class="text-sm font-medium text-slate-800">{{ fam.ocupacion || '--' }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      @if (auth.canManageAntecedentesSensibles()) {
                        <button (click)="abrirModalEdicion('familiar', fam)" class="text-xs px-2.5 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium border border-primary-200 transition-colors">Editar</button>
                        <button (click)="eliminar('familiar', fam.id)" class="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium border border-red-200 transition-colors">Eliminar</button>
                      }
                    </div>
                  </div>
                }
              }
            </div>
          }

          <!-- ── Medicos ── -->
          @if (pestanaActiva() === 'medicos') {
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <h3 class="section-title">Antecedentes Medicos</h3>
                @if (auth.canManageAntecedentesSensibles()) {
                  <button (click)="abrirModal('medico')" class="btn-primary text-xs px-3 py-1.5">+ Agregar</button>
                }
              </div>
              @if (loadingSeccion()) {
                @for (i of [1]; track i) { <app-skeleton variant="card" /> }
              } @else if (medicos().length === 0) {
                <p class="text-sm text-slate-400 italic px-1">Sin antecedentes medicos registrados.</p>
              } @else {
                @for (med of medicos(); track med.id) {
                  <div class="card p-5 flex flex-col gap-4">
                    <!-- Datos destacados -->
                    <div class="flex flex-wrap gap-3">
                      <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100">
                        <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4.745 3A23.933 23.933 0 003 12c0 3.183.62 6.22 1.745 9M19.5 3c.967 2.759 1.5 5.743 1.5 8.862 0 3.12-.535 6.097-1.5 8.862M12 5v14M5.25 5.5C7.5 6.5 9 9 9 12s-1.5 5.5-3.75 6.5M18.75 5.5C16.5 6.5 15 9 15 12s1.5 5.5 3.75 6.5" />
                        </svg>
                        <div>
                          <p class="text-xs text-red-400 font-medium">Tipo de sangre</p>
                          <p class="text-sm font-bold text-red-700">{{ med.tipoSangre || 'No registrado' }}</p>
                        </div>
                      </div>
                      @if (med.alergias) {
                        <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                          <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                          </svg>
                          <div>
                            <p class="text-xs text-amber-500 font-medium">Alergias</p>
                            <p class="text-sm font-semibold text-amber-700">{{ med.alergias }}</p>
                          </div>
                        </div>
                      }
                    </div>
                    <!-- Resto de campos -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <p class="text-xs text-slate-400">Enfermedades cronicas</p>
                        <p class="text-sm text-slate-700">{{ med.enfermedadesCronicas || '--' }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-400">Medicacion</p>
                        <p class="text-sm text-slate-700">{{ med.medicacion || '--' }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-400">Prevision de salud</p>
                        <p class="text-sm text-slate-700">{{ med.previsionSalud || '--' }}</p>
                      </div>
                    </div>
                    <!-- Acciones -->
                    <div class="flex justify-end gap-2">
                      @if (auth.canManageAntecedentesSensibles()) {
                        <button (click)="abrirModalEdicion('medico', med)" class="text-xs px-2.5 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium border border-primary-200 transition-colors">Editar</button>
                        <button (click)="eliminar('medico', med.id)" class="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium border border-red-200 transition-colors">Eliminar</button>
                      }
                    </div>
                  </div>
                }
              }
            </div>
          }

          <!-- ── Documentos ── -->
          @if (pestanaActiva() === 'documentos') {
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <h3 class="section-title">Documentos Adjuntos</h3>
                @if (auth.canManageHojaVida()) {
                  <button (click)="abrirModal('documento')" class="btn-primary text-xs px-3 py-1.5">+ Agregar</button>
                }
              </div>
              @if (loadingSeccion()) {
                @for (i of [1,2]; track i) { <app-skeleton variant="tableRow" /> }
              } @else if (documentos().length === 0) {
                <p class="text-sm text-slate-400 italic px-1">Sin documentos adjuntos registrados.</p>
              } @else {
                @for (doc of documentos(); track doc.id) {
                  <div class="card p-4 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                      <svg class="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-slate-800 truncate">{{ doc.nombre }}</p>
                      <p class="text-xs text-slate-400">{{ doc.tipoMime || 'Sin tipo' }} &middot; {{ formatFecha(doc.fechaCarga) }}</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      @if (doc.url) {
                        <a
                          [href]="doc.url"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium border border-slate-200 transition-colors"
                        >
                          Ver
                        </a>
                      }
                      @if (auth.canManageHojaVida()) {
                        <button (click)="abrirModalEdicion('documento', doc)" class="text-xs px-2.5 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium border border-primary-200 transition-colors">Editar</button>
                      }
                      @if (auth.hasRole('ADMINISTRADOR', 'DIRECTOR')) {
                        <button (click)="eliminar('documento', doc.id)" class="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium border border-red-200 transition-colors">Eliminar</button>
                      }
                    </div>
                  </div>
                }
              }
            </div>
          }

        </div>
      }

    </div>

    <!-- ══════════════════════════════════════
         MODALES
    ══════════════════════════════════════ -->

    <!-- Modal Hoja de Vida (crear / editar cabecera) -->
    <app-modal
      [open]="modalAbierto() === 'hoja'"
      [title]="hoja() ? 'Editar Hoja de Vida' : 'Crear Hoja de Vida'"
      size="md"
      (closed)="cerrarModal()"
    >
      <form [formGroup]="formHoja" (ngSubmit)="guardarHoja()" class="space-y-4">
        <div>
          <label class="label">Ano academico * <span class="text-xs text-slate-400 font-normal">(ej. 2026)</span></label>
          <input type="text" formControlName="anioAcademico" class="input-field" [class.error]="esInvalido(formHoja, 'anioAcademico')" placeholder="2026" maxlength="10" />
          @if (esInvalido(formHoja, 'anioAcademico')) { <p class="error-text">El ano academico es obligatorio (max. 10 caracteres).</p> }
        </div>
        <div>
          <label class="label">Observaciones <span class="text-xs text-slate-400 font-normal">(max. 2000)</span></label>
          <textarea formControlName="observaciones" rows="4" class="input-field resize-none" placeholder="Observaciones generales del estudiante..."></textarea>
          @if (esInvalido(formHoja, 'observaciones')) { <p class="error-text">Maximo 2000 caracteres.</p> }
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" (click)="cerrarModal()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="guardando()">
            @if (guardando()) { <app-spinner size="sm" /> }
            {{ hoja() ? 'Guardar cambios' : 'Crear hoja' }}
          </button>
        </div>
      </form>
    </app-modal>

    <!-- Modal Antecedente Academico -->
    <app-modal
      [open]="modalAbierto() === 'academico'"
      [title]="editandoId() ? 'Editar Antecedente Academico' : 'Nuevo Antecedente Academico'"
      size="md"
      (closed)="cerrarModal()"
    >
      <form [formGroup]="formAcademico" (ngSubmit)="guardarAcademico()" class="space-y-4">
        <div>
          <label class="label">Colegio de procedencia</label>
          <input type="text" formControlName="colegioProcedencia" class="input-field" placeholder="Nombre del colegio anterior" />
        </div>
        <div>
          <label class="label">Fecha de ingreso</label>
          <input type="date" formControlName="fechaIngreso" class="input-field" />
        </div>
        <div>
          <label class="label">Vive con</label>
          <input type="text" formControlName="viveCon" class="input-field" placeholder="Ej: Ambos padres, madre, abuelos..." />
        </div>
        <div>
          <label class="label">Promedio general <span class="text-xs text-slate-400 font-normal">(1.0 - 7.0)</span></label>
          <input type="number" formControlName="promedioGeneral" class="input-field" [class.error]="esInvalido(formAcademico, 'promedioGeneral')"
            min="1.0" max="7.0" step="0.1" placeholder="5.5" />
          @if (esInvalido(formAcademico, 'promedioGeneral')) { <p class="error-text">El promedio debe estar entre 1.0 y 7.0.</p> }
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" (click)="cerrarModal()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="guardando()">
            @if (guardando()) { <app-spinner size="sm" /> }
            Guardar
          </button>
        </div>
      </form>
    </app-modal>

    <!-- Modal Antecedente Familiar -->
    <app-modal
      [open]="modalAbierto() === 'familiar'"
      [title]="editandoId() ? 'Editar Antecedente Familiar' : 'Nuevo Antecedente Familiar'"
      size="md"
      (closed)="cerrarModal()"
    >
      <form [formGroup]="formFamiliar" (ngSubmit)="guardarFamiliar()" class="space-y-4">
        <div>
          <label class="label">Nombre *</label>
          <input type="text" formControlName="nombre" class="input-field" [class.error]="esInvalido(formFamiliar, 'nombre')" placeholder="Nombre completo" />
          @if (esInvalido(formFamiliar, 'nombre')) { <p class="error-text">El nombre es obligatorio.</p> }
        </div>
        <div>
          <label class="label">Parentesco *</label>
          <input type="text" formControlName="parentesco" class="input-field" [class.error]="esInvalido(formFamiliar, 'parentesco')" placeholder="Ej: Padre, Madre, Tutor..." />
          @if (esInvalido(formFamiliar, 'parentesco')) { <p class="error-text">El parentesco es obligatorio.</p> }
        </div>
        <div>
          <label class="label">Telefono</label>
          <input type="tel" formControlName="telefono" class="input-field" placeholder="+56 9 1234 5678" />
        </div>
        <div>
          <label class="label">Ocupacion</label>
          <input type="text" formControlName="ocupacion" class="input-field" placeholder="Profesion u oficio" />
        </div>
        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <input type="checkbox" formControlName="esContactoEmergencia" id="chkEmergencia"
            class="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
          <label for="chkEmergencia" class="text-sm font-medium text-slate-700 cursor-pointer">
            Es contacto de emergencia
          </label>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" (click)="cerrarModal()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="guardando()">
            @if (guardando()) { <app-spinner size="sm" /> }
            Guardar
          </button>
        </div>
      </form>
    </app-modal>

    <!-- Modal Antecedente Medico -->
    <app-modal
      [open]="modalAbierto() === 'medico'"
      [title]="editandoId() ? 'Editar Antecedente Medico' : 'Nuevo Antecedente Medico'"
      size="md"
      (closed)="cerrarModal()"
    >
      <form [formGroup]="formMedico" (ngSubmit)="guardarMedico()" class="space-y-4">
        <div>
          <label class="label">Tipo de sangre</label>
          <input type="text" formControlName="tipoSangre" class="input-field" placeholder="Ej: A+, B-, O+" />
        </div>
        <div>
          <label class="label">Alergias</label>
          <textarea formControlName="alergias" rows="2" class="input-field resize-none" placeholder="Describa las alergias conocidas..."></textarea>
        </div>
        <div>
          <label class="label">Enfermedades cronicas</label>
          <textarea formControlName="enfermedadesCronicas" rows="2" class="input-field resize-none" placeholder="Enfermedades de larga duracion..."></textarea>
        </div>
        <div>
          <label class="label">Medicacion</label>
          <textarea formControlName="medicacion" rows="2" class="input-field resize-none" placeholder="Medicamentos en uso..."></textarea>
        </div>
        <div>
          <label class="label">Prevision de salud</label>
          <input type="text" formControlName="previsionSalud" class="input-field" placeholder="Ej: FONASA A, Isapre Cruz Blanca..." />
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" (click)="cerrarModal()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="guardando()">
            @if (guardando()) { <app-spinner size="sm" /> }
            Guardar
          </button>
        </div>
      </form>
    </app-modal>

    <!-- Modal Documento -->
    <app-modal
      [open]="modalAbierto() === 'documento'"
      [title]="editandoId() ? 'Editar Documento' : 'Nuevo Documento'"
      size="md"
      (closed)="cerrarModal()"
    >
      <form [formGroup]="formDocumento" (ngSubmit)="guardarDocumento()" class="space-y-4">
        <div>
          <label class="label">Nombre del documento *</label>
          <input type="text" formControlName="nombre" class="input-field" [class.error]="esInvalido(formDocumento, 'nombre')" placeholder="Ej: Certificado medico 2026" />
          @if (esInvalido(formDocumento, 'nombre')) { <p class="error-text">El nombre del documento es obligatorio.</p> }
        </div>
        <div>
          <label class="label">Tipo MIME</label>
          <input type="text" formControlName="tipoMime" class="input-field" placeholder="Ej: application/pdf, image/jpeg" />
        </div>
        <div>
          <label class="label">URL del documento <span class="text-xs text-slate-400 font-normal">(http/https)</span></label>
          <input type="url" formControlName="url" class="input-field" [class.error]="esInvalido(formDocumento, 'url')" placeholder="https://drive.google.com/..." />
          @if (esInvalido(formDocumento, 'url')) { <p class="error-text">Ingrese una URL valida (debe comenzar con http:// o https://).</p> }
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" (click)="cerrarModal()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="guardando()">
            @if (guardando()) { <app-spinner size="sm" /> }
            Guardar
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class HojaVidaComponent implements OnInit {
  private readonly vidaApi = inject(VidaApiService);
  private readonly estudianteApi = inject(EstudianteApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  // ── Estado global ──
  readonly loadingEstudiantes = signal(false);
  readonly loadingHoja = signal(false);
  readonly loadingSeccion = signal(false);
  readonly guardando = signal(false);

  readonly estudiantes = signal<EstudianteDTO[]>([]);
  readonly estudianteSeleccionado = signal<number | null>(null);
  readonly hoja = signal<HojaVidaEstudianteDTO | null>(null);

  // ── Estado de secciones ──
  readonly pestanaActiva = signal<PestanaActiva>('academicos');
  readonly academicos = signal<AntecedenteAcademicoDTO[]>([]);
  readonly familiares = signal<AntecedenteFamiliarDTO[]>([]);
  readonly medicos = signal<AntecedenteMedicoDTO[]>([]);
  readonly documentos = signal<DocumentoAdjuntoDTO[]>([]);

  // ── Modales ──
  readonly modalAbierto = signal<ModalTipo>(null);
  readonly editandoId = signal<number | null>(null);

  idEstudianteStr = '';

  readonly pestanas: { id: PestanaActiva; label: string }[] = [
    { id: 'academicos', label: 'Academico' },
    { id: 'familiares', label: 'Familiares' },
    { id: 'medicos', label: 'Medico' },
    { id: 'documentos', label: 'Documentos' },
  ];

  // ── Formularios ──
  readonly formHoja: FormGroup = this.fb.group({
    anioAcademico: ['', [Validators.required, Validators.maxLength(10)]],
    observaciones: ['', [Validators.maxLength(2000)]],
  });

  readonly formAcademico: FormGroup = this.fb.group({
    colegioProcedencia: [''],
    fechaIngreso: [''],
    viveCon: [''],
    promedioGeneral: [null, [Validators.min(1.0), Validators.max(7.0)]],
  });

  readonly formFamiliar: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    parentesco: ['', [Validators.required]],
    telefono: [''],
    ocupacion: [''],
    esContactoEmergencia: [false],
  });

  readonly formMedico: FormGroup = this.fb.group({
    tipoSangre: [''],
    alergias: [''],
    enfermedadesCronicas: [''],
    medicacion: [''],
    previsionSalud: [''],
  });

  readonly formDocumento: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    tipoMime: [''],
    url: ['', [Validators.pattern('^https?://.+')]],
  });

  ngOnInit(): void {
    this.cargarEstudiantes();
  }

  private cargarEstudiantes(): void {
    this.loadingEstudiantes.set(true);
    this.estudianteApi.listar().subscribe({
      next: (lista) => {
        this.estudiantes.set(lista);
        this.loadingEstudiantes.set(false);
      },
      error: () => {
        this.toast.error('No se pudo cargar la lista de estudiantes.');
        this.loadingEstudiantes.set(false);
      },
    });
  }

  onCambioEstudiante(idStr: string): void {
    if (!idStr) {
      this.estudianteSeleccionado.set(null);
      this.hoja.set(null);
      this.limpiarSecciones();
      return;
    }
    const id = parseInt(idStr, 10);
    this.estudianteSeleccionado.set(id);
    this.cargarHoja(id);
  }

  private cargarHoja(idEstudiante: number): void {
    this.loadingHoja.set(true);
    this.hoja.set(null);
    this.limpiarSecciones();
    this.vidaApi.hojaPorEstudiante(idEstudiante).subscribe({
      next: (hojas) => {
        const h = hojas.length > 0 ? hojas[0] : null;
        this.hoja.set(h);
        this.loadingHoja.set(false);
        if (h) this.cargarSeccion(this.pestanaActiva(), h.id);
      },
      error: () => {
        this.loadingHoja.set(false);
        this.toast.error('No se pudo cargar la hoja de vida.');
      },
    });
  }

  private cargarSeccion(tab: PestanaActiva, idHoja: number): void {
    this.loadingSeccion.set(true);
    const obs$ = tab === 'academicos' ? this.vidaApi.academicosPorHoja(idHoja)
      : tab === 'familiares' ? this.vidaApi.familiaresPorHoja(idHoja)
      : tab === 'medicos' ? this.vidaApi.medicosPorHoja(idHoja)
      : this.vidaApi.documentosPorHoja(idHoja);

    (obs$ as import('rxjs').Observable<unknown[]>).subscribe({
      next: (items: unknown[]) => {
        if (tab === 'academicos') this.academicos.set(items as AntecedenteAcademicoDTO[]);
        else if (tab === 'familiares') this.familiares.set(items as AntecedenteFamiliarDTO[]);
        else if (tab === 'medicos') this.medicos.set(items as AntecedenteMedicoDTO[]);
        else this.documentos.set(items as DocumentoAdjuntoDTO[]);
        this.loadingSeccion.set(false);
      },
      error: () => {
        this.loadingSeccion.set(false);
        this.toast.error('No se pudo cargar la seccion.');
      },
    });
  }

  private limpiarSecciones(): void {
    this.academicos.set([]);
    this.familiares.set([]);
    this.medicos.set([]);
    this.documentos.set([]);
  }

  // ── Modal Hoja ──
  abrirModalHoja(editar = false): void {
    if (editar && this.hoja()) {
      const h = this.hoja()!;
      this.formHoja.reset({ anioAcademico: h.anioAcademico, observaciones: h.observaciones ?? '' });
    } else {
      this.formHoja.reset({ anioAcademico: new Date().getFullYear().toString(), observaciones: '' });
    }
    this.modalAbierto.set('hoja');
  }

  guardarHoja(): void {
    this.formHoja.markAllAsTouched();
    if (this.formHoja.invalid || this.guardando()) return;
    const idEstudiante = this.estudianteSeleccionado();
    if (!idEstudiante) return;
    const v = this.formHoja.getRawValue() as { anioAcademico: string; observaciones: string };
    this.guardando.set(true);

    const existente = this.hoja();
    const op$ = existente
      ? this.vidaApi.actualizarHoja(existente.id, { anioAcademico: v.anioAcademico, observaciones: v.observaciones || undefined })
      : this.vidaApi.crearHoja({ idEstudiante, anioAcademico: v.anioAcademico, observaciones: v.observaciones || undefined });

    op$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.toast.success(existente ? 'Hoja de vida actualizada.' : 'Hoja de vida creada.');
        this.cargarHoja(idEstudiante);
      },
      error: () => {
        this.guardando.set(false);
        this.toast.error('No se pudo guardar la hoja de vida.');
      },
    });
  }

  // ── Modal generico (crear) ──
  abrirModal(tipo: ModalTipo): void {
    this.editandoId.set(null);
    if (tipo === 'academico') this.formAcademico.reset();
    else if (tipo === 'familiar') this.formFamiliar.reset({ esContactoEmergencia: false });
    else if (tipo === 'medico') this.formMedico.reset();
    else if (tipo === 'documento') this.formDocumento.reset();
    this.modalAbierto.set(tipo);
  }

  // ── Modal generico (editar) ──
  abrirModalEdicion(tipo: 'academico', item: AntecedenteAcademicoDTO): void;
  abrirModalEdicion(tipo: 'familiar', item: AntecedenteFamiliarDTO): void;
  abrirModalEdicion(tipo: 'medico', item: AntecedenteMedicoDTO): void;
  abrirModalEdicion(tipo: 'documento', item: DocumentoAdjuntoDTO): void;
  abrirModalEdicion(
    tipo: 'academico' | 'familiar' | 'medico' | 'documento',
    item: AntecedenteAcademicoDTO | AntecedenteFamiliarDTO | AntecedenteMedicoDTO | DocumentoAdjuntoDTO
  ): void {
    this.editandoId.set(item.id);
    if (tipo === 'academico') {
      const ac = item as AntecedenteAcademicoDTO;
      this.formAcademico.reset({
        colegioProcedencia: ac.colegioProcedencia ?? '',
        fechaIngreso: ac.fechaIngreso ?? '',
        viveCon: ac.viveCon ?? '',
        promedioGeneral: ac.promedioGeneral,
      });
    } else if (tipo === 'familiar') {
      const fam = item as AntecedenteFamiliarDTO;
      this.formFamiliar.reset({
        nombre: fam.nombre,
        parentesco: fam.parentesco,
        telefono: fam.telefono ?? '',
        ocupacion: fam.ocupacion ?? '',
        esContactoEmergencia: fam.esContactoEmergencia,
      });
    } else if (tipo === 'medico') {
      const med = item as AntecedenteMedicoDTO;
      this.formMedico.reset({
        tipoSangre: med.tipoSangre ?? '',
        alergias: med.alergias ?? '',
        enfermedadesCronicas: med.enfermedadesCronicas ?? '',
        medicacion: med.medicacion ?? '',
        previsionSalud: med.previsionSalud ?? '',
      });
    } else if (tipo === 'documento') {
      const doc = item as DocumentoAdjuntoDTO;
      this.formDocumento.reset({
        nombre: doc.nombre,
        tipoMime: doc.tipoMime ?? '',
        url: doc.url ?? '',
      });
    }
    this.modalAbierto.set(tipo);
  }

  cerrarModal(): void {
    this.modalAbierto.set(null);
    this.editandoId.set(null);
  }

  // ── Guardar academico ──
  guardarAcademico(): void {
    this.formAcademico.markAllAsTouched();
    if (this.formAcademico.invalid || this.guardando()) return;
    const idHoja = this.hoja()?.id;
    if (!idHoja) return;
    const v = this.formAcademico.getRawValue() as {
      colegioProcedencia: string; fechaIngreso: string; viveCon: string; promedioGeneral: number | null;
    };
    const id = this.editandoId();
    this.guardando.set(true);
    const body = {
      colegioProcedencia: v.colegioProcedencia || undefined,
      fechaIngreso: v.fechaIngreso || undefined,
      viveCon: v.viveCon || undefined,
      promedioGeneral: v.promedioGeneral ?? undefined,
    };
    const op$ = id
      ? this.vidaApi.actualizarAcademico(id, body)
      : this.vidaApi.crearAcademico({ idHojaVida: idHoja, ...body });
    op$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.toast.success(id ? 'Antecedente actualizado.' : 'Antecedente agregado.');
        this.cargarSeccion('academicos', idHoja);
      },
      error: () => { this.guardando.set(false); this.toast.error('Error al guardar.'); },
    });
  }

  // ── Guardar familiar ──
  guardarFamiliar(): void {
    this.formFamiliar.markAllAsTouched();
    if (this.formFamiliar.invalid || this.guardando()) return;
    const idHoja = this.hoja()?.id;
    if (!idHoja) return;
    const v = this.formFamiliar.getRawValue() as {
      nombre: string; parentesco: string; telefono: string; ocupacion: string; esContactoEmergencia: boolean;
    };
    const id = this.editandoId();
    this.guardando.set(true);
    const body = {
      nombre: v.nombre,
      parentesco: v.parentesco,
      telefono: v.telefono || undefined,
      ocupacion: v.ocupacion || undefined,
      esContactoEmergencia: v.esContactoEmergencia,
    };
    const op$ = id
      ? this.vidaApi.actualizarFamiliar(id, body)
      : this.vidaApi.crearFamiliar({ idHojaVida: idHoja, ...body });
    op$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.toast.success(id ? 'Familiar actualizado.' : 'Familiar agregado.');
        this.cargarSeccion('familiares', idHoja);
      },
      error: () => { this.guardando.set(false); this.toast.error('Error al guardar.'); },
    });
  }

  // ── Guardar medico ──
  guardarMedico(): void {
    if (this.guardando()) return;
    const idHoja = this.hoja()?.id;
    if (!idHoja) return;
    const v = this.formMedico.getRawValue() as {
      tipoSangre: string; alergias: string; enfermedadesCronicas: string; medicacion: string; previsionSalud: string;
    };
    const id = this.editandoId();
    this.guardando.set(true);
    const body = {
      tipoSangre: v.tipoSangre || undefined,
      alergias: v.alergias || undefined,
      enfermedadesCronicas: v.enfermedadesCronicas || undefined,
      medicacion: v.medicacion || undefined,
      previsionSalud: v.previsionSalud || undefined,
    };
    const op$ = id
      ? this.vidaApi.actualizarMedico(id, body)
      : this.vidaApi.crearMedico({ idHojaVida: idHoja, ...body });
    op$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.toast.success(id ? 'Antecedente medico actualizado.' : 'Antecedente medico agregado.');
        this.cargarSeccion('medicos', idHoja);
      },
      error: () => { this.guardando.set(false); this.toast.error('Error al guardar.'); },
    });
  }

  // ── Guardar documento ──
  guardarDocumento(): void {
    this.formDocumento.markAllAsTouched();
    if (this.formDocumento.invalid || this.guardando()) return;
    const idHoja = this.hoja()?.id;
    if (!idHoja) return;
    const user = this.auth.currentUser();
    const v = this.formDocumento.getRawValue() as { nombre: string; tipoMime: string; url: string };
    const id = this.editandoId();
    this.guardando.set(true);
    const body = {
      nombre: v.nombre,
      tipoMime: v.tipoMime || undefined,
      url: v.url || undefined,
      subidoPor: user?.id ?? undefined,
    };
    const op$ = id
      ? this.vidaApi.actualizarDocumento(id, body)
      : this.vidaApi.crearDocumento({ idHojaVida: idHoja, ...body });
    op$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.toast.success(id ? 'Documento actualizado.' : 'Documento agregado.');
        this.cargarSeccion('documentos', idHoja);
      },
      error: () => { this.guardando.set(false); this.toast.error('Error al guardar.'); },
    });
  }

  // ── Eliminar generico ──
  eliminar(tipo: 'academico' | 'familiar' | 'medico' | 'documento', id: number): void {
    const labels: Record<string, string> = {
      academico: 'antecedente academico',
      familiar: 'antecedente familiar',
      medico: 'antecedente medico',
      documento: 'documento',
    };
    if (!confirm(`Eliminar este ${labels[tipo]}? Esta accion no se puede deshacer.`)) return;
    const idHoja = this.hoja()?.id;
    if (!idHoja) return;

    const op$ = tipo === 'academico' ? this.vidaApi.eliminarAcademico(id)
      : tipo === 'familiar' ? this.vidaApi.eliminarFamiliar(id)
      : tipo === 'medico' ? this.vidaApi.eliminarMedico(id)
      : this.vidaApi.eliminarDocumento(id);

    op$.subscribe({
      next: () => {
        this.toast.success('Eliminado correctamente.');
        this.cargarSeccion(
          tipo === 'academico' ? 'academicos'
            : tipo === 'familiar' ? 'familiares'
            : tipo === 'medico' ? 'medicos'
            : 'documentos',
          idHoja
        );
      },
      error: () => this.toast.error('No se pudo eliminar.'),
    });
  }

  esInvalido(form: FormGroup, campo: string): boolean {
    const control = form.get(campo);
    return !!(control?.invalid && control.touched);
  }

  formatFecha(fecha: string | null): string {
    if (!fecha) return '--';
    return new Date(fecha).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
