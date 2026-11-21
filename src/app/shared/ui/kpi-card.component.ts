import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="kpi-card"
      [class]="'kpi-theme-' + color"
      [attr.aria-label]="titulo + ': ' + displayValor()"
    >
      <div class="kpi-header">
        <span class="kpi-icon-wrap" [class]="'icon-' + color" aria-hidden="true">
          <app-icon [name]="icono" [size]="22" />
        </span>
        <span class="kpi-titulo">{{ titulo }}</span>
      </div>

      <div class="kpi-body">
        <div class="kpi-valor" [title]="displayValor()">
          @if (prefijo) {
            <span class="kpi-prefijo">{{ prefijo }}</span>
          }
          <span class="kpi-numero">{{ displayValor() }}</span>
          @if (sufijo) {
            <span class="kpi-sufijo">{{ sufijo }}</span>
          }
        </div>

        @if (descripcion) {
          <p class="kpi-desc">{{ descripcion }}</p>
        }
      </div>
    </article>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .kpi-card {
      background-color: var(--surface-1);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px 22px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 14px;
      transition: transform 180ms cubic-bezier(.2,.8,.2,1),
                  border-color 180ms ease,
                  box-shadow 180ms ease;
      position: relative;
      overflow: hidden;
    }

    .kpi-card::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 80px;
      height: 80px;
      background: radial-gradient(circle, var(--kpi-glow, rgba(182,242,60,0.06)) 0%, transparent 70%);
      pointer-events: none;
      border-top-right-radius: 16px;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      border-color: var(--border-strong);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }

    .kpi-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .kpi-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 180ms ease;
    }

    .kpi-card:hover .kpi-icon-wrap {
      transform: scale(1.05);
    }

    .icon-accent { background: var(--accent-soft); color: var(--accent); }
    .icon-info   { background: rgba(56, 189, 248, 0.14); color: var(--info); }
    .icon-violet { background: rgba(167, 139, 250, 0.14); color: var(--violet); }
    .icon-warn   { background: rgba(251, 191, 36, 0.14); color: var(--warn); }
    .icon-success{ background: rgba(45, 212, 160, 0.14); color: var(--success); }
    .icon-danger { background: rgba(251, 113, 133, 0.14); color: var(--danger); }

    .kpi-theme-accent { --kpi-glow: rgba(182, 242, 60, 0.12); }
    .kpi-theme-info   { --kpi-glow: rgba(56, 189, 248, 0.12); }
    .kpi-theme-violet { --kpi-glow: rgba(167, 139, 250, 0.12); }
    .kpi-theme-warn   { --kpi-glow: rgba(251, 191, 36, 0.12); }
    .kpi-theme-danger { --kpi-glow: rgba(251, 113, 133, 0.12); }

    .kpi-titulo {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1.3;
    }

    .kpi-body {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .kpi-valor {
      font-size: clamp(1.75rem, 3.5vw, 2.25rem);
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.025em;
      line-height: 1.1;
      font-variant-numeric: tabular-nums;
      display: flex;
      align-items: baseline;
      gap: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .kpi-prefijo, .kpi-sufijo {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--text-muted);
    }

    .kpi-desc {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.4;
    }
  `],
})
export class KpiCardComponent implements OnChanges {
  private readonly platformId = inject(PLATFORM_ID);

  @Input() titulo: string = '';
  @Input() valor: number | string = 0;
  @Input() prefijo: string = '';
  @Input() sufijo: string = '';
  @Input() icono: string = 'dashboard';
  @Input() color: 'accent' | 'info' | 'violet' | 'warn' | 'success' | 'danger' = 'accent';
  @Input() descripcion?: string;
  @Input() animar: boolean = true;

  readonly displayValor = signal<string>('0');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['valor']) {
      this.actualizarValor();
    }
  }

  private actualizarValor(): void {
    if (typeof this.valor === 'string') {
      this.displayValor.set(this.valor);
      return;
    }

    const num = Number(this.valor);
    if (Number.isNaN(num)) {
      this.displayValor.set(String(this.valor));
      return;
    }

    if (!isPlatformBrowser(this.platformId) || !this.animar) {
      this.displayValor.set(this.formatearNumero(num));
      return;
    }

    // Comprobar si el usuario prefiere movimiento reducido
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reducedMotion) {
      this.displayValor.set(this.formatearNumero(num));
      return;
    }

    // Animación con requestAnimationFrame
    const duracion = 900;
    const inicioTiempo = performance.now();
    const paso = (tiempoActual: number) => {
      const progreso = Math.min((tiempoActual - inicioTiempo) / duracion, 1);
      // Easing out cubic: 1 - pow(1 - t, 3)
      const eased = 1 - Math.pow(1 - progreso, 3);
      const valorActual = Math.round(num * eased);
      this.displayValor.set(this.formatearNumero(valorActual));

      if (progreso < 1) {
        requestAnimationFrame(paso);
      } else {
        this.displayValor.set(this.formatearNumero(num));
      }
    };

    requestAnimationFrame(paso);
  }

  private formatearNumero(val: number): string {
    return new Intl.NumberFormat('es-PE').format(val);
  }
}
