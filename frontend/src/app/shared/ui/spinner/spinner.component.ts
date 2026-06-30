import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center gap-2">
      <!-- Spinner branded: doble anillo navy + acento ámbar -->
      <div class="relative" [style.width]="containerSize()" [style.height]="containerSize()">
        <!-- Anillo exterior navy -->
        <div
          class="absolute inset-0 rounded-full border-2 border-primary-200/50"
        ></div>
        <!-- Anillo giratorio principal -->
        <div
          class="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
          style="border-top-color: #1E3A8A; border-right-color: #1E3A8A;"
        ></div>
        <!-- Anillo interior ámbar (gira en sentido contrario) -->
        @if (size() !== 'sm') {
          <div
            class="absolute rounded-full border-2 border-transparent animate-spin"
            [style.inset]="innerInset()"
            style="border-bottom-color: #F59E0B; animation-direction: reverse; animation-duration: 0.6s;"
          ></div>
        }
        <!-- Punto central -->
        @if (size() === 'lg') {
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
          </div>
        }
      </div>

      @if (label()) {
        <span class="text-xs font-medium text-slate-500">{{ label() }}</span>
      }
    </div>
  `,
})
export class SpinnerComponent {
  size  = input<'sm' | 'md' | 'lg'>('md');
  label = input<string>('');

  containerSize(): string {
    const sizes: Record<string, string> = { sm: '16px', md: '32px', lg: '48px' };
    return sizes[this.size()] ?? '32px';
  }

  innerInset(): string {
    const insets: Record<string, string> = { md: '5px', lg: '8px' };
    return insets[this.size()] ?? '5px';
  }
}
