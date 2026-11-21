import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'success' | 'danger' | 'warning' | 'info';

export interface Notificacion {
  id: number;
  mensaje: string;
  tipo: TipoNotificacion;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private contador = 0;

  readonly notificaciones = signal<Notificacion[]>([]);

  mostrar(
    mensaje: string,
    tipo: TipoNotificacion = 'info',
    duracionMs = 5000,
  ): void {
    this.contador += 1;
    const id = this.contador;

    this.notificaciones.update((actuales) => [...actuales, { id, mensaje, tipo }]);

    if (duracionMs > 0) {
      setTimeout(() => this.cerrar(id), duracionMs);
    }
  }

  cerrar(id: number): void {
    this.notificaciones.update((actuales) =>
      actuales.filter((notificacion) => notificacion.id !== id),
    );
  }
}
