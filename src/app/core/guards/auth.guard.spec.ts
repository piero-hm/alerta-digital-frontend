import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Rol } from '../../interfaces/auth.interface';
import { AuthService } from '../../services/auth.service';
import { authGuard } from './auth.guard';
import { perfilGuard } from './perfil.guard';
import { roleGuard } from './role.guard';

describe('guards de autenticación', () => {
  const autenticado = signal(false);
  const perfilCompleto = signal(false);
  const rol = signal<Rol | null>(null);

  let router: Router;

  beforeEach(() => {
    autenticado.set(false);
    perfilCompleto.set(false);
    rol.set(null);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { autenticado, perfilCompleto, rol },
        },
      ],
    });

    router = TestBed.inject(Router);
  });

  function ejecutar(guard: CanActivateFn) {
    return TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  it('authGuard envía al login cuando no hay sesión', () => {
    const resultado = ejecutar(authGuard);

    expect(resultado instanceof UrlTree).toBe(true);
    expect((resultado as UrlTree).toString()).toBe('/auth/login');
  });

  it('authGuard permite el acceso con sesión', () => {
    autenticado.set(true);

    expect(ejecutar(authGuard)).toBe(true);
  });

  it('perfilGuard envía a completar perfil cuando falta el perfil', () => {
    autenticado.set(true);

    const resultado = ejecutar(perfilGuard);

    expect(resultado instanceof UrlTree).toBe(true);
    expect((resultado as UrlTree).toString()).toBe('/auth/completar-perfil');
  });

  it('roleGuard niega el acceso a un rol no permitido', () => {
    autenticado.set(true);
    perfilCompleto.set(true);
    rol.set('ciudadano');

    const resultado = ejecutar(roleGuard(['admin']));

    expect(resultado instanceof UrlTree).toBe(true);
    expect((resultado as UrlTree).toString()).toBe('/no-autorizado');
  });

  it('roleGuard permite el acceso al rol permitido', () => {
    autenticado.set(true);
    perfilCompleto.set(true);
    rol.set('admin');

    expect(ejecutar(roleGuard(['admin']))).toBe(true);
  });

  it('el router está disponible para construir UrlTree', () => {
    expect(router.createUrlTree(['/']).toString()).toBe('/');
  });
});
