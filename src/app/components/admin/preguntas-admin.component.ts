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
  required,
  validate,
} from '@angular/forms/signals';

import {
  OpcionAdmin,
  OpcionAdminCreate,
  PreguntaAdmin,
  PreguntaAdminCreate,
} from '../../interfaces/admin.interface';
import { AdminService } from '../../services/admin.service';
import { NotificacionService } from '../../services/notificacion.service';
import { mensajeErrorApi } from '../../core/utils/errores';

interface PreguntaFormModel {
  enunciado: string;
  mensaje_simulado: string;
  explicacion: string;
  activa: boolean;
}

interface OpcionFormModel {
  texto: string;
  es_correcta: boolean;
}

@Component({
  selector: 'app-preguntas-admin',
  imports: [FormField, FormRoot],
  templateUrl: './preguntas-admin.component.html',
  styleUrl: './preguntas-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreguntasAdminComponent {
  private readonly adminService = inject(AdminService);
  private readonly notificacion = inject(NotificacionService);

  readonly temaId = input.required<number>();
  readonly preguntas = input<PreguntaAdmin[]>([]);
  readonly actualizado = output<void>();

  readonly preguntaEditando = signal<PreguntaAdmin | null>(null);
  readonly opcionPregunta = signal<PreguntaAdmin | null>(null);
  readonly opcionEditando = signal<OpcionAdmin | null>(null);

  readonly tituloPregunta = computed(() =>
    this.preguntaEditando()
      ? `Editar pregunta #${this.preguntaEditando()?.id}`
      : 'Agregar pregunta',
  );

  readonly tituloOpcion = computed(() =>
    this.opcionEditando()
      ? `Editar opción #${this.opcionEditando()?.id}`
      : 'Agregar opción',
  );

  readonly modeloPregunta = signal<PreguntaFormModel>(this.preguntaInicial());
  readonly modeloOpcion = signal<OpcionFormModel>(this.opcionInicial());

  readonly formPregunta = form(
    this.modeloPregunta,
    (path) => {
      required(path.enunciado, { message: 'Escribe el enunciado de la pregunta.' });
      maxLength(path.enunciado, 2000, { message: 'Máximo 2000 caracteres.' });
      validate(path.enunciado, ({ value }) => {
        if (!value().trim()) {
          return { kind: 'enunciadoVacio', message: 'Escribe el enunciado.' };
        }

        return null;
      });

      required(path.explicacion, {
        message: 'Escribe la explicación que verá el usuario al responder.',
      });
      maxLength(path.explicacion, 2000, { message: 'Máximo 2000 caracteres.' });
      validate(path.explicacion, ({ value }) => {
        if (!value().trim()) {
          return { kind: 'explicacionVacia', message: 'Escribe la explicación.' };
        }

        return null;
      });

      maxLength(path.mensaje_simulado, 1000, { message: 'Máximo 1000 caracteres.' });
    },
    {
      submission: {
        action: async (field) => {
          const datos = field().value();
          const cuerpo: PreguntaAdminCreate = {
            enunciado: datos.enunciado.trim(),
            mensaje_simulado: datos.mensaje_simulado.trim() || null,
            explicacion: datos.explicacion.trim(),
            activa: datos.activa,
          };

          try {
            const editando = this.preguntaEditando();

            if (editando) {
              await this.adminService.actualizarPregunta(editando.id, cuerpo);
            } else {
              await this.adminService.crearPregunta(this.temaId(), cuerpo);
            }

            this.notificacion.mostrar(
              editando ? 'Pregunta actualizada.' : 'Pregunta agregada.',
              'success',
            );
            this.preguntaEditando.set(null);
            field().reset(this.preguntaInicial());
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

  readonly formOpcion = form(
    this.modeloOpcion,
    (path) => {
      required(path.texto, { message: 'Escribe el texto de la opción.' });
      maxLength(path.texto, 300, { message: 'Máximo 300 caracteres.' });
      validate(path.texto, ({ value }) => {
        if (!value().trim()) {
          return { kind: 'textoVacio', message: 'Escribe el texto de la opción.' };
        }

        return null;
      });

      validate(path.es_correcta, ({ value }) => {
        if (!value()) {
          return null;
        }

        const pregunta = this.opcionPregunta();
        const editando = this.opcionEditando();
        const otraCorrecta = pregunta?.opciones.find(
          (opcion) => opcion.es_correcta && opcion.id !== editando?.id,
        );

        if (otraCorrecta) {
          return {
            kind: 'correctaExistente',
            message:
              'Esta pregunta ya tiene una opción correcta. Edita esa opción si necesitas cambiarla.',
          };
        }

        return null;
      });
    },
    {
      submission: {
        action: async (field) => {
          const pregunta = this.opcionPregunta();

          if (!pregunta) {
            return {
              kind: 'sinPregunta',
              message: 'Selecciona una pregunta antes de guardar la opción.',
            };
          }

          const datos = field().value();
          const cuerpo: OpcionAdminCreate = {
            texto: datos.texto.trim(),
            es_correcta: datos.es_correcta,
          };

          try {
            const editando = this.opcionEditando();

            if (editando) {
              await this.adminService.actualizarOpcion(editando.id, cuerpo);
            } else {
              await this.adminService.crearOpcion(pregunta.id, cuerpo);
            }

            this.notificacion.mostrar(
              editando ? 'Opción actualizada.' : 'Opción agregada.',
              'success',
            );
            this.cerrarOpcion();
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

  editarPregunta(pregunta: PreguntaAdmin): void {
    this.preguntaEditando.set(pregunta);
    this.modeloPregunta.set({
      enunciado: pregunta.enunciado,
      mensaje_simulado: pregunta.mensaje_simulado ?? '',
      explicacion: pregunta.explicacion,
      activa: pregunta.activa,
    });
  }

  nuevaPregunta(): void {
    this.preguntaEditando.set(null);
    this.modeloPregunta.set(this.preguntaInicial());
  }

  abrirCrearOpcion(pregunta: PreguntaAdmin): void {
    this.opcionPregunta.set(pregunta);
    this.opcionEditando.set(null);
    this.modeloOpcion.set(this.opcionInicial());
  }

  abrirEditarOpcion(pregunta: PreguntaAdmin, opcion: OpcionAdmin): void {
    this.opcionPregunta.set(pregunta);
    this.opcionEditando.set(opcion);
    this.modeloOpcion.set({
      texto: opcion.texto,
      es_correcta: opcion.es_correcta,
    });
  }

  cerrarOpcion(): void {
    this.opcionPregunta.set(null);
    this.opcionEditando.set(null);
    this.modeloOpcion.set(this.opcionInicial());
  }

  tieneCorrecta(pregunta: PreguntaAdmin): boolean {
    return pregunta.opciones.some((opcion) => opcion.es_correcta);
  }

  private preguntaInicial(): PreguntaFormModel {
    return {
      enunciado: '',
      mensaje_simulado: '',
      explicacion: '',
      activa: true,
    };
  }

  private opcionInicial(): OpcionFormModel {
    return {
      texto: '',
      es_correcta: false,
    };
  }
}
