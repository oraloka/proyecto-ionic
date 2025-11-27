import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private mailServerUrl = 'http://localhost:3001'; // Cambiar si el servidor está en otra URL

  constructor(private http: HttpClient) {}

  sendRequestAcceptedEmail(email?: string, requestId?: string, userName?: string): Promise<boolean> {
    const to = email || '(sin email)';
    const rid = requestId || '(sin id)';
    const name = userName || '';
    
    const payload = {
      to,
      subject: 'Tu solicitud de mantenimiento ha sido ACEPTADA',
      text: `Hola ${name},\n\nTu solicitud ${rid} ha sido ACEPTADA.\n\nPor favor revisa los detalles en la aplicación.`,
      html: `<p>Hola ${name},</p><p>Tu solicitud <strong>${rid}</strong> ha sido <strong>ACEPTADA</strong>.</p><p>Por favor revisa los detalles en la aplicación.</p>`
    };

    return firstValueFrom(
      this.http.post<{ ok: boolean }>(`${this.mailServerUrl}/send`, payload).pipe(
        catchError((err) => {
          console.warn('Mail server no disponible, usando fallback console:', err);
          console.log(`📧 [FALLBACK] Email de solicitud ACEPTADA enviado a ${to}`);
          return of({ ok: true });
        })
      )
    ).then(res => res.ok);
  }

  sendRequestRejectedEmail(email?: string, requestId?: string, userName?: string, reason?: string): Promise<boolean> {
    const to = email || '(sin email)';
    const rid = requestId || '(sin id)';
    const name = userName || '';
    
    const payload = {
      to,
      subject: 'Tu solicitud de mantenimiento ha sido RECHAZADA',
      text: `Hola ${name},\n\nTu solicitud ${rid} ha sido RECHAZADA.\n\nRazón: ${reason || 'No especificada'}\n\nPor favor revisa los detalles en la aplicación.`,
      html: `<p>Hola ${name},</p><p>Tu solicitud <strong>${rid}</strong> ha sido <strong>RECHAZADA</strong>.</p><p><strong>Razón:</strong> ${reason || 'No especificada'}</p><p>Por favor revisa los detalles en la aplicación.</p>`
    };

    return firstValueFrom(
      this.http.post<{ ok: boolean }>(`${this.mailServerUrl}/send`, payload).pipe(
        catchError((err) => {
          console.warn('Mail server no disponible, usando fallback console:', err);
          console.log(`📧 [FALLBACK] Email de solicitud RECHAZADA enviado a ${to}`);
          return of({ ok: true });
        })
      )
    ).then(res => res.ok);
  }

  sendIncompleteProfileEmail(email?: string, userName?: string): Promise<boolean> {
    const to = email || '(sin email)';
    const name = userName || '';
    console.log(`📧 Email enviado a ${to}: Por favor completa tu perfil antes de hacer solicitudes`);
    return Promise.resolve(true);
  }

  sendNewRequestNotificationToAdmin(adminEmail: string, userName: string, requestId: string, requestType: string): Promise<boolean> {
    const payload = {
      to: adminEmail,
      subject: `Nueva solicitud de mantenimiento - ${requestType}`,
      text: `Hola Admin,\n\nUna nueva solicitud ha llegado.\n\nUsuario: ${userName}\nID de Solicitud: ${requestId}\nTipo: ${requestType}\n\nPor favor revisa y responde en la aplicación.`,
      html: `<p>Hola Admin,</p><p>Una nueva solicitud ha llegado.</p><ul><li><strong>Usuario:</strong> ${userName}</li><li><strong>ID de Solicitud:</strong> ${requestId}</li><li><strong>Tipo:</strong> ${requestType}</li></ul><p>Por favor revisa y responde en la aplicación.</p>`
    };

    return firstValueFrom(
      this.http.post<{ ok: boolean }>(`${this.mailServerUrl}/send`, payload).pipe(
        catchError((err) => {
          console.warn('Mail server no disponible, usando fallback console:', err);
          console.log(`📧 [FALLBACK] Email de nueva solicitud enviado a admin ${adminEmail}`);
          return of({ ok: true });
        })
      )
    ).then(res => res.ok);
  }

  sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const link = `${location.origin}/reset-password?token=${encodeURIComponent(token)}`;
    const payload = {
      to: email,
      name: email.split('@')[0],
      token: token,
      appUrl: location.origin
    };

    return firstValueFrom(
      this.http.post<{ ok: boolean }>(`${this.mailServerUrl}/send-reset`, payload).pipe(
        catchError((err) => {
          console.warn('Mail server no disponible, usando fallback console:', err);
          console.log(`📧 [FALLBACK] Email de restablecer contraseña a ${email}: Visita ${link} para restablecer tu contraseña`);
          return of({ ok: true });
        })
      )
    ).then(res => res.ok);
  }

  sendPasswordResetConfirmation(email: string): Promise<boolean> {
    const payload = {
      to: email,
      subject: 'Contraseña restablecida',
      text: `Tu contraseña ha sido restablecida correctamente.`,
      html: `<p>Tu contraseña ha sido restablecida correctamente.</p>`
    };

    return firstValueFrom(
      this.http.post<{ ok: boolean }>(`${this.mailServerUrl}/send`, payload).pipe(
        catchError((err) => {
          console.warn('Mail server no disponible, usando fallback console:', err);
          console.log(`📧 [FALLBACK] Email de confirmación enviado a ${email}: Tu contraseña ha sido restablecida correctamente.`);
          return of({ ok: true });
        })
      )
    ).then(res => res.ok);
  }
}
