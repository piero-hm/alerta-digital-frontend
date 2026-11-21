import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { LayoutService } from '../../shared/services/layout.service';
import { IconComponent } from '../../shared/ui/icon.component';
import { IconTileComponent } from '../../shared/ui/icon-tile.component';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, IconComponent, IconTileComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly layout = inject(LayoutService);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.layout.sidebarMovilAbierto()) {
      this.layout.cerrarMovil();
    }
  }

  cerrarSiMovil(): void {
    if (this.layout.sidebarMovilAbierto()) {
      this.layout.cerrarMovil();
    }
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.layout.cerrarMovil();
  }
}