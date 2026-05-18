import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CountUpDirective } from '../../shared/directives/count-up.directive';
import { environment } from '../../../environments/environment';
import { Estudiante } from '../../shared/models/estudiante.model';
import { Anotacion } from '../../shared/models/anotacion.model';

interface KpiCard {
  titulo: string;
  valor: string | number;
  descripcion: string;
  colorIcon: string;
  path: string;
  svgPath: string;
}

interface FeatureLink {
  label: string;
  desc: string;
  path: string;
  svgPath: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CountUpDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  protected cargando = signal(true);
  protected kpis = signal<KpiCard[]>([]);

  private readonly api = environment.apiUrl;

  protected readonly features: FeatureLink[] = [
    {
      label: 'Estudiantes',
      desc: 'Gestion de alumnos matriculados',
      path: '/estudiantes',
      svgPath: 'M18 21a8 8 0 0 0-16 0 M10 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0'
    },
    {
      label: 'Anotaciones',
      desc: 'Registro conductual del curso',
      path: '/anotaciones',
      svgPath: 'M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4 M18.4 2l3.6 3.6-7.07 7.07-4.24 1.41 1.41-4.24L18.4 2z'
    },
    {
      label: 'Notas',
      desc: 'Calificaciones por evaluacion',
      path: '/notas',
      svgPath: 'M18 20V10 M12 20V4 M6 20v-6'
    },
    {
      label: 'Mensajes',
      desc: 'Comunicacion interna del colegio',
      path: '/mensajes',
      svgPath: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6'
    },
    {
      label: 'Calendario',
      desc: 'Eventos y actividades escolares',
      path: '/calendario',
      svgPath: 'M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18'
    },
    {
      label: 'Reportes',
      desc: 'Generacion de informes y estadisticas',
      path: '/reportes',
      svgPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8'
    },
    {
      label: 'Hojas de Vida',
      desc: 'Antecedentes y perfil del alumno',
      path: '/hojas-vida',
      svgPath: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z'
    }
  ];

  ngOnInit(): void {
    this.cargarKpis();
  }

  private cargarKpis(): void {
    this.cargando.set(true);
    let estudiantesCount = 0;
    let anotacionesCount = 0;
    let completadas = 0;
    const total = 2;

    const finalizarSiCompleto = () => {
      completadas++;
      if (completadas >= total) {
        this.cargando.set(false);
        this.kpis.set([
          {
            titulo: 'Estudiantes',
            valor: estudiantesCount,
            descripcion: 'Total matriculados',
            colorIcon: 'petrol',
            path: '/estudiantes',
            svgPath: 'M18 21a8 8 0 0 0-16 0 M10 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0'
          },
          {
            titulo: 'Anotaciones',
            valor: anotacionesCount,
            descripcion: 'Total registradas',
            colorIcon: 'coral',
            path: '/anotaciones',
            svgPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'
          },
          {
            titulo: 'Mensajes',
            valor: '--',
            descripcion: 'Bandeja de entrada',
            colorIcon: 'mustard',
            path: '/mensajes',
            svgPath: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6'
          },
          {
            titulo: 'Reportes',
            valor: '--',
            descripcion: 'Generados este mes',
            colorIcon: 'sage',
            path: '/reportes',
            svgPath: 'M18 20V10 M12 20V4 M6 20v-6'
          }
        ]);
      }
    };

    this.http.get<Estudiante[]>(`${this.api}/estudiantes`).subscribe({
      next: list => { estudiantesCount = list.length; finalizarSiCompleto(); },
      error: () => { finalizarSiCompleto(); }
    });

    this.http.get<Anotacion[]>(`${this.api}/anotaciones`).subscribe({
      next: list => { anotacionesCount = list.length; finalizarSiCompleto(); },
      error: () => { finalizarSiCompleto(); }
    });
  }

  protected esNumerico(v: string | number): v is number {
    return typeof v === 'number' && !isNaN(v);
  }
}
