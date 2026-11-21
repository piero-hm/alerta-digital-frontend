import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { AprenderService } from '../../services/aprender.service';
import { DashboardService } from '../../services/dashboard.service';
import { PracticarService } from '../../services/practicar.service';
import { ReportarService } from '../../services/reportar.service';
import { mensajeErrorApi } from '../../core/utils/errores';
import { TopEstafa, ReporteDepartamento, ReporteMensual } from '../../interfaces/dashboard.interface';
import { Alerta } from '../../interfaces/reportar.interface';
import { ProgresoTema } from '../../interfaces/practicar.interface';

import { IconComponent } from '../../shared/ui/icon.component';
import { IconTileComponent } from '../../shared/ui/icon-tile.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { ProgressBarComponent } from '../../shared/ui/progress-bar.component';

interface ChartPoint {
  x: number;
  y: number;
  total: number;
  mes: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    IconComponent,
    IconTileComponent,
    KpiCardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    SkeletonComponent,
    ProgressBarComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  protected readonly auth = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly aprenderService = inject(AprenderService);
  private readonly practicarService = inject(PracticarService);
  private readonly reportarService = inject(ReportarService);

  // Dashboard data
  readonly topEstafas = signal<TopEstafa[]>([]);
  readonly porDepartamento = signal<ReporteDepartamento[]>([]);
  readonly mensual = signal<ReporteMensual[]>([]);
  readonly dashboardLoading = signal(true);
  readonly dashboardError = signal<string | null>(null);
  readonly dashboardWaking = signal(false);

  // Alertas
  readonly alertasRecientes = signal<Alerta[]>([]);
  readonly totalAlertas = signal(0);
  readonly alertasLoading = signal(true);
  readonly alertasError = signal<string | null>(null);
  readonly alertasWaking = signal(false);

  // Temas
  readonly temasCount = signal(0);
  readonly temasLoading = signal(true);
  readonly temasError = signal<string | null>(null);

  // Progreso
  readonly progreso = signal<ProgresoTema[]>([]);
  readonly progresoLoading = signal(false);
  readonly progresoError = signal<string | null>(null);

  readonly totalReportes = computed(() =>
    this.porDepartamento().reduce((t, i) => t + i.total, 0),
  );

  readonly montoTotal = computed(() =>
    this.mensual().reduce((t, i) => t + (i.monto_afectado ?? 0), 0),
  );

  readonly estafaFrecuente = computed(() => this.topEstafas()[0]?.tipo_fraude ?? '—');

  readonly deptoMasReportes = computed(() => {
    const arr = [...this.porDepartamento()].sort((a, b) => b.total - a.total);
    return arr[0]?.departamento ?? '—';
  });

  readonly maxDepartamento = computed(() =>
    Math.max(1, ...this.porDepartamento().map((i) => i.total)),
  );

  readonly estafaColores = ['#B6F23C', '#38BDF8', '#A78BFA', '#FBBF24', '#FB7185'];

  readonly maxEstafa = computed(() =>
    Math.max(1, ...this.topEstafas().map((i) => i.total)),
  );

  readonly donutGradient = computed(() => {
    const items = this.topEstafas().slice(0, 5);
    const total = items.reduce((t, i) => t + i.total, 0) || 1;
    let acc = 0;
    const parts: string[] = [];
    items.forEach((item, idx) => {
      const start = (acc / total) * 100;
      acc += item.total;
      const end = (acc / total) * 100;
      parts.push(`${this.estafaColores[idx % this.estafaColores.length]} ${start}% ${end}%`);
    });
    if (parts.length === 0) return 'conic-gradient(var(--surface-3) 0 100%)';
    return `conic-gradient(${parts.join(', ')})`;
  });

  readonly donutTotal = computed(() =>
    this.topEstafas().reduce((t, i) => t + i.total, 0),
  );

  readonly ultimoMesTotal = computed(() => {
    const items = this.mensual();
    return items.length > 0 ? items[items.length - 1].total : 0;
  });

  readonly promedioMensual = computed(() => {
    const items = this.mensual();
    if (items.length === 0) return 0;
    return Math.round(items.reduce((t, i) => t + i.total, 0) / items.length);
  });

  readonly tendenciaMensual = computed<number | null>(() => {
    const items = this.mensual();
    if (items.length < 2) return null;
    const previo = items[items.length - 2].total;
    const actual = items[items.length - 1].total;
    if (previo === 0) return actual > 0 ? 100 : 0;
    return Math.round(((actual - previo) / previo) * 100);
  });

  readonly monthlyChart = computed(() => {
    const items = this.mensual();
    const w = 640;
    const h = 220;
    const pad = 24;
    if (items.length === 0) {
      return { line: '', area: '', dots: [] as ChartPoint[], max: 1, avgY: h / 2 };
    }
    const max = Math.max(1, ...items.map((i) => i.total));
    const step = items.length > 1 ? (w - pad * 2) / (items.length - 1) : 0;
    const dots: ChartPoint[] = items.map((item, idx) => ({
      x: items.length > 1 ? pad + idx * step : w / 2,
      y: h - pad - (item.total / max) * (h - pad * 2),
      total: item.total,
      mes: item.mes,
    }));
    const line = this.smoothPath(dots);
    const last = dots[dots.length - 1];
    const first = dots[0];
    const area = `${line} L${last.x.toFixed(1)},${h} L${first.x.toFixed(1)},${h} Z`;
    const promedio = items.reduce((t, i) => t + i.total, 0) / items.length;
    const avgY = h - pad - (promedio / max) * (h - pad * 2);
    return { line, area, dots, max, avgY };
  });

  readonly progresoPromedio = computed(() => {
    const items = this.progreso();
    if (items.length === 0) return 0;
    return Math.round(items.reduce((t, i) => t + i.porcentaje, 0) / items.length);
  });

  readonly temasCompletados = computed(
    () => this.progreso().filter((p) => p.completado).length,
  );

  readonly progresoRing = computed(
    () =>
      `conic-gradient(var(--accent) ${this.progresoPromedio()}%, var(--surface-3) 0)`,
  );

  constructor() {
    void this.cargarDashboard();
    void this.cargarAlertas();
    void this.cargarTemas();
    if (this.auth.autenticado()) void this.cargarProgreso();
  }

  private async conDespertar<T>(accion: () => Promise<T>, waking: (v: boolean) => void): Promise<T> {
    const timer = setTimeout(() => waking(true), 4000);
    try {
      return await accion();
    } finally {
      clearTimeout(timer);
      waking(false);
    }
  }

  async cargarDashboard(): Promise<void> {
    this.dashboardLoading.set(true);
    this.dashboardError.set(null);
    try {
      const datos = await this.conDespertar(
        () =>
          firstValueFrom(
            // sequential to keep simple
            this.dashboardService.obtenerTopEstafas().pipe(),
          ).then(async (top) => {
            const dept = await firstValueFrom(this.dashboardService.obtenerPorDepartamento());
            const mens = await firstValueFrom(this.dashboardService.obtenerMensual());
            return { top, dept, mens };
          }),
        (v) => this.dashboardWaking.set(v),
      );
      this.topEstafas.set(datos.top);
      this.porDepartamento.set(datos.dept);
      this.mensual.set(datos.mens);
    } catch (e) {
      this.dashboardError.set(mensajeErrorApi(e));
    } finally {
      this.dashboardLoading.set(false);
    }
  }

  async cargarAlertas(): Promise<void> {
    this.alertasLoading.set(true);
    this.alertasError.set(null);
    try {
      const page = await this.conDespertar(
        () => firstValueFrom(this.reportarService.listarAlertas(1, 5)),
        (v) => this.alertasWaking.set(v),
      );
      this.alertasRecientes.set(page.alertas);
      this.totalAlertas.set(page.total);
    } catch (e) {
      this.alertasError.set(mensajeErrorApi(e));
    } finally {
      this.alertasLoading.set(false);
    }
  }

  async cargarTemas(): Promise<void> {
    this.temasLoading.set(true);
    this.temasError.set(null);
    try {
      const temas = await this.conDespertar(
        () => firstValueFrom(this.aprenderService.listarTemas()),
        () => {},
      );
      this.temasCount.set(temas.length);
    } catch (e) {
      this.temasError.set(mensajeErrorApi(e));
    } finally {
      this.temasLoading.set(false);
    }
  }

  async cargarProgreso(): Promise<void> {
    this.progresoLoading.set(true);
    this.progresoError.set(null);
    try {
      const p = await firstValueFrom(this.practicarService.obtenerProgreso());
      this.progreso.set(p);
    } catch (e) {
      this.progresoError.set(mensajeErrorApi(e));
    } finally {
      this.progresoLoading.set(false);
    }
  }

  private smoothPath(points: ChartPoint[]): string {
    if (points.length === 0) return '';
    if (points.length === 1) {
      return `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
    }
    let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] ?? points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] ?? p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  }

  porcentaje(valor: number, maximo: number): number {
    return Math.round((valor / maximo) * 100);
  }

  moneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      maximumFractionDigits: 2,
    }).format(valor);
  }

  formatoMes(valor: string): string {
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return valor;
    return new Intl.DateTimeFormat('es-PE', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(fecha);
  }

  canalIcono(canal: string): string {
    const c = canal.toLowerCase();
    if (c.includes('whatsapp')) return 'whatsapp';
    if (c.includes('sms')) return 'sms';
    if (c.includes('correo') || c.includes('email')) return 'correo';
    if (c.includes('llamada') || c.includes('tel')) return 'telefono';
    return 'web';
  }
}