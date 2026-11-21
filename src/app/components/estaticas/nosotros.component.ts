import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-xxl py-4" style="max-width: 900px;">
      <h1>Nosotros</h1>
      <p class="lead">Alerta Digital es una plataforma educativa para reconocer y evitar estafas en línea.</p>

      <section id="mision" class="mt-4">
        <h2>Misión</h2>
        <p>Proteger a las personas, en especial a adultos mayores y nuevos usuarios digitales, enseñándoles con ejemplos reales a reconocer y evitar estafas en línea, y facilitando que reporten los intentos de fraude que reciben.</p>
      </section>

      <section id="vision" class="mt-4">
        <h2>Visión</h2>
        <p>Ser una comunidad digital donde ninguna persona caiga en estafas por falta de información, con datos abiertos y alertas que se comparten para cuidarnos entre todos.</p>
      </section>

      <section class="mt-4">
        <h2>Valores</h2>
        <p>Claridad, empatía, accesibilidad, privacidad y colaboración.</p>
      </section>

      <section class="mt-4">
        <h2>Sobre el proyecto</h2>
        <p>Proyecto académico con marcadores [NOMBRE DE LA UNIVERSIDAD], [CURSO], [INTEGRANTES] y [CONTACTO].</p>
      </section>

      <section id="faq" class="mt-4">
        <h2>Preguntas frecuentes</h2>
        <p>[COMPLETAR] Agrega aquí las preguntas más comunes.</p>
      </section>

      <section id="contacto" class="mt-4">
        <h2>Contacto</h2>
        <p>[COMPLETAR] Agrega aquí los datos de contacto.</p>
      </section>
    </div>
  `,
})
export class NosotrosComponent {}