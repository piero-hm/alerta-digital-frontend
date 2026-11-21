import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

export const perfilGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.autenticado()) {
    return router.createUrlTree(['/auth/login']);
  }

  return auth.perfilCompleto()
    ? true
    : router.createUrlTree(['/auth/completar-perfil']);
};
