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
  readonly urlVerificada = signal<string | null>(null);

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


  readonly motivos = computed(() => {
    const resultado = this.resultado();
    const url = this.urlVerificada();

    if (!resultado || !url) {
      return [];
    }

    const lista = this.analizarMotivos(url);

    if (resultado === 'peligroso') {
      lista.unshift('Google Safe Browsing lo identificó como una amenaza conocida.');
    }

    if (lista.length === 0) {
      lista.push(
        resultado === 'seguro'
          ? 'No se detectaron señales de riesgo en las verificaciones automáticas.'
          : 'Presenta características dudosas.',
      );
    }

    return lista;
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
          this.urlVerificada.set(datos.url.trim());

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

  private analizarMotivos(url: string): string[] {
    const motivos: string[] = [];

    let analizada: URL;
    try {
      analizada = new URL(url);
    } catch {
      return motivos;
    }

    const hostname = (analizada.hostname || '').toLowerCase();

    if (!hostname) {
      motivos.push('No se pudo identificar el dominio del enlace.');
    }

    if (analizada.protocol !== 'https:') {
      motivos.push('No usa una conexión segura (HTTPS).');
    }

    if (this.esDireccionIp(hostname)) {
      motivos.push('Usa una dirección IP en lugar de un nombre de dominio.');
    }

    if (hostname.includes('xn--')) {
      motivos.push('El dominio usa caracteres disfrazados (punycode).');
    }

    const acortadores = new Set([
      'bit.ly',
      'tinyurl.com',
      't.co',
      'goo.gl',
      'ow.ly',
      'is.gd',
      'buff.ly',
      'cutt.ly',
      'shorturl.at',
      'rebrand.ly',
      'tiny.cc',
    ]);

    if (acortadores.has(hostname)) {
      motivos.push('Es un acortador de enlaces que oculta el destino real.');
    }

    if (analizada.port && analizada.port !== '80' && analizada.port !== '443') {
      motivos.push('Usa un puerto no habitual.');
    }

    if (analizada.username || analizada.password) {
      motivos.push('Incluye datos de usuario o contraseña en el enlace.');
    }

    if (hostname.split('.').length - 1 >= 4) {
      motivos.push('Tiene demasiados subdominios.');
    }

    if (url.length > 200) {
      motivos.push('El enlace es inusualmente largo.');
    }

    const palabrasSospechosas = [
      'login',
      'iniciar-sesion',
      'verificar',
      'actualizar',
      'contrasena',
      'contraseña',
      'clave',
      'cuenta',
      'premio',
      'gratis',
      'urgente',
      'ganador',
      'sorteo',
      'regalo',
      'factura',
      'pago',
      'seguridad',
      'soporte',
    ];

    const encontradas = palabrasSospechosas.filter((palabra) =>
      url.toLowerCase().includes(palabra),
    );

    if (encontradas.length > 0) {
      motivos.push(`Contiene palabras usadas en estafas: ${encontradas.join(', ')}.`);
    }

    return motivos;
  }

  private esDireccionIp(hostname: string): boolean {
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
      return true;
    }

    return hostname.includes(':');
  }
}
