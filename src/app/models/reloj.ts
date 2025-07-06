export interface Reloj {
  id: number;
  hora: number;
  minuto: number;
  segundo: number;
  colorLabel: string;
  colorManecillas: string;
  colorPuntos: string;
  colorNumeros: string;
  createdAt: Date;
  updatedAt?: Date;
}
