import {
  ChangeDetectionStrategy,
  Component,
  inject,
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
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  TemaAdmin,
} from '../../interfaces/admin.interface';
import { PublicoObjetivo } from '../../interfaces/aprender.interface';
import { AdminService } from '../../services/admin.service';
import { NotificacionService } from '../../services/notificacion.service';
import { mensajeErrorApi } from '../../core/utils/errores';
import { EstadoPantallaComponent } from '../shared/estado-pantalla.component';

interface TemaFormModel {
  slug: string;
  titulo: string;
  resumen: string;
  publico_objetivo: PublicoObjetivo;
}

@Component({
  selector: 'app-temas-admin',
  imports: [FormField, FormRoot, RouterLink, EstadoPantallaComponent],
  templateUrl: './temas-admin.component.html',
  styleUrl: './temas-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemasAdminComponent {
  private readonly adminService = inject(AdminService);
  private readonly notificacion = inject(NotificacionService);
  private readonly router = inject(Router);

  readonly temas = signal<TemaAdmin[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly creando = signal(false);
  readonly cambiandoId = signal<number | null>(null);

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
              this.adminService.crearTema({
                slug: datos.slug.trim(),
                titulo: datos.titulo.trim(),
                resumen: datos.resumen.trim() || null,
                publico_objetivo: datos.publico_objetivo,
              }),
            );

            this.notificacion.mostrar(
              'Tema creado. Ahora agrega sus bloques y preguntas.',
              'success',
            );
            field().reset({
              slug: '',
              titulo: '',
              resumen: '',
              publico_objetivo: 'todos',
            });
            this.creando.set(false);
            await this.router.navigate(['/admin/temas', tema.id]);
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

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const temas = await firstValueFrom(this.adminService.listarTemas());
      this.temas.set(temas);
    } catch (error) {
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.cargando.set(false);
    }
  }

  async cambiarPublicacion(tema: TemaAdmin): Promise<void> {
    this.cambiandoId.set(tema.id);

    try {
      const actualizado = await firstValueFrom(
        this.adminService.cambiarPublicacion(tema.id, !tema.publicado),
      );

      this.temas.update((temas) =>
        temas.map((item) => (item.id === actualizado.id ? actualizado : item)),
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
      this.cambiandoId.set(null);
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
