import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

/**
 * Componente ícono de módulo: cuadrado redondeado con fondo tintado
 * del color del módulo y el ícono centrado.
 *
 * Uso: <app-module-icon module="aprender" icon="aprender" [size]="40" />
 */
@Component({
  selector: 'app-module-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="module-icon-wrap"
      [class]="'module-icon-' + module"
      [style.width.px]="size"
      [style.height.px]="size"
      aria-hidden="true"
    >
      <span class="ad-icon" [style.font-size.px]="iconSize">{{ glifo }}</span>
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .module-icon-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      flex-shrink: 0;
    }
    .module-icon-aprender {
      background: var(--info-soft);
      color: var(--info);
    }
    .module-icon-practicar {
      background: var(--violet-soft);
      color: var(--violet);
    }
    .module-icon-reportar {
      background: var(--warn-soft);
      color: var(--warn);
    }
    .module-icon-dashboard {
      background: var(--accent-soft);
      color: var(--accent);
    }
    .module-icon-alertas {
      background: var(--danger-soft);
      color: var(--danger);
    }
    .module-icon-verificar {
      background: var(--success-soft);
      color: var(--success);
    }
    .module-icon-admin {
      background: var(--surface-3);
      color: var(--text-secondary);
    }
    .ad-icon {
      font-family: 'Symbols Nerd Font', 'Nerd Fonts', sans-serif;
      font-style: normal;
      font-weight: normal;
      text-rendering: auto;
      -webkit-font-smoothing: antialiased;
      color: currentColor;
      user-select: none;
    }
  `],
})
export class ModuleIconComponent {
  @Input() module: 'aprender' | 'practicar' | 'reportar' | 'dashboard' | 'alertas' | 'verificar' | 'admin' = 'aprender';
  @Input() size: number = 40;

  private readonly glyphs: Record<string, string> = {
    aprender:  '󰑴',
    practicar: '󰐻',
    reportar:  '󰋩',
    dashboard: '󰕴',
    alertas:   '󰂚',
    verificar: '󰌐',
    admin:     '󰒓',
  };

  get glifo(): string { return this.glyphs[this.module] ?? '?'; }
  get iconSize(): number { return Math.round(this.size * 0.52); }
}
