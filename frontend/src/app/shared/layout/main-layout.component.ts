import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ToastContainerComponent } from '../components/toast-container.component';

interface NavItem {
  label: string;
  path: string;
  svgPath: string; // SVG path data para el icono inline
  exact?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  protected readonly auth = inject(AuthService);
  protected sidebarOpen = signal(true);

  // Iniciales del usuario para el avatar
  protected readonly iniciales = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return '?';
    return user.username.substring(0, 2).toUpperCase();
  });

  protected readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/',
      exact: true,
      // Home icon (casa)
      svgPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10'
    },
    {
      label: 'Estudiantes',
      path: '/estudiantes',
      // Users round
      svgPath: 'M18 21a8 8 0 0 0-16 0 M10 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0 M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3'
    },
    {
      label: 'Anotaciones',
      path: '/anotaciones',
      // MessageSquareWarning / NotebookPen
      svgPath: 'M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4 M2 6h4 M2 10h4 M2 14h4 M2 18h4 M18.4 2l3.6 3.6-7.07 7.07-4.24 1.41 1.41-4.24L18.4 2z'
    },
    {
      label: 'Notas',
      path: '/notas',
      // Award / BarChart3
      svgPath: 'M18 20V10 M12 20V4 M6 20v-6'
    },
    {
      label: 'Mensajes',
      path: '/mensajes',
      // Mail
      svgPath: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6'
    },
    {
      label: 'Calendario',
      path: '/calendario',
      // CalendarRange
      svgPath: 'M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18 M8 14h2 M12 14h2 M16 14h2 M8 18h2 M12 18h2 M16 18h2'
    },
    {
      label: 'Reportes',
      path: '/reportes',
      // FileBarChart2
      svgPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8'
    },
    {
      label: 'Hojas de Vida',
      path: '/hojas-vida',
      // ClipboardList
      svgPath: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z M9 12h6 M9 16h4'
    }
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  logout(): void {
    this.auth.logout();
  }
}
