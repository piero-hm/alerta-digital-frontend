import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-icon-tile',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="icon-tile"
      [class]="'icon-tile-' + color"
      [style.width.px]="size"
      [style.height.px]="size"
      [style.border-radius.px]="radius"
    >
      <app-icon [name]="name" [size]="glyphSize" />
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .icon-tile {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid;
    }
    .icon-tile-accent { background: var(--accent-soft); color: var(--accent); border-color: rgba(182,242,60,0.28); }
    .icon-tile-info { background: var(--info-soft); color: var(--info); border-color: rgba(56,189,248,0.28); }
    .icon-tile-violet { background: var(--violet-soft); color: var(--violet); border-color: rgba(167,139,250,0.28); }
    .icon-tile-warn { background: var(--warn-soft); color: var(--warn); border-color: rgba(251,191,36,0.28); }
    .icon-tile-success { background: var(--success-soft); color: var(--success); border-color: rgba(45,212,160,0.28); }
    .icon-tile-danger { background: var(--danger-soft); color: var(--danger); border-color: rgba(251,113,133,0.28); }
    .icon-tile-muted { background: var(--surface-3); color: var(--text-secondary); border-color: var(--border); }
  `],
})
export class IconTileComponent {
  @Input() name: string = 'escudo';
  @Input() size: 36 | 44 | 56 = 36;
  @Input() color: 'accent' | 'info' | 'violet' | 'warn' | 'success' | 'danger' | 'muted' = 'accent';

  get radius(): number {
    if (this.size === 36) return 10;
    if (this.size === 44) return 12;
    return 16;
  }

  get glyphSize(): number {
    return Math.round(this.size * 0.55);
  }
}