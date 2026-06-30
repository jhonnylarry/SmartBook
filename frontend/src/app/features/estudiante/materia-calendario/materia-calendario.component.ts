import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CalendarioComponent } from '../../director/calendario/calendario.component';

/**
 * Wrapper fino de solo lectura del CalendarioComponent para el workspace del Estudiante.
 * Lee el :id de la ruta y pasa [idAsignatura] y [soloLectura]=true al calendario compartido.
 */
@Component({
  selector: 'app-materia-calendario',
  standalone: true,
  imports: [CalendarioComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    @if (idAsignatura() !== null) {
      <app-calendario [idAsignatura]="idAsignatura()!" [soloLectura]="true" />
    }
  `,
})
export class MateriaCalendarioComponent implements OnInit {
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
