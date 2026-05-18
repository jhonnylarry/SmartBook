import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstudiantesService } from './estudiantes.service';
import { Estudiante } from '../../shared/models/estudiante.model';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-estudiante-list',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent],
  templateUrl: './estudiante-list.component.html',
  styleUrl: './estudiante-list.component.scss'
})
export class EstudianteListComponent implements OnInit {
  private readonly service = inject(EstudiantesService);
  private readonly toast = inject(ToastService);

  protected cargando = signal(false);
  protected error = signal<string | null>(null);
  protected estudiantes = signal<Estudiante[]>([]);
  protected busqueda = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.service.listar().subscribe({
      next: data => {
        this.estudiantes.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de estudiantes.');
        this.cargando.set(false);
      }
    });
  }

  eliminar(id: number, nombre: string): void {
    if (!confirm(`Eliminar a ${nombre}? Esta accion no se puede deshacer.`)) return;
    this.service.eliminar(id).subscribe({
      next: () => {
        this.estudiantes.update(list => list.filter(e => e.id !== id));
        this.toast.success(`Estudiante ${nombre} eliminado.`);
      },
      error: () => {
        this.toast.error('No se pudo eliminar el estudiante.');
        this.error.set('No se pudo eliminar el estudiante.');
      }
    });
  }

  onBusqueda(event: Event): void {
    this.busqueda.set((event.target as HTMLInputElement).value);
  }

  get estudiantesFiltrados(): Estudiante[] {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.estudiantes();
    return this.estudiantes().filter(e =>
      e.nombre.toLowerCase().includes(q) ||
      e.apellido.toLowerCase().includes(q) ||
      (e.rut ?? '').toLowerCase().includes(q)
    );
  }
}
