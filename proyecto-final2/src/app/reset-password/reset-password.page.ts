import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  mode: 'request' | 'reset' = 'request';
  email: string = '';
  token: string | null = null;
  password: string = '';
  confirmPassword: string = '';
  showPassword = false;

  constructor(private route: ActivatedRoute, private router: Router, private toast: ToastController, private auth: AuthService, private emailSvc: EmailService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const t = params['token'];
      if (t) {
        this.token = t;
        this.mode = 'reset';
      } else {
        this.mode = 'request';
      }
    });
  }

  async requestReset() {
    if (!this.email) {
      const t = await this.toast.create({ message: 'Ingresa tu email', duration: 2000, color: 'warning' });
      t.present();
      return;
    }
    const token = this.auth.createPasswordResetToken(this.email);
    if (!token) {
      const t = await this.toast.create({ message: 'No existe un usuario con ese email', duration: 2500, color: 'danger' });
      t.present();
      return;
    }
    await this.emailSvc.sendPasswordResetEmail(this.email, token);
    const t = await this.toast.create({ message: 'Email de restablecimiento enviado (simulado)', duration: 3000, color: 'success' });
    t.present();
    this.router.navigate(['/login']);
  }

  async doReset() {
    if (!this.token) return;
    if (!this.password || !this.confirmPassword) {
      const t = await this.toast.create({ message: 'Completa las contraseñas', duration: 2000, color: 'warning' });
      t.present();
      return;
    }
    if (this.password !== this.confirmPassword) {
      const t = await this.toast.create({ message: 'Las contraseñas no coinciden', duration: 2000, color: 'warning' });
      t.present();
      return;
    }
    if (!this.auth.isStrongPassword(this.password)) {
      const t = await this.toast.create({ message: 'La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y un carácter especial', duration: 3500, color: 'warning' });
      t.present();
      return;
    }
    const ok = this.auth.resetPasswordWithToken(this.token, this.password);
    if (!ok) {
      const t = await this.toast.create({ message: 'Token inválido o expirado', duration: 2500, color: 'danger' });
      t.present();
      return;
    }
    await this.emailSvc.sendPasswordResetConfirmation(this.auth.getCurrentUser()?.email || this.email || '');
    const t = await this.toast.create({ message: 'Contraseña restablecida con éxito', duration: 2500, color: 'success' });
    t.present();
    this.router.navigate(['/login']);
  }
}
