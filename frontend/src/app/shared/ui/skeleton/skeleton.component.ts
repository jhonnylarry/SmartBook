import { Component, input } from '@angular/core';

export type SkeletonVariant = 'text' | 'avatar' | 'card' | 'tableRow' | 'custom';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    @switch (variant()) {

      @case ('avatar') {
        <div
          class="rounded-full skeleton"
          [style.width]="width() || '40px'"
          [style.height]="height() || '40px'"
        ></div>
      }

      @case ('text') {
        <div
          class="skeleton rounded-lg"
          [style.width]="width() || '100%'"
          [style.height]="height() || '14px'"
        ></div>
      }

      @case ('card') {
        <div class="card space-y-4">
          <div class="flex items-center gap-3">
            <div class="skeleton rounded-xl w-10 h-10"></div>
            <div class="flex-1 space-y-2">
              <div class="skeleton rounded-lg h-3.5 w-2/3"></div>
              <div class="skeleton rounded-lg h-2.5 w-1/2"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="skeleton rounded-lg h-6 w-1/3"></div>
            <div class="skeleton rounded-lg h-3 w-full"></div>
            <div class="skeleton rounded-lg h-3 w-4/5"></div>
          </div>
        </div>
      }

      @case ('tableRow') {
        <div class="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
          <div class="skeleton rounded-lg h-3.5 w-1/4"></div>
          <div class="skeleton rounded-lg h-3.5 w-1/4"></div>
          <div class="skeleton rounded-lg h-3.5 w-1/5"></div>
          <div class="skeleton rounded-lg h-3.5 w-1/6"></div>
          <div class="skeleton rounded-lg h-7 w-16 ml-auto"></div>
        </div>
      }

      @default {
        <!-- custom -->
        <div
          class="skeleton"
          [style.width]="width() || '100%'"
          [style.height]="height() || '16px'"
          [style.borderRadius]="radius() || '8px'"
        ></div>
      }
    }
  `,
})
export class SkeletonComponent {
  variant = input<SkeletonVariant>('text');
  width  = input<string>('');
  height = input<string>('');
  radius = input<string>('');
}
