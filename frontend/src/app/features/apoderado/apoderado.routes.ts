import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const APODERADO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/apoderado-shell.component').then((m) => m.ApoderadoShellComponent),
    canActivate: [roleGuard('APODERADO')],
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        loadComponent: () => import('./inicio/inicio.component').then((m) => m.ApoderadoInicioComponent),
      },
      {
        path: 'pupilos',
        loadComponent: () => import('./mis-pupilos/mis-pupilos.component').then((m) => m.MisPupilosComponent),
      },
      {
        path: 'notificaciones',
        loadComponent: () => import('./notificaciones/notificaciones.component').then((m) => m.ApoderadoNotificacionesComponent),
      },
      {
        path: 'mensajes',
        loadComponent: () =>
          import('../mensajes/mensajes.component').then((m) => m.MensajesComponent),
      },
      {
        path: 'pupilo/:idEstudiante',
        loadComponent: () => import('./pupilo-detalle/pupilo-detalle.component').then((m) => m.PupiloDetalleComponent),
      },
    ],
  },
];
