import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';

/**
 * Servicio compartido del estado de la barra lateral.
 * Permite que TopbarComponent y SidebarComponent se sincronicen.
 * SSR-safe: en servidor siempre renderiza expandido.
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly platformId = inject(PLATFORM_ID);

  /** true = sidebar colapsado (solo íconos) */
  readonly sidebarColapsado = signal<boolean>(false);

  /** true = sidebar abierto en móvil (panel deslizable) */
  readonly sidebarMovilAbierto = signal<boolean>(false);

  constructor() {
    afterNextRender(() => {
      const guardado = localStorage.getItem('ad-sidebar-colapsado');
      if (guardado === 'true') {
        this.sidebarColapsado.set(true);
      }
    });
  }

  alternarColapsado(): void {
    const nuevo = !this.sidebarColapsado();
    this.sidebarColapsado.set(nuevo);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('ad-sidebar-colapsado', String(nuevo));
    }
  }

  abrirMovil(): void {
    this.sidebarMovilAbierto.set(true);
  }

  cerrarMovil(): void {
    this.sidebarMovilAbierto.set(false);
  }

  alternarMovil(): void {
    this.sidebarMovilAbierto.update(v => !v);
  }
}
