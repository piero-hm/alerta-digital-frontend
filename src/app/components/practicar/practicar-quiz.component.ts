import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  PreguntaPractica,
  RespuestaOut,
} from '../../interfaces/practicar.interface';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { PracticarService } from '../../services/practicar.service';
import {
  esFaltaPerfil,
  mensajeErrorApi,
} from '../../core/utils/errores';
import { EstadoPantallaComponent } from '../shared/estado-pantalla.component';
import { IconComponent } from '../../shared/ui/icon.component';
import { IconTileComponent } from '../../shared/ui/icon-tile.component';
import { ButtonComponent } from '../../shared/ui/button.component';

@Component({
  selector: 'app-practicar-quiz',
  imports: [RouterLink, EstadoPantallaComponent, IconComponent, IconTileComponent, ButtonComponent],
  templateUrl: './practicar-quiz.component.html',
  styleUrl: './practicar-quiz.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticarQuizComponent implements OnInit {
  private readonly practicarService = inject(PracticarService);
  private readonly notificacion = inject(NotificacionService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  readonly slug = input.required<string>();

  readonly preguntas = signal<PreguntaPractica[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly indice = signal(0);
  readonly seleccion = signal<number | null>(null);
  readonly respuesta = signal<RespuestaOut | null>(null);
  readonly enviando = signal(false);
  readonly finalizado = signal(false);
  readonly correctas = signal(0);

  readonly preguntaActual = computed(() => this.preguntas()[this.indice()] ?? null);

  readonly letras = ['A', 'B', 'C', 'D', 'E'];

  readonly segmentos = computed(() => Array.from({ length: this.total() }, (_, i) => i));

  readonly respuestasCorrectas = signal<boolean[]>([]);

  readonly total = computed(() => this.preguntas().length);

  readonly porcentajeAvance = computed(() => {
    const total = this.total();

    if (total === 0) {
      return 0;
    }

    return Math.round(((this.indice() + (this.respuesta() ? 1 : 0)) / total) * 100);
  });

  readonly porcentajeFinal = computed(() => {
    const total = this.total();

    return total === 0 ? 0 : Math.round((this.correctas() / total) * 100);
  });

  ngOnInit(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const preguntas = await firstValueFrom(
        this.practicarService.obtenerPreguntas(this.slug()),
      );
      this.preguntas.set(preguntas);
      this.reiniciar();
    } catch (error) {
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.cargando.set(false);
    }
  }

  seleccionar(opcionId: number): void {
    if (this.respuesta() || this.enviando()) {
      return;
    }

    this.seleccion.set(opcionId);
  }

  async responder(): Promise<void> {
    const opcionId = this.seleccion();

    if (!opcionId) {
      this.notificacion.mostrar('Selecciona una respuesta.', 'warning');
      return;
    }

    if (!this.auth.autenticado()) {
      this.notificacion.mostrar(
        'Inicia sesión para responder y guardar tu progreso.',
        'info',
      );
      return;
    }

    if (!this.auth.perfilCompleto()) {
      await this.router.navigate(['/auth/completar-perfil']);
      return;
    }

    this.enviando.set(true);

    try {
      const respuesta = await firstValueFrom(
        this.practicarService.responder(opcionId),
      );
      this.respuesta.set(respuesta);

      if (respuesta.es_correcta) {
        this.correctas.update((valor) => valor + 1);
      }

      this.respuestasCorrectas.update((arr) => {
        const copia = [...arr];
        copia[this.indice()] = respuesta.es_correcta;
        return copia;
      });
    } catch (error) {
      if (esFaltaPerfil(error)) {
        await this.router.navigate(['/auth/completar-perfil']);
        return;
      }

      if (error instanceof HttpErrorResponse && error.status === 401) {
        await this.router.navigate(['/auth/login']);
        return;
      }

      this.notificacion.mostrar(mensajeErrorApi(error), 'danger');
    } finally {
      this.enviando.set(false);
    }
  }

  siguiente(): void {
    if (this.indice() + 1 >= this.total()) {
      this.finalizado.set(true);
      return;
    }

    this.indice.update((valor) => valor + 1);
    this.seleccion.set(null);
    this.respuesta.set(null);
  }

  reiniciar(): void {
    this.indice.set(0);
    this.seleccion.set(null);
    this.respuesta.set(null);
    this.finalizado.set(false);
    this.correctas.set(0);
    this.respuestasCorrectas.set([]);
  }

  claseOpcion(opcionId: number): string {
    const respuesta = this.respuesta();
    const base = 'list-group-item list-group-item-action py-3';

    if (!respuesta) {
      return this.seleccion() === opcionId ? `${base} active` : base;
    }

    if (this.seleccion() !== opcionId) {
      return base;
    }

    return respuesta.es_correcta
      ? `${base} list-group-item-success`
      : `${base} list-group-item-danger`;
  }
}
