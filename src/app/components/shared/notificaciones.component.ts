import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import {
  NotificacionService,
  TipoNotificacion,
} from '../../services/notificacion.service';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificacionesComponent {
  protected readonly notificacion = inject(NotificacionService);

  claseToast(tipo: TipoNotificacion): string {
    return `alert alert-${tipo} alert-dismissible mb-0`;
  }

  iconoTipo(tipo: TipoNotificacion): string {
    const iconos: Record<TipoNotificacion, string> = {
      success: '✅',
      danger:  '❌',
      warning: '⚠️',
      info:    'ℹ️',
    };
    return iconos[tipo] ?? 'ℹ️';
  }
}
