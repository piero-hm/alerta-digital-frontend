import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import {
  ReporteDepartamento,
  ReporteMensual,
  TopEstafa,
} from '../interfaces/dashboard.interface';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  obtenerTopEstafas(): Observable<TopEstafa[]> {
    return this.http.get<TopEstafa[]>(
      `${environment.apiUrl}/dashboard/top-estafas`,
    );
  }

  obtenerPorDepartamento(): Observable<ReporteDepartamento[]> {
    return this.http.get<ReporteDepartamento[]>(
      `${environment.apiUrl}/dashboard/por-departamento`,
    );
  }

  obtenerMensual(): Observable<ReporteMensual[]> {
    return this.http.get<ReporteMensual[]>(
      `${environment.apiUrl}/dashboard/mensual`,
    );
  }
}
