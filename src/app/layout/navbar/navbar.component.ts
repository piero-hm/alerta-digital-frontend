import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../services/auth.service';
import { LayoutService } from '../../shared/services/layout.service';
import { PreferenciasService } from '../../shared/services/preferencias.service';
import { IconComponent } from '../../shared/ui/icon.component';

interface SeccionInfo {
  titulo: string;
  migas: string[];
}

const RUTAS: Record<string, SeccionInfo> = {
  '/': { titulo: 'Inicio', migas: ['Inicio'] },
  '/aprender': { titulo: 'Aprender', migas: ['Inicio', 'Aprender'] },
  '/practicar': { titulo: 'Practicar', migas: ['Inicio', 'Practicar'] },
  '/verificar-enlace': { titulo: 'Verificar enlace', migas: ['Inicio', 'Verificar enlace'] },
  '/alertas': { titulo: 'Alertas públicas', migas: ['Inicio', 'Alertas públicas'] },
  '/reportar': { titulo: 'Reportar estafa', migas: ['Inicio', 'Reportar'] },
  '/mis-reportes': { titulo: 'Mis reportes', migas: ['Inicio', 'Mis reportes'] },
  '/moderacion': { titulo: 'Moderación', migas: ['Inicio', 'Moderación'] },
  '/admin/temas': { titulo: 'Contenido', migas: ['Inicio', 'Administración', 'Contenido'] },
  '/auth/login': { titulo: 'Iniciar sesión', migas: ['Inicio', 'Iniciar sesión'] },
  '/auth/registro': { titulo: 'Crear cuenta', migas: ['Inicio', 'Crear cuenta'] },
  '/auth/completar-perfil': { titulo: 'Completar perfil', migas: ['Inicio', 'Completar perfil'] },
  '/perfil': { titulo: 'Mi perfil', migas: ['Inicio', 'Mi perfil'] },
  '/guia-de-estilo': { titulo: 'Guía de estilo', migas: ['Inicio', 'Guía de estilo'] },
};

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, IconComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly layout = inject(LayoutService);
  protected readonly prefs = inject(PreferenciasService);
  private readonly router = inject(Router);

  readonly seccion = signal<SeccionInfo>({ titulo: 'Inicio', migas: ['Inicio'] });
  readonly menuUsuario = signal(false);
  readonly hoy = this.formatearFecha(new Date());

  constructor() {
    this.actualizarSeccion(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .pipe(takeUntilDestroyed())
      .subscribe((e) => this.actualizarSeccion(e.urlAfterRedirects));
  }

  private actualizarSeccion(url: string): void {
    const path = url.split('?')[0].split('#')[0];
    const base = path.split('/').slice(0, 2).join('/') || '/';
    const info =
      RUTAS[path] ??
      RUTAS[base] ??
      ({ titulo: 'Alerta Digital', migas: ['Inicio'] } as SeccionInfo);
    this.seccion.set(info);
  }

  private formatearFecha(fecha: Date): string {
    const txt = fecha.toLocaleDateString('es-PE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.menuUsuario.set(false);
  }
}