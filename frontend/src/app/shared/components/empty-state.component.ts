import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  styles: [`
    :host {
      display: block;
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .empty__illustration {
      margin-bottom: 1.5rem;
      color: var(--ink-300);
    }

    .empty__title {
      font-family: 'Fraunces', serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--ink-700);
      margin-bottom: 0.5rem;
    }

    .empty__desc {
      font-size: 0.875rem;
      color: var(--ink-500);
      max-width: 320px;
      line-height: 1.5;
    }
  `],
  template: `
    <div class="empty" role="status">
      <!-- Ilustración SVG minimalista: cuaderno vacío -->
      <div class="empty__illustration" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Cuaderno -->
          <rect x="12" y="6" width="40" height="52" rx="3" stroke="currentColor" stroke-width="2"/>
          <!-- Espiral/lomo -->
          <line x1="12" y1="16" x2="52" y2="16" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/>
          <!-- Líneas de texto vacías -->
          <line x1="20" y1="26" x2="44" y2="26" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="20" y1="34" x2="40" y2="34" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="20" y1="42" x2="36" y2="42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Signo de interrogación pequeño -->
          <text x="45" y="50" font-size="10" fill="currentColor" font-family="serif" opacity="0.6">?</text>
        </svg>
      </div>
      <h3 class="empty__title">{{ titulo() }}</h3>
      <p class="empty__desc">{{ descripcion() }}</p>
    </div>
  `
})
export class EmptyStateComponent {
  titulo = input<string>('Sin registros');
  descripcion = input<string>('No hay datos disponibles.');
}
