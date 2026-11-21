import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-terminos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-xxl py-4" style="max-width: 900px;">
      <h1>Términos de uso</h1>
      <p>[COMPLETAR] Contenido de términos.</p>
    </div>
  `,
})
export class TerminosComponent {}