import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import {
  EnlaceOut,
  PreguntaPractica,
  ProgresoTema,
  RespuestaOut,
} from '../interfaces/practicar.interface';

@Injectable({ providedIn: 'root' })
export class PracticarService {
  private readonly http = inject(HttpClient);

  obtenerPreguntas(slug: string): Observable<PreguntaPractica[]> {
    return this.http.get<PreguntaPractica[]>(
      `${environment.apiUrl}/practicar/temas/${encodeURIComponent(slug)}/preguntas`,
    );
  }

  responder(opcionId: number): Observable<RespuestaOut> {
    return this.http.post<RespuestaOut>(`${environment.apiUrl}/practicar/responder`, {
      opcion_id: opcionId,
    });
  }

  obtenerProgreso(): Observable<ProgresoTema[]> {
    return this.http.get<ProgresoTema[]>(
      `${environment.apiUrl}/practicar/progreso/me`,
    );
  }

  verificarEnlace(url: string): Observable<EnlaceOut> {
    return this.http.post<EnlaceOut>(
      `${environment.apiUrl}/practicar/verificar-enlace`,
      { url },
    );
  }
}
