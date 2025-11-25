import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EmailService {
  // Simular envío de emails (en producción usar backend con nodemailer/sendgrid)
  constructor() {}

  sendRequestAcceptedEmail(email?: string, requestId?: string, userName?: string): Promise<boolean> {
    const to = email || '(sin email)';
    const rid = requestId || '(sin id)';
    const name = userName || '';
    console.log(`📧 Email enviado a ${to}: Su solicitud ${rid} ha sido ACEPTADA`);
    return Promise.resolve(true);
  }

  sendRequestRejectedEmail(email?: string, requestId?: string, userName?: string, reason?: string): Promise<boolean> {
    const to = email || '(sin email)';
    const rid = requestId || '(sin id)';
    const name = userName || '';
    console.log(`📧 Email enviado a ${to}: Su solicitud ${rid} ha sido RECHAZADA. Razón: ${reason || 'No especificada'}`);
    return Promise.resolve(true);
  }

  sendIncompleteProfileEmail(email?: string, userName?: string): Promise<boolean> {
    const to = email || '(sin email)';
    const name = userName || '';
    console.log(`📧 Email enviado a ${to}: Por favor completa tu perfil antes de hacer solicitudes`);
    return Promise.resolve(true);
  }
}
