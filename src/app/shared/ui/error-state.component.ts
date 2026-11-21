import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { IconComponent } from './icon.component';

/**
 * Estado de error reutilizable con botón "Reintentar".
 * Uso: <app-error-state [mensaje]="msg" (reintentar)="cargar()" />
 */
@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-state" role="alert">
      <div class="error-icon">
        <app-icon name="error" [size]="36" />
      </div>
      <h3 class="error-title">Algo salió mal</h3>
      <p class="error-desc">{{ mensaje }}</p>
      @if (mostrarReintentar) {
        <button class="btn btn-secondary" type="button" (click)="reintentar.emit()">
          <app-icon name="cargar" [size]="18" />
          Reintentar
        </button>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 48px 24px;
      gap: 12px;
    }
    .error-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 72px;
      height: 72px;
      background: var(--danger-soft);
      border: 1px solid var(--danger);
      border-radius: 20px;
      color: var(--danger);
      margin-bottom: 4px;
    }
    .error-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
    .error-desc {
      font-size: 0.9375rem;
      color: var(--text-muted);
      max-width: 400px;
      margin: 0;
    }
  `],
})
export class ErrorStateComponent {
  @Input() mensaje: string = 'Ocurrió un error al cargar los datos.';
  @Input() mostrarReintentar: boolean = true;
  @Output() reintentar = new EventEmitter<void>();
}
