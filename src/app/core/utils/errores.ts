import { HttpErrorResponse } from '@angular/common/http';

import { ApiError } from '../../interfaces/api-error.interface';

export function obtenerApiError(error: unknown): ApiError | null {
  if (!(error instanceof HttpErrorResponse)) {
    return null;
  }

  const cuerpo: unknown = error.error;

  if (
    typeof cuerpo === 'object' &&
    cuerpo !== null &&
    'code' in cuerpo &&
    'detail' in cuerpo &&
    typeof (cuerpo as { code: unknown }).code === 'string' &&
    typeof (cuerpo as { detail: unknown }).detail === 'string'
  ) {
    return {
      code: (cuerpo as { code: string }).code,
      detail: (cuerpo as { detail: string }).detail,
    };
  }

  return null;
}

export function esFaltaPerfil(error: unknown): boolean {
  const apiError = obtenerApiError(error);

  return apiError?.code === 'SIN_PERMISO' && apiError.detail.toLowerCase().includes('perfil');
}

export function mensajeErrorApi(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No pudimos conectarnos con el servidor. Revisa tu conexión e intenta nuevamente.';
    }

    const apiError = obtenerApiError(error);

    if (apiError) {
      if (apiError.code === 'ERROR_INTERNO') {
        return 'Ocurrió un error en el servidor. Intenta nuevamente en unos minutos.';
      }

      if (apiError.code === 'NO_AUTENTICADO') {
        return 'Tu sesión expiró. Vuelve a iniciar sesión.';
      }

      if (apiError.code === 'SERVICIO_EXTERNO_NO_DISPONIBLE') {
        return 'El servicio no está disponible en este momento. Intenta más tarde.';
      }

      return apiError.detail;
    }

    if (error.status === 404) {
      return 'No encontramos la información que buscabas.';
    }

    if (error.status === 401) {
      return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    }

    if (error.status === 403) {
      return 'No tienes permiso para realizar esta acción.';
    }

    if (error.status === 409) {
      return 'La información cambió mientras la revisabas. Actualiza e intenta de nuevo.';
    }

    if (error.status === 422) {
      return 'Revisa los datos ingresados e intenta nuevamente.';
    }

    if (error.status >= 500) {
      return 'Ocurrió un error en el servidor. Intenta nuevamente en unos minutos.';
    }
  }

  return 'No pudimos completar la acción. Intenta nuevamente.';
}

export function mensajeErrorSupabase(error: unknown): string {
  const mensaje =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : '';

  const normalizado = mensaje.toLowerCase();

  if (normalizado.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.';
  }

  if (normalizado.includes('user already registered')) {
    return 'Ya existe una cuenta con ese correo.';
  }

  if (normalizado.includes('email not confirmed')) {
    return 'Confirma tu correo antes de iniciar sesión.';
  }

  if (normalizado.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }

  if (normalizado.includes('invalid api key') || normalizado.includes('apikey')) {
    return 'La configuración de autenticación no es válida. Contacta al administrador.';
  }

  if (normalizado.includes('rate limit') || normalizado.includes('too many requests')) {
    return 'Demasiados intentos. Espera un momento e intenta de nuevo.';
  }

  return 'No pudimos completar la operación de autenticación. Intenta nuevamente.';
}
