import { EstadoReporte } from './reportar.interface';
import { PublicoObjetivo, TipoBloque } from './aprender.interface';

export interface ReporteAdmin {
  id: number;
  usuario_id: string;
  email: string;
  tipo_fraude: string;
  canal: string;
  departamento: string;
  descripcion: string;
  monto_afectado: number;
  fecha_incidente: string;
  evidencia_url: string | null;
  estado: EstadoReporte;
  creado_en: string;
}

export interface EstadoReporteUpdate {
  estado: 'validado' | 'rechazado';
}

export interface TemaAdmin {
  id: number;
  slug: string;
  titulo: string;
  resumen: string | null;
  publico_objetivo: PublicoObjetivo;
  publicado: boolean;
}

export interface TemaAdminCreate {
  slug: string;
  titulo: string;
  resumen: string | null;
  publico_objetivo: PublicoObjetivo;
}

export interface TemaAdminUpdate {
  slug?: string;
  titulo?: string;
  resumen?: string | null;
  publico_objetivo?: PublicoObjetivo;
}

export interface PublicacionUpdate {
  publicado: boolean;
}

export interface BloqueAdmin {
  id: number;
  tema_id: number;
  orden: number;
  tipo: TipoBloque;
  contenido: string | null;
  recurso_url: string | null;
}

export interface BloqueAdminCreate {
  orden: number;
  tipo: TipoBloque;
  contenido: string | null;
  recurso_url: string | null;
}

export interface BloqueAdminUpdate {
  orden?: number;
  tipo?: TipoBloque;
  contenido?: string | null;
  recurso_url?: string | null;
}

export interface OpcionAdmin {
  id: number;
  pregunta_id: number;
  texto: string;
  es_correcta: boolean;
}

export interface OpcionAdminCreate {
  texto: string;
  es_correcta: boolean;
}

export interface OpcionAdminUpdate {
  texto?: string;
  es_correcta?: boolean;
}

export interface PreguntaAdmin {
  id: number;
  tema_id: number;
  enunciado: string;
  mensaje_simulado: string | null;
  explicacion: string;
  activa: boolean;
  opciones: OpcionAdmin[];
}

export interface PreguntaAdminCreate {
  enunciado: string;
  mensaje_simulado: string | null;
  explicacion: string;
  activa: boolean;
}

export interface PreguntaAdminUpdate {
  enunciado?: string;
  mensaje_simulado?: string | null;
  explicacion?: string;
  activa?: boolean;
}

export interface TemaAdminDetalle extends TemaAdmin {
  bloques: BloqueAdmin[];
  preguntas: PreguntaAdmin[];
}
