import { Directive, ElementRef, Input, OnChanges, SimpleChanges, inject } from '@angular/core';

// Easing easeOutQuart
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective implements OnChanges {
  @Input('appCountUp') valor: number | string = 0;
  @Input() duracion = 800; // ms

  private readonly el = inject(ElementRef<HTMLElement>);
  private rafId: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['valor']) {
      const numerico = parseFloat(String(this.valor));
      if (!isNaN(numerico)) {
        this.animar(numerico);
      } else {
        // No numérico (ej: '--'), mostrar directo
        this.el.nativeElement.textContent = String(this.valor);
      }
    }
  }

  private animar(destino: number): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    const inicio = performance.now();
    const esDecimal = destino % 1 !== 0;

    const step = (ahora: number) => {
      const progreso = Math.min((ahora - inicio) / this.duracion, 1);
      const valor = easeOutQuart(progreso) * destino;
      this.el.nativeElement.textContent = esDecimal
        ? valor.toFixed(1)
        : Math.round(valor).toString();

      if (progreso < 1) {
        this.rafId = requestAnimationFrame(step);
      } else {
        this.el.nativeElement.textContent = esDecimal
          ? destino.toFixed(1)
          : destino.toString();
        this.rafId = null;
      }
    };

    this.rafId = requestAnimationFrame(step);
  }
}
