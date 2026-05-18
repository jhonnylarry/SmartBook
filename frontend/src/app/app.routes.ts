import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'estudiantes',
        loadChildren: () =>
          import('./features/estudiantes/estudiantes.routes').then(m => m.routes)
      },
      {
        path: 'anotaciones',
        loadComponent: () =>
          import('./features/anotaciones/anotacion-list.component').then(m => m.AnotacionListComponent)
      },
      {
        path: 'notas',
        loadComponent: () =>
          import('./features/notas/nota-list.component').then(m => m.NotaListComponent)
      },
      {
        path: 'mensajes',
        loadComponent: () =>
          import('./features/mensajes/mensaje-list.component').then(m => m.MensajeListComponent)
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import('./features/calendario/evento-list.component').then(m => m.EventoListComponent)
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/reportes/reporte-view.component').then(m => m.ReporteViewComponent)
      },
      {
        path: 'hojas-vida',
        loadComponent: () =>
          import('./features/hojas-vida/hojas-vida-list.component').then(m => m.HojasVidaListComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
