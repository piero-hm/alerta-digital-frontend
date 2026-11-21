import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { TemaResumen } from '../../interfaces/aprender.interface';
import { ProgresoTema } from '../../interfaces/practicar.interface';
import { AprenderService } from '../../services/aprender.service';
import { AuthService } from '../../services/auth.service';
import { PracticarService } from '../../services/practicar.service';
import { mensajeErrorApi } from '../../core/utils/errores';
import { EstadoPantallaComponent } from '../shared/estado-pantalla.component';
import { IconTileComponent } from '../../shared/ui/icon-tile.component';

@Component({
  selector: 'app-practicar-lista',
  imports: [RouterLink, EstadoPantallaComponent, IconTileComponent],
  templateUrl: './practicar-lista.component.html',
  styleUrl: './practicar-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticarListaComponent {
  private readonly aprenderService = inject(AprenderService);
  private readonly practicarService = inject(PracticarService);
  protected readonly auth = inject(AuthService);

  readonly temas = signal<TemaResumen[]>([]);
  readonly progreso = signal<ProgresoTema[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly progresoPorTema = computed(
    () => new Map(this.progreso().map((item) => [item.tema_id, item])),
  );

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const temas = await firstValueFrom(this.aprenderService.listarTemas());
      this.temas.set(temas);

      if (this.auth.perfilCompleto()) {
        try {
          const progreso = await firstValueFrom(
            this.practicarService.obtenerProgreso(),
          );
          this.progreso.set(progreso);
        } catch {
          this.progreso.set([]);
        }
      } else {
        this.progreso.set([]);
      }
    } catch (error) {
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.cargando.set(false);
    }
  }

  progresoDe(temaId: number): ProgresoTema | undefined {
    return this.progresoPorTema().get(temaId);
  }
}
