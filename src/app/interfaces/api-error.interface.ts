export interface ApiError {
  code: string;
  detail: string;
}

export type ApiErrorCode =
  | 'VALIDACION'
  | 'NO_ENCONTRADO'
  | 'CONFLICTO'
  | 'NO_AUTENTICADO'
  | 'SIN_PERMISO'
  | 'DNI_INVALIDO'
  | 'DNI_NO_ENCONTRADO'
  | 'SERVICIO_EXTERNO_NO_DISPONIBLE'
  | 'ERROR_INTERNO';
