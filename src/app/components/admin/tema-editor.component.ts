import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
  maxLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  TemaAdminDetalle,
} from '../../interfaces/admin.interface';
import { PublicoObjetivo } from '../../interfaces/aprender.interface';
import { AdminService } from '../../services/admin.service';
import { NotificacionService } from '../../services/notificacion.service';
import { mensajeErrorApi } from '../../core/utils/errores';
import { EstadoPantallaComponent } from '../shared/estado-pantalla.component';
import { BloquesAdminComponent } from './bloques-admin.component';
import { PreguntasAdminComponent } from './preguntas-admin.component';

interface TemaFormModel {
  slug: string;
  titulo: string;
  resumen: string;
  publico_objetivo: PublicoObjetivo;
}

@Component({
  selector: 'app-tema-editor',
  imports: [
    FormField,
    FormRoot,
    RouterLink,
    EstadoPantallaComponent,
    BloquesAdminComponent,
    PreguntasAdminComponent,
  ],
  templateUrl: './tema-editor.component.html',
  styleUrl: './tema-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemaEditorComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly notificacion = inject(NotificacionService);

  readonly id = input.required<string>();

  readonly temaId = computed(() => Number(this.id()));
  readonly detalle = signal<TemaAdminDetalle | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly cambiandoPublicacion = signal(false);

  readonly modelo = signal<TemaFormModel>({
    slug: '',
    titulo: '',
    resumen: '',
    publico_objetivo: 'todos',
  });

  readonly form = form(
    this.modelo,
    (path) => {
      required(path.slug, { message: 'Escribe un identificador para el tema.' });
      maxLength(path.slug, 120, { message: 'Máximo 120 caracteres.' });
      pattern(path.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'Usa minúsculas, números y guiones. Ejemplo: phishing-que-es.',
      });

      required(path.titulo, { message: 'Escribe el título del tema.' });
      maxLength(path.titulo, 200, { message: 'Máximo 200 caracteres.' });

      validate(path.resumen, ({ value }) => {
        if (value().length > 500) {
          return { kind: 'resumenLargo', message: 'Máximo 500 caracteres.' };
        }

        return null;
      });
    },
    {
      submission: {
        action: async (field) => {
          const datos = field().value();

          try {
            const tema = await firstValueFrom(
              this.adminService.actualizarTema(this.temaId(), {
                slug: datos.slug.trim(),
                titulo: datos.titulo.trim(),
                resumen: datos.resumen.trim() || null,
                publico_objetivo: datos.publico_objetivo,
              }),
            );

            this.detalle.update((detalle) =>
              detalle ? { ...detalle, ...tema } : detalle,
            );
            this.notificacion.mostrar('Tema actualizado.', 'success');
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

  ngOnInit(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const detalle = await firstValueFrom(
        this.adminService.obtenerTema(this.temaId()),
      );

      this.detalle.set(detalle);
      this.modelo.set({
        slug: detalle.slug,
        titulo: detalle.titulo,
        resumen: detalle.resumen ?? '',
        publico_objetivo: detalle.publico_objetivo,
      });
    } catch (error) {
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.cargando.set(false);
    }
  }

  async recargarContenido(): Promise<void> {
    try {
      const detalle = await firstValueFrom(
        this.adminService.obtenerTema(this.temaId()),
      );

      this.detalle.set(detalle);
    } catch (error) {
      this.notificacion.mostrar(mensajeErrorApi(error), 'danger');
    }
  }

  async cambiarPublicacion(): Promise<void> {
    const tema = this.detalle();

    if (!tema) {
      return;
    }

    this.cambiandoPublicacion.set(true);

    try {
      const actualizado = await firstValueFrom(
        this.adminService.cambiarPublicacion(tema.id, !tema.publicado),
      );

      this.detalle.update((detalle) =>
        detalle ? { ...detalle, publicado: actualizado.publicado } : detalle,
      );
      this.notificacion.mostrar(
        actualizado.publicado
          ? 'El tema ahora es visible para los usuarios.'
          : 'El tema dejó de ser visible para los usuarios.',
        'success',
      );
    } catch (error) {
      this.notificacion.mostrar(mensajeErrorApi(error), 'danger');
    } finally {
      this.cambiandoPublicacion.set(false);
    }
  }

  etiquetaPublico(publico: PublicoObjetivo): string {
    switch (publico) {
      case 'adulto_mayor':
        return 'Adultos mayores';
      case 'joven':
        return 'Jóvenes';
      default:
        return 'Todos';
    }
  }
}
