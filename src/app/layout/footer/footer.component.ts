import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AprenderService } from '../../services/aprender.service';
import { IconComponent } from '../../shared/ui/icon.component';
import { IconTileComponent } from '../../shared/ui/icon-tile.component';
import { TemaResumen } from '../../interfaces/aprender.interface';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, IconComponent, IconTileComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly aprenderService = inject(AprenderService);

  readonly temas = signal<TemaResumen[]>([]);
  readonly temasError = signal(false);

  ngOnInit(): void {
    void this.cargarTemas();
  }

  private async cargarTemas(): Promise<void> {
    try {
      const temas = await firstValueFrom(this.aprenderService.listarTemas());
      this.temas.set(temas.slice(0, 4));
    } catch {
      this.temasError.set(true);
    }
  }

  volverArriba(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}