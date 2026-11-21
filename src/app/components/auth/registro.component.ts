import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  minLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Dni } from '../../interfaces/auth.interface';
import { AuthService } from '../../services/auth.service';
import { DniService } from '../../services/dni.service';
import { NotificacionService } from '../../services/notificacion.service';
import {
  mensajeErrorApi,
  mensajeErrorSupabase,
} from '../../core/utils/errores';
import { IconComponent } from '../../shared/ui/icon.component';
import { IconTileComponent } from '../../shared/ui/icon-tile.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field.component';
import { StepperComponent } from '../../shared/ui/stepper.component';

interface DniFormModel {
  dni: string;
}

interface RegistroFormModel {
  email: string;
  password: string;
  confirmar: string;
  acepto_datos: boolean;
}

@Component({
  selector: 'app-registro',
  imports: [FormField, FormRoot, RouterLink, IconComponent, IconTileComponent, ButtonComponent, FormFieldComponent, StepperComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistroComponent {
  private readonly auth = inject(AuthService);
  private readonly dniService = inject(DniService);
  private readonly router = inject(Router);
  private readonly notificacion = inject(NotificacionService);

  readonly dniModelo = signal<DniFormModel>({ dni: '' });
  readonly registroModelo = signal<RegistroFormModel>({
    email: '',
    password: '',
    confirmar: '',
    acepto_datos: false,
  });

  readonly datosDni = signal<Dni | null>(null);
  readonly requiereConfirmacion = signal(false);

  readonly dniForm = form(
    this.dniModelo,
    (path) => {
      required(path.dni, { message: 'Escribe tu DNI.' });
      pattern(path.dni, /^\d{8}$/, {
        message: 'El DNI debe tener exactamente 8 números.',
      });
    },
    {
      submission: {
        action: async (field) => {
          const dni = field().value().dni.trim();

          try {
            const datos = await firstValueFrom(this.dniService.consultar(dni));
            this.datosDni.set(datos);
            this.notificacion.mostrar('DNI encontrado. Revisa tus datos.', 'success');
            return;
          } catch (error) {
            return {
              kind: 'dni',
              message: mensajeErrorApi(error),
              fieldTree: field.dni,
            };
          }
        },
      },
    },
  );

  readonly registroForm = form(
    this.registroModelo,
    (path) => {
      required(path.email, { message: 'Escribe tu correo electrónico.' });
      email(path.email, { message: 'Escribe un correo válido.' });

      required(path.password, { message: 'Crea una contraseña.' });
      minLength(path.password, 6, {
        message: 'La contraseña debe tener al menos 6 caracteres.',
      });

      required(path.confirmar, { message: 'Repite tu contraseña.' });
      validate(path.confirmar, ({ value, valueOf }) => {
        if (value() !== valueOf(path.password)) {
          return {
            kind: 'confirmacion',
            message: 'Las contraseñas no coinciden.',
          };
        }

        return null;
      });

      validate(path.acepto_datos, ({ value }) => {
        if (!value()) {
          return {
            kind: 'aceptoDatos',
            message: 'Debes aceptar el tratamiento de tus datos para continuar.',
          };
        }

        return null;
      });
    },
    {
      submission: {
        action: async (field) => {
          const datos = field().value();
          const dni = this.datosDni();

          if (!dni) {
            return {
              kind: 'dni',
              message: 'Primero valida tu DNI.',
            };
          }

          try {
            const resultado = await this.auth.registrar(
              datos.email.trim(),
              datos.password,
            );

            if (resultado.requiereConfirmacion) {
              this.requiereConfirmacion.set(true);
              return null;
            }

            await this.auth.crearPerfil(dni.dni, datos.acepto_datos);
            this.notificacion.mostrar('Tu cuenta fue creada correctamente.', 'success');
            await this.router.navigate(['/']);
            return null;
          } catch (error) {
            return {
              kind: 'registro',
              message:
                error instanceof HttpErrorResponse
                  ? mensajeErrorApi(error)
                  : mensajeErrorSupabase(error),
            };
          }
        },
      },
    },
  );

  cambiarDni(): void {
    this.datosDni.set(null);
    this.dniModelo.set({ dni: '' });
  }
}
