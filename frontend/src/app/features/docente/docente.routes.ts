import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const DOCENTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell/docente-shell.component').then((m) => m.DocenteShellComponent),
    canActivate: [roleGuard('DOCENTE')],
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        loadComponent: () => import('./inicio/inicio.component').then((m) => m.DocenteInicioComponent),
      },
      {
        path: 'asignaturas',
        loadComponent: () => import('./mis-asignaturas/mis-asignaturas.component').then((m) => m.MisAsignaturasComponent),
      },
      {
        path: 'horario',
        loadComponent: () => import('./horario/horario.component').then((m) => m.DocenteHorarioComponent),
      },
      {
        path: 'notificaciones',
        loadComponent: () => import('./notificaciones/notificaciones.component').then((m) => m.DocenteNotificacionesComponent),
      },
      {
        path: 'mensajes',
        loadComponent: () =>
          import('../mensajes/mensajes.component').then((m) => m.MensajesComponent),
      },
      {
        // Reutiliza el detalle del Director (notas + documentos); su botón "Volver"
        // detecta el prefijo /docente y regresa a "Mis Asignaturas".
        path: 'asignatura/:id',
        loadComponent: () => import('../director/academico/asignatura-detalle.component').then((m) => m.AsignaturaDetalleComponent),
      },
      {
        // Calendario escolar compartido (mismo componente que el Director).
        path: 'calendario',
        loadComponent: () => import('../director/calendario/calendario.component').then((m) => m.CalendarioComponent),
      },
      {
        // Calendario de una asignatura específica del docente.
        path: 'asignatura/:id/calendario',
        loadComponent: () =>
          import('./asignatura-calendario/asignatura-calendario.component').then((m) => m.AsignaturaCalendarioComponent),
      },
    ],
  },
];
