import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EstudiantesService } from './estudiantes.service';
import { Estudiante } from '../../shared/models/estudiante.model';
import { environment } from '../../../environments/environment';

const mockEstudiante: Estudiante = {
  id: 1,
  nombre: 'Juan',
  apellido: 'Perez',
  rut: '12.345.678-9',
  email: 'juan@colegio.cl'
};

describe('EstudiantesService', () => {
  let service: EstudiantesService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/estudiantes`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(EstudiantesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deberia listar estudiantes con GET /estudiantes', () => {
    service.listar().subscribe(list => {
      expect(list.length).toBe(1);
      expect(list[0].nombre).toBe('Juan');
    });

    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush([mockEstudiante]);
  });

  it('deberia obtener un estudiante por ID', () => {
    service.obtener(1).subscribe(est => {
      expect(est.id).toBe(1);
    });

    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEstudiante);
  });

  it('deberia crear un estudiante con POST', () => {
    const nuevo = { nombre: 'Maria', apellido: 'Lopez' };
    service.crear(nuevo).subscribe(est => {
      expect(est.nombre).toBe('Maria');
    });

    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevo);
    req.flush({ ...nuevo, id: 2 });
  });

  it('deberia actualizar un estudiante con PUT', () => {
    const actualizado = { nombre: 'Juan', apellido: 'Perez Gonzalez' };
    service.actualizar(1, actualizado).subscribe(est => {
      expect(est.apellido).toBe('Perez Gonzalez');
    });

    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockEstudiante, ...actualizado });
  });

  it('deberia eliminar un estudiante con DELETE', () => {
    service.eliminar(1).subscribe(() => {
      // no error = exito
    });

    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
