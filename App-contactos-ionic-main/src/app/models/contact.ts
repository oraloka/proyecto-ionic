export interface Contact {
  id: number;
  name: string;
  phone: string;
  email?: string;
  apellido?: string;  // Nuevo campo para apellido
  nota?: string;      // Nuevo campo para nota
}