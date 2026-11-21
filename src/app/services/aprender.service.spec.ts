import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../environments/environment';
import { AprenderService } from './aprender.service';

describe('AprenderService', () => {
  let service: AprenderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AprenderService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AprenderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lista los temas publicados', () => {
    service.listarTemas().subscribe((temas) => {
      expect(temas.length).toBe(1);
      expect(temas[0].slug).toBe('phishing');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/aprender/temas`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('publico_objetivo')).toBe(false);

    req.flush([
      {
        id: 1,
        slug: 'phishing',
        titulo: 'Phishing',
        resumen: null,
        publico_objetivo: 'todos',
      },
    ]);
  });

  it('filtra los temas por público objetivo', () => {
    service.listarTemas('adulto_mayor').subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/aprender/temas?publico_objetivo=adulto_mayor`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('publico_objetivo')).toBe('adulto_mayor');

    req.flush([]);
  });
});
