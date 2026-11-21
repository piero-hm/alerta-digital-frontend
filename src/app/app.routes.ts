import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { perfilGuard } from './core/guards/perfil.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Inicio | Alerta Digital',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'aprender',
    title: 'Aprender | Alerta Digital',
    loadComponent: () =>
      import('./components/aprender/temas-lista.component').then(
        (m) => m.TemasListaComponent,
      ),
  },
  {
    path: 'aprender/:slug',
    title: 'Tema | Alerta Digital',
    loadComponent: () =>
      import('./components/aprender/tema-detalle.component').then(
        (m) => m.TemaDetalleComponent,
      ),
  },
  {
    path: 'practicar',
    title: 'Practicar | Alerta Digital',
    loadComponent: () =>
      import('./components/practicar/practicar-lista.component').then(
        (m) => m.PracticarListaComponent,
      ),
  },
  {
    path: 'practicar/:slug',
    title: 'Practicar tema | Alerta Digital',
    loadComponent: () =>
      import('./components/practicar/practicar-quiz.component').then(
        (m) => m.PracticarQuizComponent,
      ),
  },
  {
    path: 'verificar-enlace',
    title: 'Verificar enlace | Alerta Digital',
    loadComponent: () =>
      import('./components/practicar/verificar-enlace.component').then(
        (m) => m.VerificarEnlaceComponent,
      ),
  },
  {
    path: 'alertas',
    title: 'Alertas públicas | Alerta Digital',
    loadComponent: () =>
      import('./components/reportar/alertas.component').then(
        (m) => m.AlertasComponent,
      ),
  },
  {
    path: 'reportar',
    title: 'Reportar estafa | Alerta Digital',
    canActivate: [authGuard, perfilGuard],
    loadComponent: () =>
      import('./components/reportar/reporte-form.component').then(
        (m) => m.ReporteFormComponent,
      ),
  },
  {
    path: 'mis-reportes',
    title: 'Mis reportes | Alerta Digital',
    canActivate: [authGuard, perfilGuard],
    loadComponent: () =>
      import('./components/reportar/mis-reportes.component').then(
        (m) => m.MisReportesComponent,
      ),
  },
  {
    path: 'moderacion',
    title: 'Moderación | Alerta Digital',
    canActivate: [roleGuard(['moderador', 'admin'])],
    loadComponent: () =>
      import('./components/moderacion/reportes-pendientes.component').then(
        (m) => m.ReportesPendientesComponent,
      ),
  },
  {
    path: 'admin/temas',
    title: 'Contenido | Alerta Digital',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () =>
      import('./components/admin/temas-admin.component').then(
        (m) => m.TemasAdminComponent,
      ),
  },
  {
    path: 'admin/temas/:id',
    title: 'Editar tema | Alerta Digital',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () =>
      import('./components/admin/tema-editor.component').then(
        (m) => m.TemaEditorComponent,
      ),
  },
  {
    path: 'auth/login',
    title: 'Iniciar sesión | Alerta Digital',
    loadComponent: () =>
      import('./components/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/registro',
    title: 'Crear cuenta | Alerta Digital',
    loadComponent: () =>
      import('./components/auth/registro.component').then(
        (m) => m.RegistroComponent,
      ),
  },
  {
    path: 'auth/completar-perfil',
    title: 'Completar perfil | Alerta Digital',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/auth/completar-perfil.component').then(
        (m) => m.CompletarPerfilComponent,
      ),
  },
  {
    path: 'perfil',
    title: 'Mi perfil | Alerta Digital',
    canActivate: [authGuard, perfilGuard],
    loadComponent: () =>
      import('./components/auth/perfil.component').then(
        (m) => m.PerfilComponent,
      ),
  },
  {
    path: 'no-autorizado',
    title: 'Sin acceso | Alerta Digital',
    loadComponent: () =>
      import('./components/shared/no-autorizado.component').then(
        (m) => m.NoAutorizadoComponent,
      ),
  },
  {
    path: 'guia-de-estilo',
    title: 'Guía de estilo | Alerta Digital',
    loadComponent: () =>
      import('./components/dev/guia-de-estilo.component').then(
        (m) => m.GuiaDeEstiloComponent,
      ),
  },
  {
    path: 'nosotros',
    title: 'Nosotros | Alerta Digital',
    loadComponent: () =>
      import('./components/estaticas/nosotros.component').then(
        (m) => m.NosotrosComponent,
      ),
  },
  {
    path: 'privacidad',
    title: 'Privacidad | Alerta Digital',
    loadComponent: () =>
      import('./components/estaticas/privacidad.component').then(
        (m) => m.PrivacidadComponent,
      ),
  },
  {
    path: 'terminos',
    title: 'Términos | Alerta Digital',
    loadComponent: () =>
      import('./components/estaticas/terminos.component').then(
        (m) => m.TerminosComponent,
      ),
  },
  {
    path: 'accesibilidad',
    title: 'Accesibilidad | Alerta Digital',
    loadComponent: () =>
      import('./components/estaticas/accesibilidad.component').then(
        (m) => m.AccesibilidadComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
