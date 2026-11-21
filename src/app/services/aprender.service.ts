import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import {
  PublicoObjetivo,
  TemaDetalle,
  TemaResumen,
} from '../interfaces/aprender.interface';

@Injectable({ providedIn: 'root' })
export class AprenderService {
  private readonly http = inject(HttpClient);

  listarTemas(publico?: PublicoObjetivo): Observable<TemaResumen[]> {
    const params = publico
      ? new HttpParams().set('publico_objetivo', publico)
      : undefined;

    return this.http.get<TemaResumen[]>(`${environment.apiUrl}/aprender/temas`, {
      params,
    });
  }

  obtenerTema(slug: string): Observable<TemaDetalle> {
    return this.http.get<TemaDetalle>(
      `${environment.apiUrl}/aprender/temas/${encodeURIComponent(slug)}`,
    );
  }
}
