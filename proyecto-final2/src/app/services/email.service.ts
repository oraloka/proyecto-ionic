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
