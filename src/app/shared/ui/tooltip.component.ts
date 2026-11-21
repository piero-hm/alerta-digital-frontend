import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="tooltip-wrap">
      <ng-content />
      <span class="tooltip-bubble" role="tooltip">{{ text }}</span>
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .tooltip-wrap {
      position: relative;
      display: inline-flex;
    }
    .tooltip-bubble {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%) translateY(4px);
      background: var(--surface-3);
      color: var(--text-primary);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 0.9375rem;
      line-height: 1.25rem;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 150ms ease, transform 150ms ease;
      z-index: 50;
    }
    .tooltip-wrap:hover .tooltip-bubble,
    .tooltip-wrap:focus-within .tooltip-bubble {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    @media (prefers-reduced-motion: reduce) {
      .tooltip-bubble { transition: none; }
    }
  `],
})
export class TooltipComponent {
  @Input() text: string = '';
}