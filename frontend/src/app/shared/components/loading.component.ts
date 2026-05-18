import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  styles: [`
    :host { display: block; }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 3rem 2rem;
    }

    .skeleton-lines {
      width: 100%;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .skeleton {
      display: block;
      background: linear-gradient(
        90deg,
        #ede4d3 0%,
        rgba(255,255,255,0.5) 50%,
        #ede4d3 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite linear;
      border-radius: 4px;
      height: 0.875rem;
    }

    .loading__label {
      font-size: 0.875rem;
      color: var(--ink-500);
    }
  `],
  template: `
    <div class="loading" role="status" [attr.aria-label]="mensaje() || 'Cargando'">
      <div class="skeleton-lines" aria-hidden="true">
        <span class="skeleton" style="width:60%;"></span>
        <span class="skeleton" style="width:80%;"></span>
        <span class="skeleton" style="width:45%;"></span>
        <span class="skeleton" style="width:70%;"></span>
      </div>
      @if (mensaje()) {
        <p class="loading__label">{{ mensaje() }}</p>
      }
    </div>
  `
})
export class LoadingComponent {
  mensaje = input<string>('');
}
