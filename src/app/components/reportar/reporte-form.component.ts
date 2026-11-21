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
  max,
  maxLength,
  min,
  minLength,
  required,
  validate,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Catalogos } from '../../interfaces/catalogos.interface';
import { AuthService } from '../../services/auth.service';
import { CatalogosService } from '../../services/catalogos.service';
import { NotificacionService } from '../../services/notificacion.service';
import { ReportarService } from '../../services/reportar.service';
import {
  esFaltaPerfil,
  mensajeErrorApi,
} from '../../core/utils/errores';

interface ReporteFormModel {
  tipo_fraude_id: string;
  canal_id: string;
  departamento_id: string;
  descripcion: string;
  monto_afectado: number;
  fecha_incidente: string;
  evidencia_url: string;
}

function fechaLocalHoy(): string {
  const ahora = new Date();
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-reporte-form',
  imports: [FormField, FormRoot, RouterLink],
  templateUrl: './reporte-form.component.html',
  styleUrl: './reporte-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReporteFormComponent {
  private readonly reportarService = inject(ReportarService);
  private readonly catalogosService = inject(CatalogosService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificacion = inject(NotificacionService);

  readonly catalogos = signal<Catalogos | null>(null);
  readonly cargandoCatalogos = signal(true);
  readonly errorCatalogos = signal<string | null>(null);
  readonly puedeReportar = computed(() => this.auth.rol() === 'ciudadano');

  readonly modelo = signal<ReporteFormModel>({
    tipo_fraude_id: '',
    canal_id: '',
    departamento_id: '',
    descripcion: '',
    monto_afectado: 0,
    fecha_incidente: fechaLocalHoy(),
    evidencia_url: '',
  });

  readonly form = form(
    this.modelo,
    (path) => {
      validate(path.tipo_fraude_id, ({ value }) => {
        if (Number(value()) < 1) {
          return {
            kind: 'tipoFraude',
            message: 'Selecciona el tipo de fraude.',
          };
        }

        return null;
      });
      validate(path.canal_id, ({ value }) => {
        if (Number(value()) < 1) {
          return { kind: 'canal', message: 'Selecciona el canal.' };
        }

        return null;
      });
      validate(path.departamento_id, ({ value }) => {
        if (Number(value()) < 1) {
          return {
            kind: 'departamento',
            message: 'Selecciona el departamento.',
          };
        }

        return null;
      });

      required(path.descripcion, { message: 'Describe lo que pasó.' });
      minLength(path.descripcion, 20, { message: 'Mínimo 20 caracteres.' });
      maxLength(path.descripcion, 3000, { message: 'Máximo 3000 caracteres.' });

      min(path.monto_afectado, 0, { message: 'El monto no puede ser negativo.' });
      max(path.monto_afectado, 9999999999.99, {
        message: 'El monto es demasiado alto.',
      });

      required(path.fecha_incidente, {
        message: 'Indica la fecha del incidente.',
      });
      validate(path.fecha_incidente, ({ value }) => {
        const fecha = value();

        if (fecha && fecha > fechaLocalHoy()) {
          return {
            kind: 'fechaFutura',
            message: 'La fecha no puede ser futura.',
          };
        }

        return null;
      });

      maxLength(path.evidencia_url, 500, {
        message: 'El enlace no puede superar 500 caracteres.',
      });
      validate(path.evidencia_url, ({ value }) => {
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
            message: 'Escribe un enlace válido o déjalo vacío.',
          };
        }

        return null;
      });
    },
    {
      submission: {
        action: async (field) => {
          const datos = field().value();

          if (!this.puedeReportar()) {
            return {
              kind: 'permiso',
              message:
                'Solo las cuentas con rol ciudadano pueden registrar reportes.',
            };
          }

          try {
            await firstValueFrom(
              this.reportarService.crear({
                tipo_fraude_id: Number(datos.tipo_fraude_id),
                canal_id: Number(datos.canal_id),
                departamento_id: Number(datos.departamento_id),
                descripcion: datos.descripcion.trim(),
                monto_afectado: datos.monto_afectado || 0,
                fecha_incidente: datos.fecha_incidente,
                evidencia_url: datos.evidencia_url.trim() || null,
              }),
            );

            this.notificacion.mostrar(
              'Tu reporte fue enviado. Gracias por ayudar a otras personas.',
              'success',
            );
            await this.router.navigate(['/mis-reportes']);
            return null;
          } catch (error) {
            if (esFaltaPerfil(error)) {
              await this.router.navigate(['/auth/completar-perfil']);
              return null;
            }

            return {
              kind: 'servidor',
              message: mensajeErrorApi(error),
            };
          }
        },
      },
    },
  );

  constructor() {
    void this.cargarCatalogos();
  }

  async cargarCatalogos(): Promise<void> {
    this.cargandoCatalogos.set(true);
    this.errorCatalogos.set(null);

    try {
      const catalogos = await firstValueFrom(this.catalogosService.obtener());
      this.catalogos.set(catalogos);
    } catch (error) {
      this.errorCatalogos.set(mensajeErrorApi(error));
    } finally {
      this.cargandoCatalogos.set(false);
    }
  }
}
