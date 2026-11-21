import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { IconComponent } from '../../shared/ui/icon.component';
import { IconTileComponent } from '../../shared/ui/icon-tile.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field.component';
import { StepperComponent } from '../../shared/ui/stepper.component';
import { TooltipComponent } from '../../shared/ui/tooltip.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state.component';
import { SkeletonComponent } from '../../shared/ui/skeleton.component';
import { ProgressBarComponent } from '../../shared/ui/progress-bar.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header.component';

@Component({
  selector: 'app-guia-de-estilo',
  standalone: true,
  imports: [
    IconComponent,
    IconTileComponent,
    ButtonComponent,
    FormFieldComponent,
    StepperComponent,
    TooltipComponent,
    KpiCardComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    SkeletonComponent,
    ProgressBarComponent,
    SectionHeaderComponent,
  ],
  templateUrl: './guia-de-estilo.component.html',
  styleUrl: './guia-de-estilo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuiaDeEstiloComponent {
  readonly stepperActual = signal(1);
  readonly dniValor = signal('');

  readonly iconos = [
    'inicio', 'aprender', 'practicar', 'reportar', 'verificar-enlace', 'alertas',
    'dashboard', 'moderacion', 'admin', 'usuario', 'cerrar-sesion', 'candado',
    'menu', 'colapsar', 'expandir', 'buscar', 'escudo', 'advertencia', 'exito',
    'error', 'ayuda', 'tema-oscuro', 'tema-claro', 'dni', 'enlace-externo', 'volver-arriba',
  ];
}