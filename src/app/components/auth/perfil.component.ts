import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Rol } from '../../interfaces/auth.interface';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-perfil',
  imports: [RouterLink],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilComponent {
  private readonly router = inject(Router);
  private readonly notificacion = inject(NotificacionService);
  protected readonly auth = inject(AuthService);

  etiquetaRol(rol: Rol): string {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'moderador':
        return 'Moderador';
      default:
        return 'Ciudadano';
    }
  }

  formatoFecha(valor: string): string {
    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
      return valor;
    }

    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(fecha);
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.notificacion.mostrar('Cerraste sesión correctamente.', 'info');
    await this.router.navigate(['/auth/login']);
  }
}
