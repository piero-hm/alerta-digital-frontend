import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Alerta } from '../../interfaces/reportar.interface';
import { ReportarService } from '../../services/reportar.service';
import { mensajeErrorApi } from '../../core/utils/errores';
import { EstadoPantallaComponent } from '../shared/estado-pantalla.component';

@Component({
  selector: 'app-alertas',
  imports: [EstadoPantallaComponent],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertasComponent {
  private readonly reportarService = inject(ReportarService);

  readonly limite = 10;
  readonly alertas = signal<Alerta[]>([]);
  readonly total = signal(0);
  readonly pagina = signal(1);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.limite)),
  );

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const respuesta = await firstValueFrom(
        this.reportarService.listarAlertas(this.pagina(), this.limite),
      );
      this.alertas.set(respuesta.alertas);
      this.total.set(respuesta.total);
    } catch (error) {
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.cargando.set(false);
    }
  }

  async cambiarPagina(delta: number): Promise<void> {
    const nueva = this.pagina() + delta;

    if (nueva < 1 || nueva > this.totalPaginas()) {
      return;
    }

    this.pagina.set(nueva);
    await this.cargar();
  }

  formatoFecha(valor: string): string {
    const fecha = new Date(`${valor}T00:00:00`);

    if (Number.isNaN(fecha.getTime())) {
      return valor;
    }

    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(fecha);
  }
}
