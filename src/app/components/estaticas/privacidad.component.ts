import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-xxl py-4" style="max-width: 900px;">
      <h1>Política de privacidad</h1>
      <p>[COMPLETAR] Contenido de privacidad.</p>
    </div>
  `,
})
export class PrivacidadComponent {}