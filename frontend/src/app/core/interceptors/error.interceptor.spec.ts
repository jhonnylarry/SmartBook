import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: { logout: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = { logout: vi.fn() };
    routerMock = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deberia llamar logout al recibir 401', () => {
    http.get('/test').subscribe({ error: () => {} });
    const req = httpMock.expectOne('/test');
    req.flush('No autorizado', { status: 401, statusText: 'Unauthorized' });
    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('deberia propagar el error 403 sin llamar logout', () => {
    let errorCapturado = false;
    http.get('/test').subscribe({ error: () => { errorCapturado = true; } });
    const req = httpMock.expectOne('/test');
    req.flush('Prohibido', { status: 403, statusText: 'Forbidden' });
    expect(authServiceMock.logout).not.toHaveBeenCalled();
    expect(errorCapturado).toBe(true);
  });

  it('deberia propagar el error 500 sin llamar logout', () => {
    let errorCapturado = false;
    http.get('/test').subscribe({ error: () => { errorCapturado = true; } });
    const req = httpMock.expectOne('/test');
    req.flush('Error interno', { status: 500, statusText: 'Internal Server Error' });
    expect(authServiceMock.logout).not.toHaveBeenCalled();
    expect(errorCapturado).toBe(true);
  });
});
