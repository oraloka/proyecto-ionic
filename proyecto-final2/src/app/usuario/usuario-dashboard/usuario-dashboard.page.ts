import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-usuario-dashboard',
  standalone: false,
  templateUrl: './usuario-dashboard.page.html',
  styleUrls: ['./usuario-dashboard.page.scss'],
})
export class UsuarioDashboardPage implements OnInit {
  user: User | null = null;
  isEditingProfile = false;
  editForm = { nombre: '', apellido: '', email: '', telefono: '', cedula: '', direccion: '' };

  constructor(private auth: AuthService, private router: Router, private toast: ToastController) {}

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login-usuario']);
    } else {
      this.initEditForm();
    }
  }

  initEditForm() {
    if (this.user) {
      this.editForm = {
        nombre: this.user.nombre || '',
        apellido: this.user.apellido || '',
        email: this.user.email || '',
        telefono: this.user.telefono || '',
        cedula: this.user.cedula || '',
        direccion: this.user.direccion || ''
      };
    }
  }

  toggleEditProfile() {
    this.isEditingProfile = !this.isEditingProfile;
    if (this.isEditingProfile) {
      this.initEditForm();
    }
  }

  async saveProfile() {
    if (!this.editForm.nombre || !this.editForm.apellido) {
      const t = await this.toast.create({ message: 'Nombre y apellido son obligatorios', duration: 2000, color: 'warning' });
      t.present();
      return;
    }

    if (this.user) {
      this.user.nombre = this.editForm.nombre;
      this.user.apellido = this.editForm.apellido;
      this.user.telefono = this.editForm.telefono;
      this.user.cedula = this.editForm.cedula;
      this.user.direccion = this.editForm.direccion;

      // Save to localStorage (both possible keys for compatibility)
      let users = JSON.parse(localStorage.getItem('mf_users_v1') || '[]');
      let index = users.findIndex((u: User) => u.id === this.user!.id);
      if (index >= 0) {
        users[index] = this.user;
        localStorage.setItem('mf_users_v1', JSON.stringify(users));
      }

      // Also check old key
      users = JSON.parse(localStorage.getItem('users') || '[]');
      index = users.findIndex((u: User) => u.id === this.user!.id);
      if (index >= 0) {
        users[index] = this.user;
        localStorage.setItem('users', JSON.stringify(users));
      }

      // Update auth service
      this.auth.setCurrentUser(this.user);

      this.isEditingProfile = false;
      const t = await this.toast.create({ message: 'Perfil actualizado correctamente', duration: 2000, color: 'success' });
      t.present();
    }
  }

  cancelEdit() {
    this.isEditingProfile = false;
    this.initEditForm();
  }

  goToNewRequest() {
    // Debug: show current local user and attempt navigation
    console.log('Navigating to usuario-solicitud. Current user:', this.user);
    if (!this.user) {
      console.warn('No current user — redirecting to login');
      this.router.navigate(['/login-usuario']);
      return;
    }
    this.router.navigateByUrl('/usuario-solicitud').catch(err => {
      console.error('Navigation error to /usuario-solicitud', err);
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login-select']);
  }
}
