import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
  maxLength,
  min,
  required,
  validate,
} from '@angular/forms/signals';

import {
  BloqueAdmin,
  BloqueAdminCreate,
} from '../../interfaces/admin.interface';
import { TipoBloque } from '../../interfaces/aprender.interface';
import { AdminService } from '../../services/admin.service';
import { NotificacionService } from '../../services/notificacion.service';
import { mensajeErrorApi } from '../../core/utils/errores';

interface BloqueFormModel {
  orden: number;
  tipo: TipoBloque;
  contenido: string;
  recurso_url: string;
}

@Component({
  selector: 'app-bloques-admin',
  imports: [FormField, FormRoot],
  templateUrl: './bloques-admin.component.html',
  styleUrl: './bloques-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BloquesAdminComponent {
  private readonly adminService = inject(AdminService);
  private readonly notificacion = inject(NotificacionService);

  readonly temaId = input.required<number>();
  readonly bloques = input<BloqueAdmin[]>([]);
  readonly actualizado = output<void>();

  readonly bloqueEditando = signal<BloqueAdmin | null>(null);

  readonly siguienteOrden = computed(() =>
    this.bloques().reduce((maximo, bloque) => Math.max(maximo, bloque.orden), 0) + 1,
  );

  readonly tituloFormulario = computed(() =>
    this.bloqueEditando()
      ? `Editar bloque #${this.bloqueEditando()?.id}`
      : 'Agregar bloque',
  );

  readonly modelo = signal<BloqueFormModel>(this.modeloInicial());

  readonly form = form(
    this.modelo,
    (path) => {
      min(path.orden, 1, { message: 'El orden debe ser mayor o igual a 1.' });

      validate(path.contenido, ({ value, valueOf }) => {
        const tipo = valueOf(path.tipo);

        if (
          (tipo === 'texto' || tipo === 'alerta' || tipo === 'lista') &&
          !value().trim()
        ) {
          return {
            kind: 'contenidoRequerido',
            message: 'Escribe el contenido del bloque.',
          };
        }

        return null;
      });

      maxLength(path.recurso_url, 500, {
        message: 'El recurso no puede superar 500 caracteres.',
      });
      validate(path.recurso_url, ({ value, valueOf }) => {
        const tipo = valueOf(path.tipo);
        const recurso = value().trim();

        if ((tipo === 'imagen' || tipo === 'video') && !recurso) {
          return {
            kind: 'recursoRequerido',
            message:
              tipo === 'video'
                ? 'Escribe el ID del video de YouTube.'
                : 'Escribe la dirección de la imagen.',
          };
        }

        if (tipo === 'video' && recurso && !/^[A-Za-z0-9_-]{11}$/.test(recurso)) {
          return {
            kind: 'videoInvalido',
            message: 'El ID del video de YouTube debe tener 11 caracteres.',
          };
        }

        if (tipo === 'imagen' && recurso) {
          try {
            const url = new URL(recurso);

            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
              return {
                kind: 'imagenInvalida',
                message: 'La imagen debe empezar con http:// o https://.',
              };
            }
          } catch {
            return {
              kind: 'imagenInvalida',
              message: 'Escribe una dirección de imagen válida.',
            };
          }
        }

        return null;
      });
    },
    {
      submission: {
        action: async (field) => {
          const datos = field().value();
          const cuerpo: BloqueAdminCreate = {
            orden: Number(datos.orden),
            tipo: datos.tipo,
            contenido: datos.contenido.trim() || null,
            recurso_url: datos.recurso_url.trim() || null,
          };

          try {
            const editando = this.bloqueEditando();

            if (editando) {
              await this.adminService.actualizarBloque(editando.id, cuerpo);
            } else {
              await this.adminService.crearBloque(this.temaId(), cuerpo);
            }

            this.notificacion.mostrar(
              editando ? 'Bloque actualizado.' : 'Bloque agregado.',
              'success',
            );
            this.bloqueEditando.set(null);
            field().reset(this.modeloInicial());
            this.actualizado.emit();
            return null;
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

  editar(bloque: BloqueAdmin): void {
    this.bloqueEditando.set(bloque);
    this.modelo.set({
      orden: bloque.orden,
      tipo: bloque.tipo,
      contenido: bloque.contenido ?? '',
      recurso_url: bloque.recurso_url ?? '',
    });
  }

  nuevo(): void {
    this.bloqueEditando.set(null);
    this.modelo.set(this.modeloInicial());
  }

  cancelarEdicion(): void {
    this.nuevo();
  }

  etiquetaTipo(tipo: TipoBloque): string {
    switch (tipo) {
      case 'imagen':
        return 'Imagen';
      case 'video':
        return 'Video';
      case 'alerta':
        return 'Alerta';
      case 'lista':
        return 'Lista';
      default:
        return 'Texto';
    }
  }

  requiereContenido(): boolean {
    const tipo = this.modelo().tipo;
    return tipo === 'texto' || tipo === 'alerta' || tipo === 'lista';
  }

  requiereRecurso(): boolean {
    const tipo = this.modelo().tipo;
    return tipo === 'imagen' || tipo === 'video';
  }

  private modeloInicial(): BloqueFormModel {
    return {
      orden: this.siguienteOrden(),
      tipo: 'texto',
      contenido: '',
      recurso_url: '',
    };
  }
}
