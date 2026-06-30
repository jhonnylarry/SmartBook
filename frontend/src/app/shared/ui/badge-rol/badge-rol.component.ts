import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { Rol } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-badge-rol',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      [ngClass]="badgeClass()"
    >
      {{ label() }}
    </span>
  `,
})
export class BadgeRolComponent {
  rol = input.required<Rol | string>();

  label(): string {
    const labels: Record<string, string> = {
      ADMINISTRADOR: 'Administrador',
      DIRECTOR: 'Director',
      DOCENTE: 'Docente',
      INSPECTOR: 'Inspector',
      ADMINISTRATIVO: 'Administrativo',
      APODERADO: 'Apoderado',
      ESTUDIANTE: 'Estudiante',
    };
    return labels[this.rol()] ?? String(this.rol());
  }

  badgeClass(): string {
    const classes: Record<string, string> = {
      ADMINISTRADOR: 'bg-red-100 text-red-800',
      DIRECTOR: 'bg-blue-100 text-blue-800',
      DOCENTE: 'bg-green-100 text-green-800',
      INSPECTOR: 'bg-orange-100 text-orange-800',
      ADMINISTRATIVO: 'bg-purple-100 text-purple-800',
      APODERADO: 'bg-yellow-100 text-yellow-800',
      ESTUDIANTE: 'bg-gray-100 text-gray-800',
    };
    return classes[this.rol()] ?? 'bg-gray-100 text-gray-800';
  }
}
