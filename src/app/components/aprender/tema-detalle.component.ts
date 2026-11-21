import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  PublicoObjetivo,
  TemaDetalle,
  TemaResumen,
} from '../../interfaces/aprender.interface';
import { AprenderService } from '../../services/aprender.service';
import { mensajeErrorApi } from '../../core/utils/errores';
import { EstadoPantallaComponent } from '../shared/estado-pantalla.component';
import { IconComponent } from '../../shared/ui/icon.component';
import { IconTileComponent } from '../../shared/ui/icon-tile.component';

@Component({
  selector: 'app-tema-detalle',
  imports: [RouterLink, EstadoPantallaComponent, IconComponent, IconTileComponent],
  templateUrl: './tema-detalle.component.html',
  styleUrl: './tema-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemaDetalleComponent implements OnInit {
  private readonly aprenderService = inject(AprenderService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);

  readonly slug = input.required<string>();

  readonly tema = signal<TemaDetalle | null>(null);
  readonly temas = signal<TemaResumen[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly progresoLectura = signal(0);

  private readonly videos = new Map<string, string>();

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      const onScroll = () => {
        const doc = document.documentElement;
        const total = doc.scrollHeight - doc.clientHeight;
        const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
        this.progresoLectura.set(Math.min(100, Math.max(0, pct)));
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    });
  }

  ngOnInit(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const [tema, temas] = await Promise.all([
        firstValueFrom(this.aprenderService.obtenerTema(this.slug())),
        firstValueFrom(this.aprenderService.listarTemas()).catch(() => [] as TemaResumen[]),
      ]);
      this.tema.set(tema);
      this.temas.set(temas);
    } catch (error) {
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.cargando.set(false);
    }
  }

  etiquetaPublico(publico: PublicoObjetivo): string {
    switch (publico) {
      case 'adulto_mayor':
        return 'Para adultos mayores';
      case 'joven':
        return 'Para jóvenes';
      default:
        return 'Para todos';
    }
  }

  tiempoLectura(tema: TemaDetalle): number {
    const palabras = tema.bloques
      .map((b) => (b.contenido ?? '').split(/\s+/).filter(Boolean).length)
      .reduce((a, b) => a + b, 0);
    return Math.max(1, Math.round(palabras / 200));
  }

  prevTema(): TemaResumen | null {
    const idx = this.temas().findIndex((t) => t.slug === this.slug());
    if (idx <= 0) return null;
    return this.temas()[idx - 1];
  }

  nextTema(): TemaResumen | null {
    const idx = this.temas().findIndex((t) => t.slug === this.slug());
    if (idx < 0 || idx >= this.temas().length - 1) return null;
    return this.temas()[idx + 1];
  }

  lineas(contenido: string | null): string[] {
    if (!contenido) return [];
    return contenido
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }

  dividirLista(contenido: string | null): string[] {
    if (!contenido) return [];
    const mdItems = contenido
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => /^[-*]\s+/.test(l) || /^\d+[.)]\s+/.test(l))
      .map((l) => l.replace(/^[-*]\s+/, '').replace(/^\d+[.)]\s+/, ''));
    if (mdItems.length > 1) return mdItems;

    // fallback: "1) ... 2) ..."
    const partes = contenido.split(/(?=\d+\))/).map((p) => p.trim()).filter(Boolean);
    if (partes.length > 1) {
      return partes.map((p) => p.replace(/^\d+\)\s*/, ''));
    }
    return [contenido];
  }

  urlVideo(recursoUrl: string | null): string | null {
    if (!recursoUrl || !/^[A-Za-z0-9_-]{11}$/.test(recursoUrl)) return null;
    if (this.videos.has(recursoUrl)) return this.videos.get(recursoUrl)!;
    const url = `https://www.youtube-nocookie.com/embed/${recursoUrl}`;
    this.videos.set(recursoUrl, url);
    return url;
  }

  renderMarkdown(texto: string | null): SafeHtml {
    if (!texto) return this.sanitizer.bypassSecurityTrustHtml('');
    let t = texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // headings
    t = t.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    t = t.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    t = t.replace(/^# (.*)$/gm, '<h1>$1</h1>');
    // bold/italic
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // links
    t = t.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    // line breaks
    t = t.replace(/\n/g, '<br/>');
    return this.sanitizer.bypassSecurityTrustHtml(t);
  }

  esPrimerTexto(tema: TemaDetalle, bloque: any): boolean {
    const primerTexto = tema.bloques.find((b) => b.tipo === 'texto');
    return primerTexto?.id === bloque.id;
  }
}
