import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
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
import { mensajeErrorApi } from '../../core/utils/errores';

interface DniFormModel {
  dni: string;
}

interface PerfilFormModel {
  acepto_datos: boolean;
}

@Component({
  selector: 'app-completar-perfil',
  imports: [FormField, FormRoot, RouterLink],
  templateUrl: './completar-perfil.component.html',
  styleUrl: './completar-perfil.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompletarPerfilComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly dniService = inject(DniService);
  private readonly router = inject(Router);
  private readonly notificacion = inject(NotificacionService);

  readonly dniModelo = signal<DniFormModel>({ dni: '' });
  readonly perfilModelo = signal<PerfilFormModel>({ acepto_datos: false });
  readonly datosDni = signal<Dni | null>(null);

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
            return null;
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

  readonly perfilForm = form(
    this.perfilModelo,
    (path) => {
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
          const dni = this.datosDni();

          if (!dni) {
            return {
              kind: 'dni',
              message: 'Primero valida tu DNI.',
            };
          }

          try {
            await this.auth.crearPerfil(dni.dni, field().value().acepto_datos);
            this.notificacion.mostrar('Tu perfil fue creado correctamente.', 'success');
            await this.router.navigate(['/']);
            return null;
          } catch (error) {
            return {
              kind: 'perfil',
              message: mensajeErrorApi(error),
            };
          }
        },
      },
    },
  );

  ngOnInit(): void {
    if (this.auth.perfilCompleto()) {
      void this.router.navigate(['/']);
    }
  }

  cambiarDni(): void {
    this.datosDni.set(null);
    this.dniModelo.set({ dni: '' });
  }
}
