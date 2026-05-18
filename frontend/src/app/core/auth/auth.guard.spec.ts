import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let authServiceMock: { isAuthenticated: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = { isAuthenticated: vi.fn() };
    routerMock = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  const ejecutarGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

  it('deberia permitir acceso cuando el usuario esta autenticado', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    expect(ejecutarGuard()).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('deberia redirigir a /login cuando el usuario no esta autenticado', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    expect(ejecutarGuard()).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
