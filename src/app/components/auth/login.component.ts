import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email,
  form,
  minLength,
  required,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import {
  mensajeErrorApi,
  mensajeErrorSupabase,
} from '../../core/utils/errores';
import { FormFieldComponent } from '../../shared/ui/form-field.component';
import { ButtonComponent } from '../../shared/ui/button.component';

interface LoginFormModel {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot, RouterLink, FormFieldComponent, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificacion = inject(NotificacionService);

  readonly modelo = signal<LoginFormModel>({ email: '', password: '' });

  readonly form = form(
    this.modelo,
    (path) => {
      required(path.email, { message: 'Escribe tu correo electrónico.' });
      email(path.email, { message: 'Escribe un correo válido.' });
      required(path.password, { message: 'Escribe tu contraseña.' });
      minLength(path.password, 6, {
        message: 'La contraseña debe tener al menos 6 caracteres.',
      });
    },
    {
      submission: {
        action: async (field) => {
          const datos = field().value();

          try {
            await this.auth.login(datos.email.trim(), datos.password);

            if (!this.auth.perfilCompleto()) {
              this.notificacion.mostrar(
                'Debes completar tu perfil para continuar.',
                'info',
              );
              await this.router.navigate(['/auth/completar-perfil']);
              return null;
            }

            this.notificacion.mostrar('Bienvenido de vuelta.', 'success');
            await this.router.navigate(['/']);
            return null;
          } catch (error) {
            return {
              kind: 'autenticacion',
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
}
