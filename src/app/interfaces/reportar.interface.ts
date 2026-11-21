export type EstadoReporte = 'pendiente' | 'validado' | 'rechazado';

export interface ReporteCreate {
  tipo_fraude_id: number;
  canal_id: number;
  departamento_id: number;
  descripcion: string;
  monto_afectado: number;
  fecha_incidente: string;
  evidencia_url: string | null;
}

export interface Reporte {
  id: number;
  tipo_fraude: string;
  canal: string;
  departamento: string;
  estado: EstadoReporte;
  descripcion: string;
  monto_afectado: number;
  fecha_incidente: string;
  evidencia_url: string | null;
  creado_en: string;
}

export interface Alerta {
  tipo_fraude: string;
  canal: string;
  departamento: string;
  fecha_incidente: string;
  descripcion: string;
}

export interface AlertasPage {
  total: number;
  pagina: number;
  limite: number;
  alertas: Alerta[];
}
