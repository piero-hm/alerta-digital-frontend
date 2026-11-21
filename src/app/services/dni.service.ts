import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import { Dni } from '../interfaces/auth.interface';

@Injectable({ providedIn: 'root' })
export class DniService {
  private readonly http = inject(HttpClient);

  consultar(numero: string): Observable<Dni> {
    return this.http.get<Dni>(`${environment.apiUrl}/dni/${numero}`);
  }
}
