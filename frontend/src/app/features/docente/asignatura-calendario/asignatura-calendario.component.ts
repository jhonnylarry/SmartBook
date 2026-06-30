import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CalendarioComponent } from '../../director/calendario/calendario.component';

/**
 * Wrapper fino que lee el :id de la ruta y renderiza el CalendarioComponent
 * en modo asignatura (solo eventos de esa asignatura; el docente puede gestionar
 * ya que canManageCalendario() devuelve true para DOCENTE).
 */
@Component({
  selector: 'app-asignatura-calendario',
  standalone: true,
  imports: [CalendarioComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    @if (idAsignatura() !== null) {
      <app-calendario [idAsignatura]="idAsignatura()!" />
    }
  `,
})
export class AsignaturaCalendarioComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly idAsignatura = signal<number | null>(null);

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    const id = param ? parseInt(param, 10) : NaN;
    if (!isNaN(id) && id > 0) {
      this.idAsignatura.set(id);
    }
  }
}
