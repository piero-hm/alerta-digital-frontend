import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

/**
 * Barra de progreso accesible.
 * Uso: <app-progress-bar [value]="75" [max]="100" color="var(--violet)" />
 */
@Component({
  selector: 'app-progress-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="progress-track"
      role="progressbar"
      [attr.aria-valuenow]="value"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="max"
      [attr.aria-label]="label"
    >
      <div
        class="progress-fill"
        [style.width.%]="porcentaje"
        [style.background-color]="color"
      ></div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .progress-track {
      height: 8px;
      background: var(--surface-3);
      border-radius: var(--radius-pill);
      overflow: hidden;
      width: 100%;
    }
    .progress-fill {
      height: 100%;
      border-radius: var(--radius-pill);
      background-color: var(--accent);
      transition: width 600ms var(--ease-out);
    }
  `],
})
export class ProgressBarComponent {
  @Input() value: number = 0;
  @Input() max: number = 100;
  @Input() color: string = 'var(--accent)';
  @Input() label: string = 'Progreso';

  get porcentaje(): number {
    return this.max > 0 ? Math.min(100, Math.round((this.value / this.max) * 100)) : 0;
  }
}
