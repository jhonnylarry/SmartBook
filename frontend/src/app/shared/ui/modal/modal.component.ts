import { Component, ElementRef, HostListener, OnDestroy, inject, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        [attr.aria-modal]="true"
        [attr.aria-label]="title()"
      >
        <!-- Backdrop con fade -->
        <div
          class="absolute inset-0 bg-slate-900/45 backdrop-blur-sm animate-fadeIn"
          (click)="closed.emit()"
        ></div>

        <!-- Panel glass con entrada scaleIn -->
        <div
          class="relative z-10 w-full rounded-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]"
          [class]="widthClass()"
          style="background: rgba(255,255,255,0.96); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 24px 70px rgba(2,6,23,0.28);"
        >
          <!-- Header -->
          <div class="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-100 shrink-0">
            <h2 class="text-base font-semibold text-slate-900 truncate">{{ title() }}</h2>
            <button
              (click)="closed.emit()"
              class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0
                     transition-all duration-200 hover:rotate-90
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              aria-label="Cerrar"
            >
              <svg class="w-5 h-5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="px-5 sm:px-6 py-5 overflow-y-auto scrollbar-thin">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }
  `],
})
export class ModalComponent implements OnDestroy {
  open = input.required<boolean>();
  title = input<string>('');
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  closed = output<void>();

  private readonly host = inject(ElementRef<HTMLElement>);

  constructor() {
    // Portal: mover el host a <body> para que el overlay `fixed` se posicione
    // respecto al viewport y nunca quede atrapado por un ancestro con `transform`.
    const el = this.host.nativeElement as HTMLElement;
    if (el && document?.body) {
      document.body.appendChild(el);
    }
  }

  ngOnDestroy(): void {
    const el = this.host.nativeElement as HTMLElement;
    el?.remove();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }

  widthClass(): string {
    const classes: Record<string, string> = {
      sm: 'max-w-sm',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    };
    return classes[this.size()] ?? 'max-w-lg';
  }
}
