import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stepper" [attr.aria-label]="'Paso ' + (current + 1) + ' de ' + steps.length">
      @for (step of steps; track step; let i = $index) {
        <div class="stepper-item" [class.is-done]="i < current" [class.is-current]="i === current">
          <div class="stepper-circle">
            @if (i < current) {
              <app-icon name="check" [size]="18" />
            } @else {
              {{ i + 1 }}
            }
          </div>
          <span class="stepper-label">{{ step }}</span>
        </div>
        @if (i < steps.length - 1) {
          <div class="stepper-line" [class.is-done]="i < current"></div>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .stepper {
      display: flex;
      align-items: center;
      gap: 0;
      width: 100%;
    }
    .stepper-item {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .stepper-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9375rem;
      font-weight: 600;
      flex-shrink: 0;
      background: var(--surface-3);
      color: var(--text-muted);
      border: 2px solid var(--surface-3);
    }
    .stepper-item.is-done .stepper-circle {
      background: var(--accent);
      color: var(--on-accent);
      border-color: var(--accent);
    }
    .stepper-item.is-current .stepper-circle {
      background: transparent;
      color: var(--accent);
      border-color: var(--accent);
      border-width: 2px;
    }
    .stepper-label {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
    }
    .stepper-item.is-current .stepper-label,
    .stepper-item.is-done .stepper-label {
      color: var(--text-primary);
    }
    .stepper-item.is-current .stepper-label { font-weight: 600; }
    .stepper-item.is-done .stepper-label { font-weight: 500; }

    .stepper-line {
      flex: 1;
      height: 2px;
      background: var(--surface-3);
      margin: 0 12px;
      min-width: 24px;
    }
    .stepper-line.is-done { background: var(--accent); }

    @media (max-width: 767px) {
      .stepper-label { display: none; }
      .stepper-item.is-current .stepper-label { display: inline; }
    }
  `],
})
export class StepperComponent {
  @Input() steps: string[] = [];
  @Input() current: number = 0;
}