import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Motorcycle {
  id: number;
  name: string;
  brand: string;
  year: number;
  description?: string;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RestService {

  // 🔗 URL base del servicio (luego usaremos json-server)
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // ✅ Obtener lista de motocicletas
  getMotorcycles(): Observable<Motorcycle[]> {
    return this.http.get<Motorcycle[]>(`${this.apiUrl}/motorcycles`);
  }

  // ✅ Agregar nueva motocicleta (opcional)
  addMotorcycle(motorcycle: Motorcycle) {
    return this.http.post(`${this.apiUrl}/motorcycles`, motorcycle);
  }
}
