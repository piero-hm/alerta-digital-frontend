import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from '@angular/core';

const ICON_MAP: Record<string, string> = {
  'inicio': '\u{f02dc}',
  'aprender': '\u{f0474}',
  'practicar': '\u{f04fe}',
  'reportar': '\u{f00e6}',
  'verificar-enlace': '\u{f0d33}',
  'alertas': '\u{f0d59}',
  'dashboard': '\u{f056e}',
  'moderacion': '\u{f088f}',
  'admin': '\u{f0493}',
  'ajustes': '\u{f0493}',
  'usuario': '\u{f0004}',
  'perfil': '\u{f0004}',
  'cerrar-sesion': '\u{f0343}',
  'crear-cuenta': '\u{f0014}',
  'iniciar-sesion': '\u{f0342}',
  'candado': '\u{f033e}',
  'candado-abierto': '\u{f0fc6}',
  'menu': '\u{f035c}',
  'colapsar': '\u{f0141}',
  'expandir': '\u{f0142}',
  'cerrar': '\u{f0156}',
  'buscar': '\u{f0349}',
  'flecha-der': '\u{f0054}',
  'flecha-izq': '\u{f004d}',
  'flecha-arr': '\u{f005d}',
  'flecha-aba': '\u{f0045}',
  'editar': '\u{f03eb}',
  'eliminar': '\u{f01b4}',
  'escudo': '\u{f0498}',
  'advertencia': '\u{f0026}',
  'exito': '\u{f05e0}',
  'error': '\u{f0159}',
  'ayuda': '\u{f02d7}',
  'info': '\u{f02fc}',
  'tema-oscuro': '\u{f0f62}',
  'tema-claro': '\u{f0599}',
  'fuente-grande': '\u{f09f4}',
  'fuente-pequeño': '\u{f09f3}',
  'mapa': '\u{f034d}',
  'departamento': '\u{f034e}',
  'dinero': '\u{f01c1}',
  'calendario': '\u{f00ed}',
  'whatsapp': '\u{f05a3}',
  'telefono': '\u{f03f2}',
  'sms': '\u{f0369}',
  'correo': '\u{f01ee}',
  'web': '\u{f059f}',
  'policia': '\u{f1167}',
  'sbs': '\u{f0070}',
  'indecopi': '\u{f05d1}',
  'escudo-alerta': '\u{f0ecc}',
  'escudo-check': '\u{f0565}',
  'check': '\u{f05e0}',
  'copia': '\u{f018f}',
  'compartir': '\u{f0497}',
  'cargar': '\u{f0453}',
  'estrella': '\u{f04ce}',
  'corazon': '\u{f02d1}',
  'cuentaregresiva': '\u{f13ab}',
  'trofeo': '\u{f0538}',
  'dni': '\u{f0fc0}',
  'enlace-externo': '\u{f03cc}',
  'volver-arriba': '\u{f005d}',
  'subir': '\u{f005d}',
};

@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="ad-icon"
      [style.width.px]="size"
      [style.height.px]="size"
      [style.font-size.px]="size"
      [style.line-height]="1"
      [attr.aria-hidden]="label ? null : 'true'"
      [attr.aria-label]="label ?? null"
      [attr.role]="label ? 'img' : null"
      [title]="label ?? null"
    >{{ glifo }}</span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    .ad-icon {
      overflow: visible;
      font-family: 'Symbols Nerd Font', 'Nerd Fonts', sans-serif;
      font-style: normal;
      font-weight: normal;
      font-variant: normal;
      text-rendering: auto;
      -webkit-font-smoothing: antialiased;
      color: currentColor;
      user-select: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      line-height: 1;
    }
  `],
})
export class IconComponent implements OnChanges {
  @Input() name: string = 'escudo';
  @Input() size: number = 20;
  @Input() label?: string;

  glifo: string = '';

  ngOnChanges(): void {
    this.glifo = ICON_MAP[this.name] ?? '?';
  }
}