export type ResultadoEnlace = 'seguro' | 'sospechoso' | 'peligroso';

export interface OpcionPregunta {
  id: number;
  texto: string;
}

export interface PreguntaPractica {
  id: number;
  enunciado: string;
  mensaje_simulado: string | null;
  opciones: OpcionPregunta[];
}

export interface RespuestaCreate {
  opcion_id: number;
}

export interface RespuestaOut {
  es_correcta: boolean;
  explicacion: string;
}

export interface ProgresoTema {
  tema_id: number;
  slug: string;
  titulo: string;
  total_preguntas: number;
  correctas: number;
  porcentaje: number;
  completado: boolean;
}

export interface EnlaceCreate {
  url: string;
}

export interface EnlaceOut {
  resultado: ResultadoEnlace;
}
