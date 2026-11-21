import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

/**
 * Bloque esqueleto con shimmer para estados de carga.
 * Uso: <app-skeleton height="80" width="100%" borderRadius="16" />
 */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="skeleton" [style.height.px]="height" [style.width]="width" [style.border-radius.px]="borderRadius" aria-hidden="true"></div>`,
  styles: [`:host { display: block; }`],
})
export class SkeletonComponent {
  @Input() height: number = 20;
  @Input() width: string = '100%';
  @Input() borderRadius: number = 12;
}
