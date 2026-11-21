import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-accesibilidad',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-xxl py-4" style="max-width: 900px;">
      <h1>Accesibilidad</h1>
      <p>[COMPLETAR] Declaración de accesibilidad.</p>
    </div>
  `,
})
export class AccesibilidadComponent {}