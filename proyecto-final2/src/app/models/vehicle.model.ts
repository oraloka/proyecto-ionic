export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year?: number;
  mileage?: number;
  lastOilChange?: string; // ISO date string
  nextOilChange?: string; // ISO date string
  notes?: string;
}
