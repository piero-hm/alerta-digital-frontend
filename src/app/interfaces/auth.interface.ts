export type Rol = 'ciudadano' | 'moderador' | 'admin';

export interface Dni {
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
}

export interface Perfil {
  id: string;
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  email: string;
  rol: Rol;
  activo: boolean;
  acepto_datos_en: string;
  creado_en: string;
}

export interface PerfilCreate {
  dni: string;
  acepto_datos: boolean;
}

export interface RegistroResultado {
  requiereConfirmacion: boolean;
}
