import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let token: WritableSignal<string | null>;

  beforeEach(() => {
    token = signal<string | null>('token-de-prueba');

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { accessToken: token } },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('agrega el token a las peticiones al backend', () => {
    http.get(`${environment.apiUrl}/aprender/temas`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/aprender/temas`);
    expect(req.request.headers.get('Authorization')).toBe(
      'Bearer token-de-prueba',
    );
    req.flush([]);
  });

  it('no agrega el token a peticiones externas', () => {
    http.get('https://ejemplo.com/datos.json').subscribe();

    const req = httpMock.expectOne('https://ejemplo.com/datos.json');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('no agrega el token cuando no hay sesión', () => {
    token.set(null);

    http.get(`${environment.apiUrl}/aprender/temas`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/aprender/temas`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });
});
