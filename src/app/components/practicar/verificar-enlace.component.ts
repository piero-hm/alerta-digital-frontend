import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
  maxLength,
  required,
  validate,
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { ResultadoEnlace } from '../../interfaces/practicar.interface';
import { PracticarService } from '../../services/practicar.service';
import { mensajeErrorApi } from '../../core/utils/errores';

interface EnlaceFormModel {
  url: string;
}

@Component({
  selector: 'app-verificar-enlace',
  imports: [FormField, FormRoot],
  templateUrl: './verificar-enlace.component.html',
  styleUrl: './verificar-enlace.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificarEnlaceComponent {
  private readonly practicarService = inject(PracticarService);

  readonly modelo = signal<EnlaceFormModel>({ url: '' });
  readonly resultado = signal<ResultadoEnlace | null>(null);

  readonly resultadoInfo = computed(() => {
    switch (this.resultado()) {
      case 'seguro':
        return {
          clase: 'alert-success',
          titulo: 'El enlace parece seguro',
          detalle:
            'No encontramos señales de peligro. Aun así, revisa siempre la dirección antes de ingresar tus datos.',
        };
      case 'sospechoso':
        return {
          clase: 'alert-warning',
          titulo: 'El enlace es sospechoso',
          detalle:
            'Ten cuidado. No ingreses contraseñas ni datos de tarjetas. Verifica la página por otro medio.',
        };
      case 'peligroso':
        return {
          clase: 'alert-danger',
          titulo: 'El enlace es peligroso',
          detalle:
            'No abras el enlace ni compartas información personal. Si lo recibiste por mensaje, repórtalo.',
        };
      default:
        return null;
    }
  });

  readonly form = form(
    this.modelo,
    (path) => {
      required(path.url, { message: 'Escribe el enlace que deseas verificar.' });
      maxLength(path.url, 2048, { message: 'El enlace no puede superar 2048 caracteres.' });
      validate(path.url, ({ value }) => {
        const url = value().trim();

        if (!url) {
          return null;
        }

        try {
          const analizada = new URL(url);

          if (analizada.protocol !== 'http:' && analizada.protocol !== 'https:') {
            return {
              kind: 'protocolo',
              message: 'El enlace debe comenzar con http:// o https://.',
            };
          }
        } catch {
          return {
            kind: 'formatoUrl',
            message: 'Escribe una dirección válida, por ejemplo https://ejemplo.com.',
          };
        }

        return null;
      });
    },
    {
      submission: {
        action: async (field) => {
          const datos = field().value();
          this.resultado.set(null);

          try {
            const respuesta = await firstValueFrom(
              this.practicarService.verificarEnlace(datos.url.trim()),
            );

            this.resultado.set(respuesta.resultado);
            return;
          } catch (error) {
            return {
              kind: 'servidor',
              message: mensajeErrorApi(error),
            };
          }
        },
      },
    },
  );
}
