import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  PublicoObjetivo,
  TemaResumen,
} from '../../interfaces/aprender.interface';
import { AprenderService } from '../../services/aprender.service';
import { mensajeErrorApi } from '../../core/utils/errores';
import { EstadoPantallaComponent } from '../shared/estado-pantalla.component';
import { IconTileComponent } from '../../shared/ui/icon-tile.component';

type FiltroPublico = PublicoObjetivo | '';

@Component({
  selector: 'app-temas-lista',
  imports: [RouterLink, EstadoPantallaComponent, IconTileComponent],
  templateUrl: './temas-lista.component.html',
  styleUrl: './temas-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemasListaComponent {
  private readonly aprenderService = inject(AprenderService);

  readonly temas = signal<TemaResumen[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly filtro = signal<FiltroPublico>('');

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const publico = this.filtro();
      const temas = await firstValueFrom(
        this.aprenderService.listarTemas(publico || undefined),
      );
      this.temas.set(temas);
    } catch (error) {
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarFiltro(valor: FiltroPublico): void {
    this.filtro.set(valor);
    void this.cargar();
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
}