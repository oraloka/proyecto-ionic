import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register-usuario',
  standalone: false,
  templateUrl: './register-usuario.page.html',
  styleUrls: ['./register-usuario.page.scss'],
})
export class RegisterUsuarioPage {
  form = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    cedula: '',
    telefono: '',
    direccion: '',
    edad: 0
  };

  constructor(private auth: AuthService, private router: Router, private toast: ToastController) {}

  async register() {
    if (!this.form.nombre || !this.form.apellido || !this.form.email || !this.form.password || !this.form.cedula || !this.form.telefono) {
      const t = await this.toast.create({ message: 'Completa los campos requeridos', duration: 2000, color: 'warning' });
      t.present();
      return;
    }

    const result = this.auth.register({
      nombre: this.form.nombre,
      apellido: this.form.apellido,
      email: this.form.email,
      password: this.form.password,
      cedula: this.form.cedula,
      telefono: this.form.telefono,
      direccion: this.form.direccion,
      edad: this.form.edad || undefined
    });

    if (result.success) {
      const t = await this.toast.create({ message: 'Cuenta creada exitosamente', duration: 2000, color: 'success' });
      t.present();
      this.router.navigate(['/usuario-dashboard']);
    } else {
      const t = await this.toast.create({ message: result.error || 'Error', duration: 2000, color: 'danger' });
      t.present();
    }
  }
}
