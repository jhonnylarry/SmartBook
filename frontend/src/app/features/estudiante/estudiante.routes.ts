import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const ESTUDIANTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/estudiante-shell.component').then((m) => m.EstudianteShellComponent),
    canActivate: [roleGuard('ESTUDIANTE')],
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./inicio/inicio.component').then((m) => m.EstudianteInicioComponent),
      },
      {
        path: 'materias',
        loadComponent: () =>
          import('./mis-materias/mis-materias.component').then((m) => m.MisMateriasComponent),
      },
      {
        path: 'notas',
        loadComponent: () =>
          import('./mis-notas/mis-notas.component').then((m) => m.EstudianteMisNotasComponent),
      },
      {
        path: 'horario',
        loadComponent: () =>
          import('./horario/horario.component').then((m) => m.EstudianteHorarioComponent),
      },
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./notificaciones/notificaciones.component').then((m) => m.EstudianteNotificacionesComponent),
      },
      {
        path: 'mensajes',
        loadComponent: () =>
          import('../mensajes/mensajes.component').then((m) => m.MensajesComponent),
      },
      {
        // Calendario de solo lectura de una materia específica.
        path: 'materia/:id/calendario',
        loadComponent: () =>
          import('./materia-calendario/materia-calendario.component').then((m) => m.MateriaCalendarioComponent),
      },
    ],
  },
];
