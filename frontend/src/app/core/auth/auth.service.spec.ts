import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginResponse, Usuario } from './models';

const mockUsuario: Usuario = {
  id: 1,
  username: 'admin',
  email: 'admin@colegio.cl',
  rol: 'ADMINISTRADOR',
  activo: true,
  fechaCreacion: '2025-01-01'
};

const mockLoginResponse: LoginResponse = {
  token: 'eyJhbGciOiJIUzI1NiJ9.mock',
  expiraEn: '2025-12-31T23:59:59',
  usuario: mockUsuario
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deberia crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('deberia iniciar sin usuario autenticado', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('deberia guardar token y usuario tras login exitoso', () => {
    service.login({ username: 'admin', password: 'admin123' }).subscribe(res => {
      expect(res.token).toBe(mockLoginResponse.token);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.username).toBe('admin');
      expect(localStorage.getItem('smartbook_token')).toBe(mockLoginResponse.token);
    });

    const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
    expect(req.request.method).toBe('POST');
    req.flush(mockLoginResponse);
  });

  it('deberia limpiar token y usuario al hacer logout', () => {
    localStorage.setItem('smartbook_token', 'mock-token');
    localStorage.setItem('smartbook_user', JSON.stringify(mockUsuario));

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('smartbook_token')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('deberia retornar token desde localStorage', () => {
    localStorage.setItem('smartbook_token', 'mi-token');
    expect(service.getToken()).toBe('mi-token');
  });

  it('deberia retornar null si no hay token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('deberia verificar rol correctamente tras login', () => {
    // Simular login: el servicio establece el usuario via signal
    service.login({ username: 'admin', password: 'admin123' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/auth/login'));
    req.flush(mockLoginResponse);

    expect(service.hasRole('ADMINISTRADOR')).toBe(true);
    expect(service.hasRole('DOCENTE')).toBe(false);
    expect(service.hasRole('ADMINISTRADOR', 'DOCENTE')).toBe(true);
  });

  it('deberia retornar false en hasRole si no hay usuario', () => {
    expect(service.hasRole('ADMINISTRADOR')).toBe(false);
  });
});
