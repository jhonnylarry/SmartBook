import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const DIRECTOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell/director-shell.component').then((m) => m.DirectorShellComponent),
    canActivate: [roleGuard('ADMINISTRADOR', 'DIRECTOR')],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'matricula',
        loadComponent: () => import('./matricula/matricula.component').then((m) => m.MatriculaComponent),
      },
      {
        path: 'estudiantes',
        loadComponent: () => import('./estudiantes/estudiantes.component').then((m) => m.EstudiantesComponent),
      },
      {
        path: 'academico',
        loadComponent: () => import('./academico/academico.component').then((m) => m.AcademicoComponent),
      },
      {
        path: 'academico/curso/:id',
        loadComponent: () => import('./academico/curso-detalle.component').then((m) => m.CursoDetalleComponent),
      },
      {
        path: 'academico/asignatura/:id',
        loadComponent: () => import('./academico/asignatura-detalle.component').then((m) => m.AsignaturaDetalleComponent),
      },
      {
        path: 'academico/estudiante/:id',
        loadComponent: () => import('./academico/ficha-academica.component').then((m) => m.FichaAcademicaComponent),
      },
      {
        path: 'anotaciones',
        loadComponent: () => import('./anotaciones/anotaciones.component').then((m) => m.AnotacionesComponent),
      },
      {
        path: 'calendario',
        loadComponent: () => import('./calendario/calendario.component').then((m) => m.CalendarioComponent),
      },
      {
        path: 'hoja-vida',
        loadComponent: () => import('./hoja-vida/hoja-vida.component').then((m) => m.HojaVidaComponent),
      },
      {
        path: 'materias',
        loadComponent: () => import('./materias/materias.component').then((m) => m.MateriasComponent),
      },
      {
        path: 'periodos',
        loadComponent: () => import('./periodos/periodos.component').then((m) => m.PeriodosComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./usuarios/usuarios.component').then((m) => m.UsuariosComponent),
      },
      {
        path: 'mensajes',
        loadComponent: () =>
          import('../mensajes/mensajes.component').then((m) => m.MensajesComponent),
      },
    ],
  },
];
