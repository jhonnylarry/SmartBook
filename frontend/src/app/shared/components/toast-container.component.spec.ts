import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastContainerComponent } from './toast-container.component';
import { ToastService } from '../services/toast.service';

describe('ToastContainerComponent', () => {
  let fixture: ComponentFixture<ToastContainerComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastContainerComponent);
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deberia crearse correctamente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deberia renderizar un toast de success', () => {
    toastService.success('Guardado correctamente');
    fixture.detectChanges();
    const toastEl = fixture.nativeElement.querySelector('.toast--success');
    expect(toastEl).toBeTruthy();
    expect(toastEl.textContent).toContain('Guardado correctamente');
  });

  it('deberia renderizar un toast de error', () => {
    toastService.error('Error al guardar');
    fixture.detectChanges();
    const toastEl = fixture.nativeElement.querySelector('.toast--error');
    expect(toastEl).toBeTruthy();
    expect(toastEl.textContent).toContain('Error al guardar');
  });

  it('deberia renderizar un toast de warning', () => {
    toastService.warning('Advertencia de prueba');
    fixture.detectChanges();
    const toastEl = fixture.nativeElement.querySelector('.toast--warning');
    expect(toastEl).toBeTruthy();
  });

  it('deberia renderizar un toast de info', () => {
    toastService.info('Informacion de prueba');
    fixture.detectChanges();
    const toastEl = fixture.nativeElement.querySelector('.toast--info');
    expect(toastEl).toBeTruthy();
  });

  it('deberia renderizar multiples toasts simultaneamente', () => {
    toastService.success('Mensaje 1');
    toastService.error('Mensaje 2');
    toastService.info('Mensaje 3');
    fixture.detectChanges();
    const toasts = fixture.nativeElement.querySelectorAll('.toast');
    expect(toasts.length).toBe(3);
  });

  it('deberia tener boton de cierre por cada toast', () => {
    toastService.success('Con boton de cierre');
    fixture.detectChanges();
    const closeBtn = fixture.nativeElement.querySelector('.toast__close');
    expect(closeBtn).toBeTruthy();
  });

  it('deberia marcar como saliendo al hacer click en cerrar', () => {
    toastService.success('Toast para cerrar');
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.toast__close');
    closeBtn.click();
    fixture.detectChanges();

    expect(toastService.toasts()[0]?.saliendo).toBe(true);

    // Avanzar los 200ms del delay de eliminacion
    vi.advanceTimersByTime(200);
    fixture.detectChanges();

    expect(toastService.toasts().length).toBe(0);
  });

  it('deberia aplicar clase "saliendo" al toast que se esta cerrando', () => {
    toastService.success('Toast saliendo');
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.toast__close');
    closeBtn.click();
    fixture.detectChanges();

    const toastEl = fixture.nativeElement.querySelector('.toast');
    expect(toastEl.classList.contains('saliendo')).toBe(true);

    vi.advanceTimersByTime(200);
  });

  it('deberia tener aria-live polite en toast de info', () => {
    toastService.info('Mensaje informativo');
    fixture.detectChanges();
    const toastEl = fixture.nativeElement.querySelector('.toast--info');
    expect(toastEl.getAttribute('aria-live')).toBe('polite');
  });

  it('deberia tener aria-live assertive en toast de error', () => {
    toastService.error('Error critico');
    fixture.detectChanges();
    const toastEl = fixture.nativeElement.querySelector('.toast--error');
    expect(toastEl.getAttribute('aria-live')).toBe('assertive');
  });

  it('deberia tener aria-live polite en toast de success', () => {
    toastService.success('Operacion exitosa');
    fixture.detectChanges();
    const toastEl = fixture.nativeElement.querySelector('.toast--success');
    expect(toastEl.getAttribute('aria-live')).toBe('polite');
  });

  it('deberia eliminar toast automaticamente despues de 4 segundos', () => {
    toastService.success('Auto dismiss');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.toast').length).toBe(1);

    // A los 3700ms se marca como saliendo
    vi.advanceTimersByTime(3700);
    fixture.detectChanges();
    expect(toastService.toasts()[0]?.saliendo).toBe(true);

    // A los 4000ms se elimina
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.toast').length).toBe(0);
  });

  it('deberia mostrar el mensaje en el cuerpo del toast', () => {
    toastService.success('Estudiante registrado exitosamente');
    fixture.detectChanges();
    const mensaje = fixture.nativeElement.querySelector('.toast__mensaje');
    expect(mensaje.textContent.trim()).toBe('Estudiante registrado exitosamente');
  });
});
