import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./estudiante-list.component').then(m => m.EstudianteListComponent)
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./estudiante-form.component').then(m => m.EstudianteFormComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./estudiante-detail.component').then(m => m.EstudianteDetailComponent)
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./estudiante-form.component').then(m => m.EstudianteFormComponent)
  }
];
