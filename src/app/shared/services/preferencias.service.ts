import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';

export type Tema = 'dark' | 'light';
export type TamañoFuente = 'a' | 'a-plus' | 'a-plus-plus';

const ESCALA_FUENTE: Record<TamañoFuente, string> = {
  a: '100%',
  'a-plus': '112%',
  'a-plus-plus': '125%',
};

@Injectable({ providedIn: 'root' })
export class PreferenciasService {
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly tema = signal<Tema>('dark');
  readonly fuente = signal<TamañoFuente>('a');

  constructor() {
    afterNextRender(() => {
      const tamañoGuardado = localStorage.getItem('ad-fuente') as TamañoFuente | null;

      this.tema.set('dark');
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('ad-tema', 'dark');
      }

      if (
        tamañoGuardado === 'a' ||
        tamañoGuardado === 'a-plus' ||
        tamañoGuardado === 'a-plus-plus'
      ) {
        this.fuente.set(tamañoGuardado);
      }

      this.aplicarTema('dark');
      this.aplicarTamañoFuente(this.fuente());
    });
  }

  alternarTema(): void {
    this.tema.set('dark');
    this.aplicarTema('dark');
  }

  establecerFuente(tamaño: TamañoFuente): void {
    this.fuente.set(tamaño);
    this.aplicarTamañoFuente(tamaño);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('ad-fuente', tamaño);
    }
  }

  private aplicarTema(tema: Tema): void {
    this.doc.documentElement.setAttribute('data-theme', tema);
  }

  private aplicarTamañoFuente(tamaño: TamañoFuente): void {
    this.doc.documentElement.style.fontSize = ESCALA_FUENTE[tamaño];
  }
}