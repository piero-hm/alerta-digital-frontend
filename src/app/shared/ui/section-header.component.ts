import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

/**
 * Encabezado de sección con título, descripción opcional y slot para acciones.
 * Uso: <app-section-header title="Aprender" description="..." />
 */
@Component({
  selector: 'app-section-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="section-header">
      <div class="section-header-text">
        @if (label) {
          <p class="section-label">{{ label }}</p>
        }
        <h2 class="section-title">{{ title }}</h2>
        @if (description) {
          <p class="section-desc">{{ description }}</p>
        }
      </div>
      <div class="section-header-actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .section-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .section-label {
      font-size: 0.8125rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
      margin: 0;
    }
    .section-desc {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      margin-top: 6px;
      margin-bottom: 0;
    }
    .section-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
  `],
})
export class SectionHeaderComponent {
  @Input() title: string = '';
  @Input() description?: string;
  @Input() label?: string;
}
