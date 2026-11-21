import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import {
  BloqueAdmin,
  BloqueAdminCreate,
  BloqueAdminUpdate,
  OpcionAdmin,
  OpcionAdminCreate,
  OpcionAdminUpdate,
  PreguntaAdmin,
  PreguntaAdminCreate,
  PreguntaAdminUpdate,
  ReporteAdmin,
  TemaAdmin,
  TemaAdminCreate,
  TemaAdminDetalle,
  TemaAdminUpdate,
} from '../interfaces/admin.interface';
import { EstadoReporte } from '../interfaces/reportar.interface';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  listarReportes(estado?: EstadoReporte): Observable<ReporteAdmin[]> {
    const params = estado ? new HttpParams().set('estado', estado) : undefined;

    return this.http.get<ReporteAdmin[]>(`${environment.apiUrl}/admin/reportes`, {
      params,
    });
  }

  cambiarEstadoReporte(
    id: number,
    estado: 'validado' | 'rechazado',
  ): Observable<ReporteAdmin> {
    return this.http.patch<ReporteAdmin>(
      `${environment.apiUrl}/admin/reportes/${id}/estado`,
      { estado },
    );
  }

  listarTemas(): Observable<TemaAdmin[]> {
    return this.http.get<TemaAdmin[]>(`${environment.apiUrl}/admin/temas`);
  }

  obtenerTema(id: number): Observable<TemaAdminDetalle> {
    return this.http.get<TemaAdminDetalle>(
      `${environment.apiUrl}/admin/temas/${id}`,
    );
  }

  crearTema(tema: TemaAdminCreate): Observable<TemaAdmin> {
    return this.http.post<TemaAdmin>(`${environment.apiUrl}/admin/temas`, tema);
  }

  actualizarTema(id: number, tema: TemaAdminUpdate): Observable<TemaAdmin> {
    return this.http.patch<TemaAdmin>(
      `${environment.apiUrl}/admin/temas/${id}`,
      tema,
    );
  }

  cambiarPublicacion(id: number, publicado: boolean): Observable<TemaAdmin> {
    return this.http.patch<TemaAdmin>(
      `${environment.apiUrl}/admin/temas/${id}/publicacion`,
      { publicado },
    );
  }

  crearBloque(temaId: number, bloque: BloqueAdminCreate): Observable<BloqueAdmin> {
    return this.http.post<BloqueAdmin>(
      `${environment.apiUrl}/admin/temas/${temaId}/bloques`,
      bloque,
    );
  }

  actualizarBloque(id: number, bloque: BloqueAdminUpdate): Observable<BloqueAdmin> {
    return this.http.patch<BloqueAdmin>(
      `${environment.apiUrl}/admin/bloques/${id}`,
      bloque,
    );
  }

  crearPregunta(
    temaId: number,
    pregunta: PreguntaAdminCreate,
  ): Observable<PreguntaAdmin> {
    return this.http.post<PreguntaAdmin>(
      `${environment.apiUrl}/admin/temas/${temaId}/preguntas`,
      pregunta,
    );
  }

  actualizarPregunta(
    id: number,
    pregunta: PreguntaAdminUpdate,
  ): Observable<PreguntaAdmin> {
    return this.http.patch<PreguntaAdmin>(
      `${environment.apiUrl}/admin/preguntas/${id}`,
      pregunta,
    );
  }

  crearOpcion(
    preguntaId: number,
    opcion: OpcionAdminCreate,
  ): Observable<OpcionAdmin> {
    return this.http.post<OpcionAdmin>(
      `${environment.apiUrl}/admin/preguntas/${preguntaId}/opciones`,
      opcion,
    );
  }

  actualizarOpcion(
    id: number,
    opcion: OpcionAdminUpdate,
  ): Observable<OpcionAdmin> {
    return this.http.patch<OpcionAdmin>(
      `${environment.apiUrl}/admin/opciones/${id}`,
      opcion,
    );
  }
}
