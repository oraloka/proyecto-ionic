import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login-usuario',
  standalone: false,
  templateUrl: './login-usuario.page.html',
  styleUrls: ['./login-usuario.page.scss'],
})
export class LoginUsuarioPage {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router, private toast: ToastController) {}

  async login() {
    if (!this.email || !this.password) {
      const t = await this.toast.create({ message: 'Completa todos los campos', duration: 2000, color: 'warning' });
      t.present();
      return;
    }

    const result = this.auth.login(this.email, this.password);
    if (result.success) {
      const t = await this.toast.create({ message: 'Bienvenido', duration: 2000, color: 'success' });
      t.present();
      this.router.navigate(['/usuario-dashboard']);
    } else {
      const t = await this.toast.create({ message: result.error || 'Error', duration: 2000, color: 'danger' });
      t.present();
    }
  }
}
