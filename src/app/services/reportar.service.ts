import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import {
  AlertasPage,
  Reporte,
  ReporteCreate,
} from '../interfaces/reportar.interface';

@Injectable({ providedIn: 'root' })
export class ReportarService {
  private readonly http = inject(HttpClient);

  crear(reporte: ReporteCreate): Observable<Reporte> {
    return this.http.post<Reporte>(`${environment.apiUrl}/reportar`, reporte);
  }

  listarMios(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(`${environment.apiUrl}/reportar/mios`);
  }

  listarAlertas(pagina: number, limite: number): Observable<AlertasPage> {
    const params = new HttpParams()
      .set('pagina', String(pagina))
      .set('limite', String(limite));

    return this.http.get<AlertasPage>(`${environment.apiUrl}/reportar/alertas`, {
      params,
    });
  }
}
