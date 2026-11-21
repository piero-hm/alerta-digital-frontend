import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Rol } from '../../interfaces/auth.interface';
import { AuthService } from '../../services/auth.service';

export const roleGuard = (roles: Rol[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.autenticado()) {
    return router.createUrlTree(['/auth/login']);
  }

  if (!auth.perfilCompleto()) {
    return router.createUrlTree(['/auth/completar-perfil']);
  }

  const rol = auth.rol();

  if (!rol || !roles.includes(rol)) {
    return router.createUrlTree(['/no-autorizado']);
  }

  return true;
};
