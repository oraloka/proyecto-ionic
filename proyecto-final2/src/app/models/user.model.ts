export interface User {
  id?: string;
  email: string;
  password?: string; // solo para registro
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  edad?: number;
  googleAuth?: boolean;
  rol: 'usuario' | 'admin';
  createdAt?: string;
}

export interface MaintenanceRequest {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  cedula: string;
  placa: string;
  vehicleType: string; // deportivo, todoterreno, sedan, suv, etc
  make: string; // marca
  model: string; // modelo
  year: number;
  maintenanceTypes: string[]; // ['cambio-aceite', 'neumaticos', 'frenos', etc]
  additionalNotes: string;
  pickupDate?: string;
  totalPrice: number;
  status: 'pendiente' | 'aceptada' | 'rechazada';
  createdAt: string;
  responseDate?: string;
  adminNotes?: string;
}

export interface MaintenanceService {
  id: string;
  name: string;
  price: number;
  description: string;
}
