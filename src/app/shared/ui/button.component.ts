import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="ad-button"
      [class]="'ad-button ad-button-' + variant"
      [class.ad-button-full]="fullWidth"
      [class.ad-button-loading]="loading"
      [disabled]="disabled || loading"
      [attr.aria-busy]="loading"
      [attr.type]="type"
    >
      @if (loading) {
        <span class="ad-button-spinner" aria-hidden="true"></span>
      } @else if (icon && iconPosition === 'left') {
        <app-icon [name]="icon" [size]="20" />
      }
      <span class="ad-button-label"><ng-content /></span>
      @if (!loading && icon && iconPosition === 'right') {
        <app-icon [name]="icon" [size]="20" />
      }
    </button>
  `,
  styles: [`
    :host { display: inline-block; }
    :host(.full) { display: block; width: 100%; }

    .ad-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-height: 52px;
      padding: 0 24px;
      border-radius: 12px;
      border: 1px solid transparent;
      font-size: 1.0625rem;
      font-weight: 600;
      line-height: 1.5rem;
      cursor: pointer;
      transition: background-color 150ms cubic-bezier(.2,.8,.2,1),
                  border-color 150ms ease,
                  transform 120ms ease,
                  box-shadow 150ms ease;
      white-space: nowrap;
    }

    .ad-button-full { width: 100%; }

    .ad-button:active { transform: scale(0.98); }
    .ad-button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .ad-button-primary {
      background: var(--accent);
      color: var(--on-accent);
      box-shadow: 0 0 0 0 rgba(182,242,60,0);
    }
    .ad-button-primary:hover:not(:disabled) {
      background: var(--accent-hover);
      box-shadow: 0 0 20px rgba(182,242,60,0.18);
      transform: translateY(-1px);
    }
    .ad-button-primary:active:not(:disabled) { background: var(--accent-press); }

    .ad-button-secondary {
      background: var(--surface-2);
      color: var(--text-primary);
      border-color: var(--border);
    }
    .ad-button-secondary:hover:not(:disabled) {
      background: var(--surface-3);
      border-color: var(--border-strong);
    }

    .ad-button-ghost {
      background: transparent;
      color: var(--text-primary);
      border-color: transparent;
    }
    .ad-button-ghost:hover:not(:disabled) {
      background: var(--surface-2);
    }

    .ad-button-danger {
      background: var(--danger);
      color: #fff;
    }
    .ad-button-danger:hover:not(:disabled) { filter: brightness(1.08); }

    .ad-button-icon {
      width: 44px;
      height: 44px;
      padding: 0;
      min-height: 44px;
    }

    .ad-button-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      display: inline-block;
      animation: ad-spin 600ms linear infinite;
    }

    @keyframes ad-spin { to { transform: rotate(360deg); } }

    @media (prefers-reduced-motion: reduce) {
      .ad-button-spinner { animation: none; }
    }
  `],
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'submit';
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon' = 'primary';
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
}