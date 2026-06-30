import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'director',
    canActivate: [authGuard],
    loadChildren: () => import('./features/director/director.routes').then((m) => m.DIRECTOR_ROUTES),
  },
  {
    path: 'docente',
    canActivate: [authGuard],
    loadChildren: () => import('./features/docente/docente.routes').then((m) => m.DOCENTE_ROUTES),
  },
  {
    path: 'estudiante',
    canActivate: [authGuard],
    loadChildren: () => import('./features/estudiante/estudiante.routes').then((m) => m.ESTUDIANTE_ROUTES),
  },
  {
    path: 'administrativo',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/administrativo/administrativo.routes').then((m) => m.ADMINISTRATIVO_ROUTES),
  },
  {
    path: 'apoderado',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/apoderado/apoderado.routes').then((m) => m.APODERADO_ROUTES),
  },
  {
    path: '',
    redirectTo: '/director',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
