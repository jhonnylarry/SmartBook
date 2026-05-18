import { Component, inject, signal, OnInit, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstudiantesService } from './estudiantes.service';
import { Estudiante } from '../../shared/models/estudiante.model';
import { LoadingComponent } from '../../shared/components/loading.component';

@Component({
  selector: 'app-estudiante-detail',
  standalone: true,
  imports: [RouterLink, LoadingComponent],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-4">
        <a routerLink="/estudiantes" class="text-sm text-indigo-600 hover:text-indigo-800">
          &larr; Volver a la lista
        </a>
      </div>

      @if (cargando()) {
        <app-loading mensaje="Cargando estudiante..." />
      } @else if (error()) {
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-700">{{ error() }}</p>
        </div>
      } @else if (estudiante(); as est) {
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="bg-indigo-600 px-6 py-8 text-white">
            <div class="flex items-center">
              <div class="h-16 w-16 rounded-full bg-indigo-400 flex items-center justify-center text-2xl font-bold">
                {{ est.nombre.charAt(0) }}{{ est.apellido.charAt(0) }}
              </div>
              <div class="ml-4">
                <h1 class="text-2xl font-bold">{{ est.nombre }} {{ est.apellido }}</h1>
                @if (est.rut) {
                  <p class="text-indigo-200 text-sm">RUT: {{ est.rut }}</p>
                }
              </div>
            </div>
          </div>

          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500 uppercase font-semibold">ID</p>
              <p class="text-gray-900">{{ est.id }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase font-semibold">Email</p>
              <p class="text-gray-900">{{ est.email ?? 'No registrado' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase font-semibold">Fecha de nacimiento</p>
              <p class="text-gray-900">{{ est.fechaNacimiento ?? 'No registrado' }}</p>
            </div>
          </div>

          <div class="px-6 pb-6 flex space-x-3">
            <a [routerLink]="['/estudiantes', est.id, 'editar']"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
              Editar
            </a>
          </div>
        </div>
      }
    </div>
  `
})
export class EstudianteDetailComponent implements OnInit {
  readonly id = input.required<string>();

  private readonly service = inject(EstudiantesService);

  protected cargando = signal(false);
  protected error = signal<string | null>(null);
  protected estudiante = signal<Estudiante | null>(null);

  ngOnInit(): void {
    this.cargando.set(true);
    this.service.obtener(Number(this.id())).subscribe({
      next: est => {
        this.estudiante.set(est);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se encontro el estudiante.');
        this.cargando.set(false);
      }
    });
  }
}
