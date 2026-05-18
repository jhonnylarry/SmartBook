import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CountUpDirective } from './count-up.directive';

// Host con OnPush para no forzar CD extra
@Component({
  standalone: true,
  imports: [CountUpDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [appCountUp]="valor" [duracion]="duracion">0</span>`
})
class TestHostComponent {
  valor: number | string = 0;
  duracion = 800;
}

describe('CountUpDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('deberia crearse correctamente', () => {
    fixture.detectChanges();
    const spanEl = fixture.debugElement.query(By.css('span'));
    expect(spanEl).toBeTruthy();
  });

  it('deberia mostrar string no numerico "--" directamente sin animar', () => {
    host.valor = '--';
    fixture.detectChanges();
    const spanEl = fixture.debugElement.query(By.css('span'));
    expect(spanEl.nativeElement.textContent).toBe('--');
  });

  it('deberia mostrar string no numerico "N/A" directamente sin animar', () => {
    host.valor = 'N/A';
    fixture.detectChanges();
    const spanEl = fixture.debugElement.query(By.css('span'));
    expect(spanEl.nativeElement.textContent).toBe('N/A');
  });

  it('deberia llamar requestAnimationFrame al recibir un valor numerico positivo', () => {
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1);

    host.valor = 42;
    host.duracion = 800;
    fixture.detectChanges();

    expect(rafSpy).toHaveBeenCalledTimes(1);
  });

  it('deberia llamar requestAnimationFrame al recibir valor decimal', () => {
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(2);

    host.valor = 3.7;
    host.duracion = 800;
    fixture.detectChanges();

    expect(rafSpy).toHaveBeenCalledTimes(1);
  });

  it('deberia NO llamar requestAnimationFrame para string no numerico', () => {
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1);

    host.valor = 'texto';
    fixture.detectChanges();

    expect(rafSpy).not.toHaveBeenCalled();
  });

  it('deberia iniciar una segunda animacion al cambiar valor (no lanzar excepcion)', () => {
    vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1);

    host.valor = 10;
    host.duracion = 800;
    fixture.detectChanges();

    // Cambiar valor: debe manejar el cambio sin error
    expect(() => {
      host.valor = 20;
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('deberia no lanzar excepcion con valor 0', () => {
    vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1);

    host.valor = 0;
    host.duracion = 800;

    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('deberia mostrar valor directamente si es string numerico vacio', () => {
    host.valor = '';
    fixture.detectChanges();
    const spanEl = fixture.debugElement.query(By.css('span'));
    // '' parseado es NaN -> muestra el string tal cual
    expect(spanEl.nativeElement.textContent).toBe('');
  });
});
