import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { HorarioApiService } from '../../../core/api/horario-api.service';
import { BloqueHorarioDto } from '../../../core/models/horario.model';
import { HorarioSemanalComponent } from '../../../shared/ui/horario-semanal/horario-semanal.component';

/** Pestaña "Mi Horario" del docente: su horario semanal de clases. */
@Component({
  selector: 'app-docente-horario',
  standalone: true,
  imports: [HorarioSemanalComponent],
  host: { class: 'flex flex-col flex-1 min-h-0' },
  template: `
    <div class="flex flex-col flex-1 min-h-0 gap-5 animate-fadeIn">
      <div>
        <h1 class="page-title">Mi Horario</h1>
        <p class="text-slate-500 text-sm mt-1">Tu horario semanal de clases.</p>
      </div>
      <div class="card p-5 flex-1 min-h-0 overflow-y-auto">
        <app-horario-semanal [bloques]="bloques()" [loading]="cargando()" />
      </div>
    </div>
  `,
})
export class DocenteHorarioComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly horarioApi = inject(HorarioApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly bloques = signal<BloqueHorarioDto[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    const idDocente = this.auth.currentUser()?.id;
    if (!idDocente) {
      this.cargando.set(false);
      return;
    }
    this.horarioApi.porDocente(idDocente).pipe(
      catchError(() => of([] as BloqueHorarioDto[])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((b) => {
      this.bloques.set(b);
      this.cargando.set(false);
    });
  }
}
