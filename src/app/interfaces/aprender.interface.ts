export type PublicoObjetivo = 'todos' | 'adulto_mayor' | 'joven';
export type TipoBloque = 'texto' | 'imagen' | 'video' | 'alerta' | 'lista';

export interface TemaResumen {
  id: number;
  slug: string;
  titulo: string;
  resumen: string | null;
  publico_objetivo: PublicoObjetivo;
}

export interface Bloque {
  id: number;
  orden: number;
  tipo: TipoBloque;
  contenido: string | null;
  recurso_url: string | null;
}

export interface TemaDetalle extends TemaResumen {
  bloques: Bloque[];
}
