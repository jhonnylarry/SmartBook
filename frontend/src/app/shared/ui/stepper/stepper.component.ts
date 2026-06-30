import { Component, input } from '@angular/core';

export interface Step {
  label: string;
  description?: string;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  template: `
    <nav aria-label="Pasos del formulario">
      <ol class="flex items-center w-full">
        @for (step of steps(); track $index) {
          <li
            class="flex items-center"
            [class.flex-1]="$index < steps().length - 1"
          >
            <div class="flex flex-col items-center">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold border-2 transition-all duration-300"
                [class]="stepCircleClass($index)"
              >
                @if ($index < currentStep()) {
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  {{ $index + 1 }}
                }
              </div>
              <div class="mt-2 text-center">
                <p
                  class="text-xs font-semibold"
                  [class]="stepLabelClass($index)"
                >
                  {{ step.label }}
                </p>
                @if (step.description) {
                  <p class="text-xs text-gray-400 hidden sm:block">{{ step.description }}</p>
                }
              </div>
            </div>

            @if ($index < steps().length - 1) {
              <div
                class="flex-1 h-0.5 mx-4 transition-colors duration-300"
                [class]="$index < currentStep() ? 'bg-primary-600' : 'bg-gray-200'"
              ></div>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class StepperComponent {
  steps = input.required<Step[]>();
  currentStep = input<number>(0);

  stepCircleClass(index: number): string {
    const current = this.currentStep();
    if (index < current) {
      return 'bg-primary-600 border-primary-600 text-white';
    }
    if (index === current) {
      return 'bg-white border-primary-600 text-primary-800';
    }
    return 'bg-white border-gray-300 text-gray-400';
  }

  stepLabelClass(index: number): string {
    const current = this.currentStep();
    if (index === current) return 'text-primary-800';
    if (index < current) return 'text-primary-600';
    return 'text-gray-400';
  }
}
