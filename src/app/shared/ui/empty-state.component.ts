import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { IconComponent } from './icon.component';

/**
 * Estado vacío reutilizable.
 * Uso: <app-empty-state icon="alertas" title="Sin alertas" [description]="..." />
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <div class="empty-icon">
        <app-icon [name]="icon" [size]="40" />
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      @if (description) {
        <p class="empty-desc">{{ description }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: [`
    :host { display: block; }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 48px 24px;
      gap: 12px;
    }
    .empty-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 72px;
      height: 72px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 20px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .empty-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
    .empty-desc {
      font-size: 0.9375rem;
      color: var(--text-muted);
      max-width: 360px;
      margin: 0;
    }
  `],
})
export class EmptyStateComponent {
  @Input() icon: string = 'info';
  @Input() title: string = 'Sin datos';
  @Input() description?: string;
}
