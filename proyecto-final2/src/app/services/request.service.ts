import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MaintenanceRequest, MaintenanceService } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private REQUESTS_KEY = 'mf_requests_v1';
  private SERVICES_KEY = 'mf_services_v1';

  private maintenanceServices: MaintenanceService[] = [
    { id: 'cambio-aceite', name: 'Cambio de Aceite', price: 85000, description: 'Cambio de aceite y filtro' },
    { id: 'neumaticos', name: 'Revisión de Neumáticos', price: 45000, description: 'Inspección y calibración' },
    { id: 'frenos', name: 'Revisión de Frenos', price: 120000, description: 'Inspección de pastillas y discos' },
    { id: 'bateria', name: 'Revisión de Batería', price: 60000, description: 'Test de batería' },
    { id: 'alineacion', name: 'Alineación y Balanceo', price: 150000, description: 'Alineación 4 ruedas' },
    { id: 'suspension', name: 'Revisión de Suspensión', price: 180000, description: 'Inspección completa' },
    { id: 'aire', name: 'Aire Acondicionado', price: 200000, description: 'Recarga y limpieza' },
    { id: 'liquidos', name: 'Cambio de Líquidos', price: 75000, description: 'Refrigerante y otros' },
  ];

  constructor(private http: HttpClient) {
    this.initializeServices();
  }

  private initializeServices() {
    const stored = localStorage.getItem(this.SERVICES_KEY);
    if (!stored) {
      localStorage.setItem(this.SERVICES_KEY, JSON.stringify(this.maintenanceServices));
    }
  }

  getServices(): MaintenanceService[] {
    const stored = localStorage.getItem(this.SERVICES_KEY);
    return stored ? JSON.parse(stored) : this.maintenanceServices;
  }

  getAllRequests(): MaintenanceRequest[] {
    const raw = localStorage.getItem(this.REQUESTS_KEY);
    return raw ? JSON.parse(raw) as MaintenanceRequest[] : [];
  }

  getRequestsByUser(userId: string): MaintenanceRequest[] {
    const requests = this.getAllRequests();
    return requests.filter(r => r.userId === userId);
  }

  getPendingRequests(): MaintenanceRequest[] {
    const requests = this.getAllRequests();
    return requests.filter(r => r.status === 'pendiente');
  }

  createRequest(request: Omit<MaintenanceRequest, 'id' | 'status' | 'createdAt'>): MaintenanceRequest {
    const newRequest: MaintenanceRequest = {
      id: `req-${Date.now()}`,
      ...request,
      status: 'pendiente',
      createdAt: new Date().toISOString()
    };
    const requests = this.getAllRequests();
    requests.push(newRequest);
    localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
    return newRequest;
  }

  updateRequestStatus(requestId: string, status: 'aceptada' | 'rechazada', adminNotes?: string): MaintenanceRequest | null {
    const requests = this.getAllRequests();
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx > -1) {
      requests[idx].status = status;
      requests[idx].responseDate = new Date().toISOString();
      if (adminNotes) requests[idx].adminNotes = adminNotes;
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
      return requests[idx];
    }
    return null;
  }

  filterRequests(filters: { type?: string; placa?: string; cedula?: string }): MaintenanceRequest[] {
    let results = this.getAllRequests();
    if (filters.type) {
      results = results.filter(r => r.vehicleType === filters.type);
    }
    if (filters.placa) {
      const placaFilter = filters.placa.toLowerCase();
      results = results.filter(r => (r.placa || '').toLowerCase().includes(placaFilter));
    }
    if (filters.cedula) {
      const cedulaFilter = filters.cedula;
      results = results.filter(r => (r.cedula || '').includes(cedulaFilter));
    }
    return results;
  }
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  // Simular envío de emails (en producción usar backend con nodemailer/sendgrid)
  constructor() {}

  sendRequestAcceptedEmail(email?: string, requestId?: string, userName?: string): Promise<boolean> {
    const to = email || '(sin email)';
    const rid = requestId || '(sin id)';
    const name = userName || '';
    console.log(`📧 Email enviado a ${to}: Su solicitud ${rid} ha sido ACEPTADA`);
    // En producción:
    // return this.http.post('/api/email/send', { email, type: 'accepted', requestId, userName }).toPromise()
    return Promise.resolve(true);
  }

  sendRequestRejectedEmail(email?: string, requestId?: string, userName?: string, reason?: string): Promise<boolean> {
    const to = email || '(sin email)';
    const rid = requestId || '(sin id)';
    const name = userName || '';
    console.log(`📧 Email enviado a ${to}: Su solicitud ${rid} ha sido RECHAZADA. Razón: ${reason || 'No especificada'}`);
    // En producción:
    // return this.http.post('/api/email/send', { email, type: 'rejected', requestId, userName, reason }).toPromise()
    return Promise.resolve(true);
  }

  sendIncompleteProfileEmail(email?: string, userName?: string): Promise<boolean> {
    const to = email || '(sin email)';
    const name = userName || '';
    console.log(`📧 Email enviado a ${to}: Por favor completa tu perfil antes de hacer solicitudes`);
    return Promise.resolve(true);
  }
}
