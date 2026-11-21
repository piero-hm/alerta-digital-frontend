export interface ItemCatalogo {
  id: number;
  nombre: string;
}

export interface Catalogos {
  departamentos: ItemCatalogo[];
  tipos_fraude: ItemCatalogo[];
  canales: ItemCatalogo[];
}
