import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  EstadoReporte,
  Reporte,
} from '../../interfaces/reportar.interface';
import { ReportarService } from '../../services/reportar.service';
import { mensajeErrorApi } from '../../core/utils/errores';
import { EstadoPantallaComponent } from '../shared/estado-pantalla.component';

@Component({
  selector: 'app-mis-reportes',
  imports: [RouterLink, EstadoPantallaComponent],
  templateUrl: './mis-reportes.component.html',
  styleUrl: './mis-reportes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisReportesComponent {
  private readonly reportarService = inject(ReportarService);

  readonly reportes = signal<Reporte[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const reportes = await firstValueFrom(this.reportarService.listarMios());
      this.reportes.set(reportes);
    } catch (error) {
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.cargando.set(false);
    }
  }

  claseEstado(estado: EstadoReporte): string {
    switch (estado) {
      case 'validado':
        return 'badge badge-estado-validado';
      case 'rechazado':
        return 'badge badge-estado-rechazado';
      default:
        return 'badge badge-estado-pendiente';
    }
  }

  etiquetaEstado(estado: EstadoReporte): string {
    switch (estado) {
      case 'validado':
        return 'Validado';
      case 'rechazado':
        return 'Rechazado';
      default:
        return 'Pendiente';
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
    }).format(fecha);
  }

  moneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      maximumFractionDigits: 2,
    }).format(valor);
  }

  enlaceSeguro(valor: string | null): boolean {
    return valor !== null && /^https?:\/\//i.test(valor);
  }
}
