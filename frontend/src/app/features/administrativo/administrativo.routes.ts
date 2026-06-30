import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

// El espacio Administrativo reutiliza las pantallas del Director (matrícula, estudiantes,
// académico, materias, usuarios y hoja de vida). Los componentes detectan el prefijo
// "/administrativo" para mantener la navegación dentro de este espacio.
export const ADMINISTRATIVO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/administrativo-shell.component').then((m) => m.AdministrativoShellComponent),
    canActivate: [roleGuard('ADMINISTRADOR', 'ADMINISTRATIVO')],
    children: [
      {
        path: '',
        redirectTo: 'estudiantes',
        pathMatch: 'full',
      },
      {
        path: 'matricula',
        loadComponent: () =>
          import('../director/matricula/matricula.component').then((m) => m.MatriculaComponent),
      },
      {
        path: 'estudiantes',
        loadComponent: () =>
          import('../director/estudiantes/estudiantes.component').then((m) => m.EstudiantesComponent),
      },
      {
        path: 'academico',
        loadComponent: () =>
          import('../director/academico/academico.component').then((m) => m.AcademicoComponent),
      },
      {
        path: 'academico/curso/:id',
        loadComponent: () =>
          import('../director/academico/curso-detalle.component').then((m) => m.CursoDetalleComponent),
      },
      {
        path: 'academico/asignatura/:id',
        loadComponent: () =>
          import('../director/academico/asignatura-detalle.component').then((m) => m.AsignaturaDetalleComponent),
      },
      {
        path: 'academico/estudiante/:id',
        loadComponent: () =>
          import('../director/academico/ficha-academica.component').then((m) => m.FichaAcademicaComponent),
      },
      {
        path: 'materias',
        loadComponent: () =>
          import('../director/materias/materias.component').then((m) => m.MateriasComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('../director/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
      },
      {
        path: 'hoja-vida',
        loadComponent: () =>
          import('../director/hoja-vida/hoja-vida.component').then((m) => m.HojaVidaComponent),
      },
    ],
  },
];
