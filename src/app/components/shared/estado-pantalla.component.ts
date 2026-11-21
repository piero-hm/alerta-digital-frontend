import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-estado-pantalla',
  templateUrl: './estado-pantalla.component.html',
  styleUrl: './estado-pantalla.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadoPantallaComponent {
  readonly cargando = input(false);
  readonly error = input<string | null>(null);
  readonly vacio = input(false);
  readonly mensajeVacio = input('No hay información para mostrar.');
  readonly reintentar = output<void>();
}
