import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-field">
      @if (label) {
        <label class="form-field-label">
          {{ label }}
          @if (required) { <span class="form-field-required" aria-hidden="true">*</span> }
        </label>
      }
      <div class="form-field-control">
        @if (icon) {
          <span class="form-field-icon" aria-hidden="true">
            <app-icon [name]="icon" [size]="24" />
          </span>
        }
        <ng-content />
        @if (counter) {
          <span class="form-field-counter">{{ counter }}</span>
        }
      </div>
      @if (help && !error) {
        <p class="form-field-help">{{ help }}</p>
      }
      @if (error) {
        <p class="form-field-error" role="alert">
          <app-icon name="error" [size]="16" />
          {{ error }}
        </p>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .form-field { display: flex; flex-direction: column; gap: 6px; }
    .form-field-label {
      font-size: 1rem;
      line-height: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .form-field-required { color: var(--danger); margin-left: 2px; }
    .form-field-control {
      position: relative;
      display: flex;
      align-items: center;
    }
    .form-field-control ::ng-deep input,
    .form-field-control ::ng-deep textarea,
    .form-field-control ::ng-deep select {
      width: 100%;
      min-height: 56px;
      padding: 0 16px 0 48px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 12px;
      color: var(--text-primary);
      font-size: 1.125rem;
      line-height: 1.75rem;
    }
    .form-field-control ::ng-deep input:focus,
    .form-field-control ::ng-deep textarea:focus,
    .form-field-control ::ng-deep select:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 4px rgba(182,242,60,0.20);
    }
    .form-field-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
      z-index: 1;
    }
    .form-field-control:has(input:focus) .form-field-icon,
    .form-field-control:has(textarea:focus) .form-field-icon { color: var(--accent); }

    .form-field-counter {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.875rem;
      color: var(--text-muted);
      pointer-events: none;
    }

    .form-field-help {
      font-size: 0.9375rem;
      line-height: 1.375rem;
      color: var(--text-muted);
      margin: 0;
    }
    .form-field-error {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9375rem;
      line-height: 1.375rem;
      color: var(--danger);
      margin: 0;
    }
  `],
})
export class FormFieldComponent {
  @Input() label?: string;
  @Input() help?: string;
  @Input() error?: string;
  @Input() icon?: string;
  @Input() required: boolean = false;
  @Input() counter?: string;
}