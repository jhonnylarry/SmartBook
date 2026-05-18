import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('deberia crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('deberia agregar un toast de success', () => {
    service.success('Operacion exitosa');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].tipo).toBe('success');
    expect(service.toasts()[0].mensaje).toBe('Operacion exitosa');
  });

  it('deberia agregar un toast de error', () => {
    service.error('Ha ocurrido un error');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].tipo).toBe('error');
  });

  it('deberia agregar un toast de warning', () => {
    service.warning('Advertencia importante');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].tipo).toBe('warning');
  });

  it('deberia agregar un toast de info', () => {
    service.info('Informacion adicional');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].tipo).toBe('info');
  });

  it('deberia acumular multiples toasts', () => {
    service.success('Mensaje 1');
    service.error('Mensaje 2');
    service.info('Mensaje 3');
    expect(service.toasts().length).toBe(3);
  });

  it('deberia asignar ids unicos a cada toast', () => {
    service.success('A');
    service.success('B');
    const ids = service.toasts().map(t => t.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('deberia marcar toast como saliendo al llamar removerManual', () => {
    service.success('Mensaje');
    const id = service.toasts()[0].id;
    service.removerManual(id);
    expect(service.toasts()[0].saliendo).toBe(true);
  });
});
