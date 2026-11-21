import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  ReporteAdmin,
} from '../../interfaces/admin.interface';
import { EstadoReporte } from '../../interfaces/reportar.interface';
import { AdminService } from '../../services/admin.service';
import { NotificacionService } from '../../services/notificacion.service';
import {
  mensajeErrorApi,
  obtenerApiError,
} from '../../core/utils/errores';
import { EstadoPantallaComponent } from '../shared/estado-pantalla.component';

type FiltroEstado = EstadoReporte | '';

@Component({
  selector: 'app-reportes-pendientes',
  imports: [EstadoPantallaComponent],
  templateUrl: './reportes-pendientes.component.html',
  styleUrl: './reportes-pendientes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesPendientesComponent {
  private readonly adminService = inject(AdminService);
  private readonly notificacion = inject(NotificacionService);

  readonly reportes = signal<ReporteAdmin[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly filtro = signal<FiltroEstado>('pendiente');

  readonly modalAbierto = signal(false);
  readonly procesando = signal(false);
  readonly reporteSeleccionado = signal<ReporteAdmin | null>(null);
  readonly nuevoEstado = signal<'validado' | 'rechazado'>('validado');

  readonly tituloModal = computed(() =>
    this.nuevoEstado() === 'validado' ? 'Validar reporte' : 'Rechazar reporte',
  );

  readonly pendientes = computed(
    () => this.reportes().filter((reporte) => reporte.estado === 'pendiente').length,
  );

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const filtro = this.filtro();
      const reportes = await firstValueFrom(
        this.adminService.listarReportes(filtro || undefined),
      );
      this.reportes.set(reportes);
    } catch (error) {
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarFiltro(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.filtro.set(valor as FiltroEstado);
    void this.cargar();
  }

  abrirConfirmacion(
    reporte: ReporteAdmin,
    estado: 'validado' | 'rechazado',
  ): void {
    this.reporteSeleccionado.set(reporte);
    this.nuevoEstado.set(estado);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    if (this.procesando()) {
      return;
    }

    this.modalAbierto.set(false);
    this.reporteSeleccionado.set(null);
  }

  async confirmar(): Promise<void> {
    const reporte = this.reporteSeleccionado();

    if (!reporte) {
      return;
    }

    this.procesando.set(true);

    try {
      await firstValueFrom(
        this.adminService.cambiarEstadoReporte(reporte.id, this.nuevoEstado()),
      );

      this.modalAbierto.set(false);
      this.reporteSeleccionado.set(null);
      this.notificacion.mostrar(
        this.nuevoEstado() === 'validado'
          ? 'El reporte fue validado y ya puede aparecer en alertas públicas.'
          : 'El reporte fue rechazado.',
        'success',
      );
      await this.cargar();
    } catch (error) {
      const apiError = obtenerApiError(error);
      this.modalAbierto.set(false);
      this.reporteSeleccionado.set(null);

      if (apiError?.code === 'CONFLICTO') {
        this.notificacion.mostrar(
          'Otro moderador ya cambió este reporte. Actualizamos la lista.',
          'warning',
        );
      } else {
        this.notificacion.mostrar(mensajeErrorApi(error), 'danger');
      }

      await this.cargar();
    } finally {
      this.procesando.set(false);
    }
  }

  clasesEstado(estado: EstadoReporte): string {
    switch (estado) {
      case 'validado':
        return 'badge badge-estado-validado';
      case 'rechazado':
        return 'badge badge-estado-rechazado';
      default:
        return 'badge badge-estado-pendiente';
    }
  }

  formatoFecha(valor: string): string {
    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
      return valor;
    }

    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
