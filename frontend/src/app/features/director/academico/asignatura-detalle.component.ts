import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AcademicoApiService } from '../../../core/api/academico-api.service';
import { UsuarioApiService } from '../../../core/api/usuario-api.service';
import { EstudianteApiService } from '../../../core/api/estudiante-api.service';
import { MatriculaApiService } from '../../../core/api/matricula-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { DocumentosEvaluacionComponent } from './documentos-evaluacion.component';
import { AsignaturaDTO, EvaluacionDTO, NotaDTO } from '../../../core/models/academico.model';
import { PromedioEstudianteDto } from '../../../core/models/boletin.model';
import { PeriodoAcademicoDto, EstadoCierreDto } from '../../../core/models/periodo.model';
import { Usuario } from '../../../core/models/usuario.model';
import { EstudianteDTO, Matricula } from '../../../core/models/estudiante.model';

type Pestana = 'evaluaciones' | 'notas' | 'documentos' | 'promedios';

interface FilaNota {
  estudiante: EstudianteDTO;
  nota: NotaDTO | null;
  calificacion: number | null;
  guardando: boolean;
}

interface FilaPromedio {
  idEstudiante: number;
  nombre: string;
  promedio: number | null;
  cantidad: number;
}

@Component({
  selector: 'app-asignatura-detalle',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, ModalComponent, SkeletonComponent, SpinnerComponent, DocumentosEvaluacionComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">

      <!-- Navegacion y cabecera -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <button
            (click)="volver()"
            class="shrink-0 p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Volver al curso"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div class="min-w-0">
            @if (loadingAsignatura()) {
              <div class="h-6 w-48 bg-slate-200 rounded animate-pulse"></div>
            } @else {
              <h1 class="page-title truncate">{{ asignatura()?.nombre ?? 'Asignatura' }}</h1>
              <p class="text-slate-500 text-sm mt-0.5">Evaluaciones y registro de notas</p>
            }
          </div>
        </div>
      </div>

      <!-- Pestanas -->
      <div class="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit shrink-0">
        <button
          (click)="pestana.set('evaluaciones')"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          [class]="pestana() === 'evaluaciones'
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'"
        >
          Evaluaciones
        </button>
        @if (!auth.hasRole('ADMINISTRATIVO')) {
          <button
            (click)="onCambioPestana('notas')"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            [class]="pestana() === 'notas'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'"
          >
            Registro de Notas
          </button>
          <button
            (click)="onCambioPestana('documentos')"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            [class]="pestana() === 'documentos'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'"
          >
            Documentos / Pruebas
          </button>
          <button
            (click)="onCambioPestana('promedios')"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            [class]="pestana() === 'promedios'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'"
          >
            Promedios
          </button>
        }
      </div>

      <!-- ── Cierre académico por periodo (Director/Admin gestiona; todos ven el estado) ── -->
      @if (periodos().length > 0) {
        <div class="card p-3.5 flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
          <div class="flex items-center gap-2 text-sm text-slate-600 shrink-0">
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span class="font-medium">Cierre académico</span>
          </div>
          <select [ngModel]="idPeriodoCierreSel()" (ngModelChange)="onCambioPeriodoCierre($event)"
            class="input-field py-1.5 text-sm sm:max-w-xs">
            <option [ngValue]="null">-- Selecciona un periodo --</option>
            @for (p of periodos(); track p.id) {
              <option [ngValue]="p.id">{{ p.nombre }} ({{ p.anio }})</option>
            }
          </select>
          @if (idPeriodoCierreSel() !== null) {
            @if (periodoSelCerrado()) {
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                Cerrada
              </span>
            } @else {
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Abierta
              </span>
            }
            @if (puedeCerrar()) {
              <div class="flex items-center gap-2 sm:ml-auto">
                @if (periodoSelCerrado()) {
                  <button (click)="reabrir()" [disabled]="procesandoCierre()" class="btn-secondary text-sm py-1.5">
                    @if (procesandoCierre()) { <app-spinner size="sm" /> } Reabrir
                  </button>
                } @else {
                  <button (click)="cerrar()" [disabled]="procesandoCierre()"
                    class="text-sm py-1.5 px-3 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5">
                    @if (procesandoCierre()) { <app-spinner size="sm" /> } Cerrar asignatura
                  </button>
                }
              </div>
            }
          }
        </div>
      }

      <!-- ── PESTANA EVALUACIONES ── -->
      @if (pestana() === 'evaluaciones') {
        <div class="flex flex-col flex-1 min-h-0 gap-4">

          <div class="flex justify-end shrink-0">
            @if (auth.canManageEvaluaciones()) {
              <button (click)="abrirModalCrearEval()" class="btn-primary">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Nueva evaluacion
              </button>
            }
          </div>

          @if (loadingEvals()) {
            <div class="flex flex-col gap-3">
              @for (i of [1,2,3]; track i) {
                <app-skeleton variant="tableRow" />
              }
            </div>
          } @else if (errorEvals()) {
            <div class="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
              <p class="text-slate-600 font-medium">Error al cargar las evaluaciones</p>
              <button (click)="cargarEvaluaciones()" class="btn-secondary text-sm">Reintentar</button>
            </div>
          } @else if (evaluaciones().length === 0) {
            <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
              <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <svg class="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <div>
                <p class="text-slate-600 font-medium">Sin evaluaciones</p>
                <p class="text-slate-400 text-sm mt-1">Agrega la primera evaluacion a esta asignatura.</p>
              </div>
            </div>
          } @else {
            <div class="flex-1 min-h-0 overflow-auto pr-1">
              <div class="flex flex-col gap-3">
                @for (ev of evaluaciones(); track ev.id) {
                  <div class="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-slate-800">{{ ev.nombre }}</h3>
                      <div class="flex flex-wrap items-center gap-3 mt-1">
                        <span class="text-xs text-slate-500">
                          <span class="font-medium">Fecha:</span> {{ formatFecha(ev.fecha) }}
                        </span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {{ ev.ponderacion }}%
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      @if (auth.canManageEvaluaciones()) {
                        <button
                          (click)="abrirModalEditarEval(ev)"
                          class="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-700 font-medium transition-colors border border-slate-200"
                        >
                          Editar
                        </button>
                      }
                      @if (auth.canDeleteAcademico()) {
                        <button
                          (click)="eliminarEvaluacion(ev)"
                          class="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors border border-red-200"
                        >
                          Eliminar
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- ── PESTANA NOTAS ── -->
      @if (pestana() === 'notas') {
        <div class="flex flex-col flex-1 min-h-0 gap-4">

          <!-- Selector de evaluacion -->
          <div class="card p-4 shrink-0">
            <label class="label mb-2 block">Seleccionar evaluacion</label>
            @if (loadingEvals()) {
              <div class="flex items-center gap-2 text-sm text-slate-500">
                <app-spinner size="sm" />
                Cargando evaluaciones...
              </div>
            } @else if (evaluaciones().length === 0) {
              <p class="text-sm text-slate-500">No hay evaluaciones registradas. Crea una en la pestana "Evaluaciones" primero.</p>
            } @else {
              <select
                [(ngModel)]="idEvalSelStr"
                (ngModelChange)="onCambioEvaluacion($event)"
                class="input-field"
              >
                <option value="">-- Selecciona una evaluacion --</option>
                @for (ev of evaluaciones(); track ev.id) {
                  <option [value]="ev.id.toString()">{{ ev.nombre }} ({{ formatFecha(ev.fecha) }}) &mdash; {{ ev.ponderacion }}%</option>
                }
              </select>
            }
          </div>

          @if (evalSeleccionada() && evalCerrada()) {
            <div class="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-start gap-2.5 shrink-0">
              <svg class="w-5 h-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span>Esta evaluación pertenece a un periodo <strong>cerrado</strong>; las notas están en solo lectura.
                {{ puedeCerrar() ? 'Reabre el periodo arriba para editarlas.' : 'Contacta a Dirección para reabrir el periodo.' }}</span>
            </div>
          }

          @if (!evalSeleccionada()) {
            <div class="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
              <p class="text-slate-500">Selecciona una evaluacion para ver y registrar notas.</p>
            </div>
          } @else if (loadingNotas()) {
            <div class="flex flex-col gap-3">
              @for (i of [1,2,3,4]; track i) {
                <app-skeleton variant="tableRow" />
              }
            </div>
          } @else if (filasNota().length === 0) {
            <div class="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
              <p class="text-slate-600 font-medium">Sin estudiantes en este curso</p>
              <p class="text-slate-400 text-sm">Matricula estudiantes al curso para registrar notas.</p>
            </div>
          } @else {
            <!-- Tabla de notas -->
            <div class="flex-1 min-h-0 overflow-auto">
              <div class="min-w-full overflow-x-auto">
                <table class="w-full text-sm border-collapse">
                  <thead>
                    <tr class="border-b border-slate-200 bg-slate-50">
                      <th class="text-left py-3 px-4 font-semibold text-slate-600 rounded-tl-xl">Estudiante</th>
                      <th class="text-left py-3 px-4 font-semibold text-slate-600">RUT</th>
                      <th class="text-center py-3 px-4 font-semibold text-slate-600">Calificacion</th>
                      @if (auth.canManageNotas()) {
                        <th class="text-center py-3 px-4 font-semibold text-slate-600 rounded-tr-xl">Accion</th>
                      }
                    </tr>
                  </thead>
                  <tbody>
                    @for (fila of filasNota(); track fila.estudiante.id) {
                      <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td class="py-3 px-4 font-medium text-slate-800">
                          {{ fila.estudiante.nombre }} {{ fila.estudiante.apellido }}
                        </td>
                        <td class="py-3 px-4 text-slate-500 text-xs">{{ fila.estudiante.rut }}</td>
                        <td class="py-3 px-4">
                          <div class="flex items-center justify-center">
                            @if (auth.canManageNotas()) {
                              <input
                                type="number"
                                [(ngModel)]="fila.calificacion"
                                [ngModelOptions]="{standalone: true}"
                                [disabled]="evalCerrada()"
                                min="1"
                                max="7"
                                step="0.1"
                                class="input-field text-center w-24 text-sm py-1.5 disabled:bg-slate-100 disabled:text-slate-400"
                                [class.error]="fila.calificacion !== null && (fila.calificacion < 1 || fila.calificacion > 7)"
                                placeholder="--"
                              />
                            } @else {
                              <span class="font-semibold" [class]="notaBadgeClass(fila.nota?.calificacion ?? null)">
                                {{ fila.nota?.calificacion ?? '--' }}
                              </span>
                            }
                          </div>
                        </td>
                        @if (auth.canManageNotas()) {
                          <td class="py-3 px-4 text-center">
                            <button
                              (click)="guardarNota(fila)"
                              [disabled]="fila.guardando || fila.calificacion === null || evalCerrada()"
                              class="text-xs px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 mx-auto"
                            >
                              @if (fila.guardando) {
                                <app-spinner size="sm" />
                              }
                              Guardar
                            </button>
                          </td>
                        }
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

        </div>
      }

      <!-- ── PESTANA DOCUMENTOS / PRUEBAS ── -->
      @if (pestana() === 'documentos') {
        <div class="flex flex-col flex-1 min-h-0 gap-4">

          <!-- Selector de evaluacion -->
          <div class="card p-4 shrink-0">
            <label class="label mb-2 block">Seleccionar evaluacion</label>
            @if (loadingEvals()) {
              <div class="flex items-center gap-2 text-sm text-slate-500">
                <app-spinner size="sm" />
                Cargando evaluaciones...
              </div>
            } @else if (evaluaciones().length === 0) {
              <p class="text-sm text-slate-500">No hay evaluaciones registradas. Crea una en la pestana "Evaluaciones" primero.</p>
            } @else {
              <select
                [(ngModel)]="idEvalSelStr"
                (ngModelChange)="onCambioEvaluacion($event)"
                class="input-field"
              >
                <option value="">-- Selecciona una evaluacion --</option>
                @for (ev of evaluaciones(); track ev.id) {
                  <option [value]="ev.id.toString()">{{ ev.nombre }} ({{ formatFecha(ev.fecha) }}) &mdash; {{ ev.ponderacion }}%</option>
                }
              </select>
            }
          </div>

          @if (!evalSeleccionada()) {
            <div class="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
              <p class="text-slate-500">Selecciona una evaluacion para ver y subir documentos.</p>
            </div>
          } @else {
            <div class="flex-1 min-h-0 overflow-auto pr-1">
              <app-documentos-evaluacion [idEvaluacion]="evalSeleccionada()!.id" />
            </div>
          }

        </div>
      }

      <!-- ── PESTANA PROMEDIOS ── -->
      @if (pestana() === 'promedios') {
        <div class="flex flex-col flex-1 min-h-0 gap-3">
          <p class="text-sm text-slate-500 shrink-0">Promedio ponderado de cada estudiante. Se recalcula al guardar notas.</p>
          @if (loadingPromedios()) {
            <div class="space-y-2">
              @for (i of [1,2,3,4,5]; track i) { <app-skeleton variant="custom" height="2.75rem" radius="0.75rem" /> }
            </div>
          } @else if (promedios().length === 0) {
            <div class="card p-8 text-center text-slate-500 text-sm">No hay estudiantes en este curso.</div>
          } @else {
            <div class="card divide-y divide-slate-100 overflow-auto">
              @for (f of promedios(); track f.idEstudiante) {
                <div class="flex items-center justify-between gap-2 px-4 py-2.5">
                  <span class="text-sm text-slate-700 truncate">{{ f.nombre }}</span>
                  <div class="flex items-center gap-2.5 shrink-0">
                    <span class="text-[11px] text-slate-400">{{ f.cantidad }} nota(s)</span>
                    @if (f.promedio !== null) {
                      <span class="text-sm font-bold px-2.5 py-1 rounded-lg tabular-nums"
                        [class]="f.promedio >= 4 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">
                        {{ f.promedio.toFixed(1) }}
                      </span>
                    } @else {
                      <span class="text-sm text-slate-300">—</span>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

    </div>

    <!-- Modal Crear Evaluacion -->
    <app-modal
      [open]="modalCrearEval()"
      title="Nueva Evaluacion"
      size="md"
      (closed)="cerrarModalCrearEval()"
    >
      <form [formGroup]="formEval" (ngSubmit)="crearEvaluacion()" class="space-y-4">
        <div>
          <label class="label">Nombre de la evaluacion *</label>
          <input
            type="text"
            formControlName="nombre"
            class="input-field"
            [class.error]="esInvalidoEval('nombre')"
            placeholder="Ej: Prueba Unidad 1, Control..."
            maxlength="100"
          />
          @if (esInvalidoEval('nombre')) { <p class="error-text">El nombre es obligatorio.</p> }
        </div>
        <div>
          <label class="label">Fecha *</label>
          <input
            type="date"
            formControlName="fecha"
            class="input-field"
            [class.error]="esInvalidoEval('fecha')"
          />
          @if (esInvalidoEval('fecha')) { <p class="error-text">La fecha es obligatoria.</p> }
        </div>
        <div>
          <label class="label">Ponderacion % * <span class="text-xs text-slate-400 font-normal">(0.01 - 100.00)</span></label>
          <input
            type="number"
            formControlName="ponderacion"
            class="input-field"
            [class.error]="esInvalidoEval('ponderacion')"
            placeholder="25.00"
            min="0.01"
            max="100"
            step="0.01"
          />
          @if (esInvalidoEval('ponderacion')) { <p class="error-text">Ingrese un valor entre 0.01 y 100.00.</p> }
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" (click)="cerrarModalCrearEval()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="guardandoEval()">
            @if (guardandoEval()) { <app-spinner size="sm" /> }
            Crear evaluacion
          </button>
        </div>
      </form>
    </app-modal>

    <!-- Modal Editar Evaluacion -->
    <app-modal
      [open]="modalEditarEval()"
      [title]="'Editar: ' + (evalEditando()?.nombre ?? '')"
      size="md"
      (closed)="cerrarModalEditarEval()"
    >
      <form [formGroup]="formEval" (ngSubmit)="actualizarEvaluacion()" class="space-y-4">
        <div>
          <label class="label">Nombre de la evaluacion *</label>
          <input
            type="text"
            formControlName="nombre"
            class="input-field"
            [class.error]="esInvalidoEval('nombre')"
            maxlength="100"
          />
          @if (esInvalidoEval('nombre')) { <p class="error-text">El nombre es obligatorio.</p> }
        </div>
        <div>
          <label class="label">Fecha *</label>
          <input
            type="date"
            formControlName="fecha"
            class="input-field"
            [class.error]="esInvalidoEval('fecha')"
          />
          @if (esInvalidoEval('fecha')) { <p class="error-text">La fecha es obligatoria.</p> }
        </div>
        <div>
          <label class="label">Ponderacion % * <span class="text-xs text-slate-400 font-normal">(0.01 - 100.00)</span></label>
          <input
            type="number"
            formControlName="ponderacion"
            class="input-field"
            [class.error]="esInvalidoEval('ponderacion')"
            min="0.01"
            max="100"
            step="0.01"
          />
          @if (esInvalidoEval('ponderacion')) { <p class="error-text">Ingrese un valor entre 0.01 y 100.00.</p> }
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" (click)="cerrarModalEditarEval()" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="guardandoEval()">
            @if (guardandoEval()) { <app-spinner size="sm" /> }
            Guardar cambios
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class AsignaturaDetalleComponent implements OnInit {
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly usuarioApi = inject(UsuarioApiService);
  private readonly estudianteApi = inject(EstudianteApiService);
  private readonly matriculaApi = inject(MatriculaApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly asignatura = signal<AsignaturaDTO | null>(null);
  readonly evaluaciones = signal<EvaluacionDTO[]>([]);
  readonly filasNota = signal<FilaNota[]>([]);
  readonly promedios = signal<FilaPromedio[]>([]);

  readonly loadingAsignatura = signal(false);
  readonly loadingEvals = signal(false);
  readonly loadingNotas = signal(false);
  readonly loadingPromedios = signal(false);
  readonly guardandoEval = signal(false);
  readonly errorEvals = signal<string | null>(null);

  // Cierre por periodo
  readonly periodos = signal<PeriodoAcademicoDto[]>([]);
  readonly cierresSet = signal<Set<number>>(new Set());
  readonly idPeriodoCierreSel = signal<number | null>(null);
  readonly procesandoCierre = signal(false);
  readonly periodoSelCerrado = computed(() => {
    const id = this.idPeriodoCierreSel();
    return id != null && this.cierresSet().has(id);
  });
  /** La evaluación seleccionada en la pestaña Notas pertenece a un periodo cerrado → solo lectura. */
  readonly evalCerrada = computed(() => {
    const ev = this.evalSeleccionada();
    return !!ev && ev.idPeriodo != null && this.cierresSet().has(ev.idPeriodo);
  });

  readonly pestana = signal<Pestana>('evaluaciones');
  readonly evalSeleccionada = signal<EvaluacionDTO | null>(null);
  idEvalSelStr = '';

  readonly modalCrearEval = signal(false);
  readonly modalEditarEval = signal(false);
  readonly evalEditando = signal<EvaluacionDTO | null>(null);

  private idAsignatura = 0;

  // Cache de estudiantes y matriculas para la pestana notas
  private todosEstudiantes: EstudianteDTO[] = [];
  private todasMatriculas: Matricula[] = [];
  private datosAuxCargados = false;
  private promediosCargados = false;

  readonly formEval: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    fecha: ['', [Validators.required]],
    ponderacion: [null, [Validators.required, Validators.min(0.01), Validators.max(100)]],
  });

  // computed para facilitar acceso al idCurso de la asignatura actual
  readonly idCursoActual = computed(() => this.asignatura()?.idCurso ?? 0);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.idAsignatura = idParam ? parseInt(idParam, 10) : 0;
    if (this.idAsignatura > 0) {
      this.cargarAsignatura();
      this.cargarEvaluaciones();
      this.cargarPeriodos();
      this.cargarCierres();
    }
  }

  private cargarPeriodos(): void {
    this.academicoApi.periodos().subscribe({
      next: (lista) => this.periodos.set(lista),
      error: () => this.periodos.set([]),
    });
  }

  private cargarCierres(): void {
    this.academicoApi.cierresDeAsignatura(this.idAsignatura).subscribe({
      next: (cierres: EstadoCierreDto[]) => this.cierresSet.set(new Set(cierres.map((c) => c.idPeriodo))),
      error: () => this.cierresSet.set(new Set()),
    });
  }

  onCambioPeriodoCierre(val: number | null): void {
    this.idPeriodoCierreSel.set(val != null ? Number(val) : null);
  }

  puedeCerrar(): boolean {
    return this.auth.hasRole('ADMINISTRADOR', 'DIRECTOR');
  }

  cerrar(): void {
    const id = this.idPeriodoCierreSel();
    if (id == null || this.procesandoCierre()) return;
    const periodo = this.periodos().find((p) => p.id === id);
    if (!confirm(`¿Cerrar esta asignatura para "${periodo?.nombre ?? 'el periodo'}"? Se bloqueará la edición de sus notas.`)) return;
    this.procesandoCierre.set(true);
    this.academicoApi.cerrarAsignatura(this.idAsignatura, id).subscribe({
      next: () => {
        this.cierresSet.update((s) => new Set(s).add(id));
        this.procesandoCierre.set(false);
        this.toast.success('Asignatura cerrada para el periodo.');
      },
      error: () => { this.procesandoCierre.set(false); },
    });
  }

  reabrir(): void {
    const id = this.idPeriodoCierreSel();
    if (id == null || this.procesandoCierre()) return;
    this.procesandoCierre.set(true);
    this.academicoApi.reabrirAsignatura(this.idAsignatura, id).subscribe({
      next: () => {
        this.cierresSet.update((s) => { const n = new Set(s); n.delete(id); return n; });
        this.procesandoCierre.set(false);
        this.toast.success('Asignatura reabierta para el periodo.');
      },
      error: () => { this.procesandoCierre.set(false); },
    });
  }

  private cargarAsignatura(): void {
    this.loadingAsignatura.set(true);
    this.academicoApi.asignatura(this.idAsignatura).subscribe({
      next: (a: AsignaturaDTO) => {
        this.asignatura.set(a);
        this.loadingAsignatura.set(false);
      },
      error: () => {
        this.loadingAsignatura.set(false);
      },
    });
  }

  cargarEvaluaciones(): void {
    this.loadingEvals.set(true);
    this.errorEvals.set(null);
    this.academicoApi.evaluacionesPorAsignatura(this.idAsignatura).subscribe({
      next: (lista: EvaluacionDTO[]) => {
        this.evaluaciones.set(lista);
        this.loadingEvals.set(false);
      },
      error: () => {
        this.errorEvals.set('No se pudo cargar las evaluaciones.');
        this.loadingEvals.set(false);
      },
    });
  }

  onCambioPestana(p: Pestana): void {
    this.pestana.set(p);
    // Pre-cargar evaluaciones si aun no estan disponibles
    if ((p === 'notas' || p === 'documentos') && this.evaluaciones().length === 0 && !this.loadingEvals()) {
      this.cargarEvaluaciones();
    }
    if (p === 'promedios') {
      this.cargarPromedios();
    }
  }

  /** Promedios ponderados por estudiante del curso (se recalculan al guardar notas). */
  private cargarPromedios(): void {
    this.loadingPromedios.set(true);
    const aux$ = this.datosAuxCargados
      ? of({ estudiantes: this.todosEstudiantes, matriculas: this.todasMatriculas })
      : forkJoin({
          estudiantes: this.estudianteApi.listar().pipe(catchError(() => of([] as EstudianteDTO[]))),
          matriculas: this.matriculaApi.listar().pipe(catchError(() => of([] as Matricula[]))),
        });

    forkJoin({
      aux: aux$,
      promedios: this.academicoApi.promediosDeAsignatura(this.idAsignatura).pipe(catchError(() => of([] as PromedioEstudianteDto[]))),
    }).subscribe(({ aux, promedios }) => {
      if (!this.datosAuxCargados) {
        this.todosEstudiantes = aux.estudiantes;
        this.todasMatriculas = aux.matriculas;
        this.datosAuxCargados = true;
      }
      const idCurso = this.idCursoActual();
      const matriculasCurso = this.todasMatriculas.filter((m) => m.idCurso === idCurso);
      // Solo los estudiantes matriculados en el curso (no todos los del sistema si no hay matrículas).
      const idsCurso = new Set(matriculasCurso.map((m) => m.idEstudiante));
      const porEstudiante = new Map(promedios.map((p) => [p.idEstudiante, p]));
      const filas: FilaPromedio[] = this.todosEstudiantes
        .filter((e) => idsCurso.has(e.id))
        .map((e) => {
          const p = porEstudiante.get(e.id);
          return { idEstudiante: e.id, nombre: `${e.nombre} ${e.apellido}`, promedio: p?.promedio ?? null, cantidad: p?.cantidadNotas ?? 0 };
        })
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      this.promedios.set(filas);
      this.promediosCargados = true;
      this.loadingPromedios.set(false);
    });
  }

  onCambioEvaluacion(idStr: string): void {
    if (!idStr) {
      this.evalSeleccionada.set(null);
      this.filasNota.set([]);
      return;
    }
    const idEval = parseInt(idStr, 10);
    const ev = this.evaluaciones().find((e) => e.id === idEval) ?? null;
    this.evalSeleccionada.set(ev);
    if (ev) {
      this.cargarNotasParaEvaluacion(ev);
    }
  }

  private cargarNotasParaEvaluacion(ev: EvaluacionDTO): void {
    this.loadingNotas.set(true);
    this.filasNota.set([]);

    // Carga paralela: datos auxiliares (solo la primera vez) + notas de la evaluacion
    const datosPendientes$ = this.datosAuxCargados
      ? of({ estudiantes: this.todosEstudiantes, matriculas: this.todasMatriculas })
      : forkJoin({
          estudiantes: this.estudianteApi.listar().pipe(catchError(() => of([] as EstudianteDTO[]))),
          matriculas: this.matriculaApi.listar().pipe(catchError(() => of([] as Matricula[]))),
        });

    forkJoin({
      aux: datosPendientes$,
      notas: this.academicoApi.notasPorEvaluacion(ev.id).pipe(catchError(() => of([] as NotaDTO[]))),
    }).subscribe({
      next: ({ aux, notas }) => {
        if (!this.datosAuxCargados) {
          this.todosEstudiantes = aux.estudiantes;
          this.todasMatriculas = aux.matriculas;
          this.datosAuxCargados = true;
        }

        const idCurso = this.idCursoActual();
        const matriculasCurso = this.todasMatriculas.filter((m) => m.idCurso === idCurso);

        // Determinar estudiantes del curso
        let estudiantesCurso: EstudianteDTO[];
        if (matriculasCurso.length > 0) {
          const idsEstudiante = new Set(matriculasCurso.map((m) => m.idEstudiante));
          estudiantesCurso = this.todosEstudiantes.filter((e) => idsEstudiante.has(e.id));
        } else {
          // Fallback: todos los estudiantes si no hay matriculas para el curso
          estudiantesCurso = this.todosEstudiantes;
        }

        // Mapear notas existentes por idEstudiante
        const notasPorEstudiante = new Map<number, NotaDTO>();
        for (const n of notas) {
          notasPorEstudiante.set(n.idEstudiante, n);
        }

        const filas: FilaNota[] = estudiantesCurso.map((est) => {
          const nota = notasPorEstudiante.get(est.id) ?? null;
          return {
            estudiante: est,
            nota,
            calificacion: nota ? nota.calificacion : null,
            guardando: false,
          };
        });

        this.filasNota.set(filas);
        this.loadingNotas.set(false);
      },
      error: () => {
        this.toast.error('No se pudo cargar las notas.');
        this.loadingNotas.set(false);
      },
    });
  }

  guardarNota(fila: FilaNota): void {
    const ev = this.evalSeleccionada();
    if (!ev) return;

    const cal = fila.calificacion;
    if (cal === null || cal < 1 || cal > 7) {
      this.toast.error('La calificacion debe estar entre 1.0 y 7.0.');
      return;
    }

    // Mutar el array de filas para activar el spinner de esa fila
    this.filasNota.update((filas) =>
      filas.map((f) => f.estudiante.id === fila.estudiante.id ? { ...f, guardando: true } : f)
    );

    const payload = {
      idEvaluacion: ev.id,
      idEstudiante: fila.estudiante.id,
      calificacion: Math.round(cal * 10) / 10,
    };

    const op$ = fila.nota
      ? this.academicoApi.actualizarNota(fila.nota.id, payload)
      : this.academicoApi.crearNota(payload);

    op$.subscribe({
      next: (notaGuardada: NotaDTO) => {
        this.filasNota.update((filas) =>
          filas.map((f) =>
            f.estudiante.id === fila.estudiante.id
              ? { ...f, nota: notaGuardada, calificacion: notaGuardada.calificacion, guardando: false }
              : f
          )
        );
        this.toast.success(`Nota de ${fila.estudiante.nombre} guardada.`);
        if (this.promediosCargados) this.cargarPromedios();
      },
      error: () => {
        this.filasNota.update((filas) =>
          filas.map((f) => f.estudiante.id === fila.estudiante.id ? { ...f, guardando: false } : f)
        );
      },
    });
  }

  // ── Evaluaciones CRUD ──

  abrirModalCrearEval(): void {
    this.formEval.reset({ nombre: '', fecha: '', ponderacion: null });
    this.modalCrearEval.set(true);
  }

  cerrarModalCrearEval(): void {
    this.modalCrearEval.set(false);
  }

  crearEvaluacion(): void {
    this.formEval.markAllAsTouched();
    if (this.formEval.invalid || this.guardandoEval()) return;

    const v = this.formEval.getRawValue() as { nombre: string; fecha: string; ponderacion: number };

    this.guardandoEval.set(true);
    this.academicoApi.crearEvaluacion({
      nombre: v.nombre.trim(),
      fecha: v.fecha,
      idAsignatura: this.idAsignatura,
      ponderacion: Number(v.ponderacion),
    }).subscribe({
      next: () => {
        this.guardandoEval.set(false);
        this.cerrarModalCrearEval();
        this.toast.success('Evaluacion creada exitosamente.');
        this.cargarEvaluaciones();
      },
      error: () => {
        this.guardandoEval.set(false);
      },
    });
  }

  abrirModalEditarEval(ev: EvaluacionDTO): void {
    this.evalEditando.set(ev);
    this.formEval.reset({
      nombre: ev.nombre,
      fecha: ev.fecha,
      ponderacion: ev.ponderacion,
    });
    this.modalEditarEval.set(true);
  }

  cerrarModalEditarEval(): void {
    this.modalEditarEval.set(false);
    this.evalEditando.set(null);
  }

  actualizarEvaluacion(): void {
    this.formEval.markAllAsTouched();
    if (this.formEval.invalid || this.guardandoEval()) return;
    const ev = this.evalEditando();
    if (!ev) return;

    const v = this.formEval.getRawValue() as { nombre: string; fecha: string; ponderacion: number };

    this.guardandoEval.set(true);
    this.academicoApi.actualizarEvaluacion(ev.id, {
      nombre: v.nombre.trim(),
      fecha: v.fecha,
      idAsignatura: this.idAsignatura,
      ponderacion: Number(v.ponderacion),
    }).subscribe({
      next: () => {
        this.guardandoEval.set(false);
        this.cerrarModalEditarEval();
        this.toast.success('Evaluacion actualizada.');
        this.cargarEvaluaciones();
        // Resetear seleccion de notas si la eval editada era la seleccionada
        if (this.evalSeleccionada()?.id === ev.id) {
          this.evalSeleccionada.set(null);
          this.idEvalSelStr = '';
          this.filasNota.set([]);
        }
      },
      error: () => {
        this.guardandoEval.set(false);
      },
    });
  }

  eliminarEvaluacion(ev: EvaluacionDTO): void {
    if (!confirm(`Eliminar la evaluacion "${ev.nombre}"? Se perderan todas las notas asociadas.`)) return;
    this.academicoApi.eliminarEvaluacion(ev.id).subscribe({
      next: () => {
        this.toast.success('Evaluacion eliminada.');
        this.cargarEvaluaciones();
        if (this.evalSeleccionada()?.id === ev.id) {
          this.evalSeleccionada.set(null);
          this.idEvalSelStr = '';
          this.filasNota.set([]);
        }
      },
      error: () => {
        this.toast.error('No se pudo eliminar la evaluacion.');
      },
    });
  }

  // ── Helpers ──

  volver(): void {
    // Reutilizado por los workspaces de Director, Administrativo y Docente: navega segun el prefijo de URL.
    if (this.router.url.startsWith('/docente')) {
      this.router.navigate(['/docente/asignaturas']);
      return;
    }
    const base = this.router.url.startsWith('/administrativo') ? '/administrativo' : '/director';
    const idCurso = this.idCursoActual();
    if (idCurso > 0) {
      this.router.navigate([`${base}/academico/curso`, idCurso]);
    } else {
      this.router.navigate([`${base}/academico`]);
    }
  }

  esInvalidoEval(campo: string): boolean {
    const control = this.formEval.get(campo);
    return !!(control?.invalid && control.touched);
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '--';
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
  }

  notaBadgeClass(calificacion: number | null): string {
    if (calificacion === null) return 'text-slate-400';
    if (calificacion >= 4) return 'text-green-700 font-semibold';
    return 'text-red-600 font-semibold';
  }
}
