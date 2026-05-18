import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HojasVidaService } from './hojas-vida.service';
import { HojaVida } from '../../shared/models/hoja-vida.model';
import { environment } from '../../../environments/environment';

const mockHoja: HojaVida = {
  id: 1,
  idEstudiante: 10,
  observaciones: 'Sin novedad',
  fechaActualizacion: '2025-03-01T10:00:00'
};

describe('HojasVidaService', () => {
  let service: HojasVidaService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/hojas-vida`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(HojasVidaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deberia crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('deberia listar hojas de vida con GET /hojas-vida', () => {
    service.listar().subscribe(list => {
      expect(list.length).toBe(1);
      expect(list[0].idEstudiante).toBe(10);
    });
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush([mockHoja]);
  });

  it('deberia obtener hoja de vida por ID', () => {
    service.obtener(1).subscribe(hv => {
      expect(hv.id).toBe(1);
    });
    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHoja);
  });

  it('deberia obtener hoja de vida por estudiante', () => {
    service.obtenerPorEstudiante(10).subscribe(hv => {
      expect(hv.idEstudiante).toBe(10);
    });
    const req = httpMock.expectOne(`${base}/estudiante/10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHoja);
  });
});
