import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import { Catalogos } from '../interfaces/catalogos.interface';

@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private readonly http = inject(HttpClient);

  obtener(): Observable<Catalogos> {
    return this.http.get<Catalogos>(`${environment.apiUrl}/catalogos`);
  }
}
