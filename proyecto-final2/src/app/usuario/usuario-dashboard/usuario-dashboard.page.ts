import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RequestService } from '../../services/request.service';
import { User } from '../../models/user.model';
import { ToastController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-usuario-dashboard',
  standalone: false,
  templateUrl: './usuario-dashboard.page.html',
  styleUrls: ['./usuario-dashboard.page.scss'],
})
export class UsuarioDashboardPage implements OnInit {
  user: User | null = null;
  isEditingProfile = false;
  editForm = { nombre: '', apellido: '', email: '', telefono: '', cedula: '', direccion: '', password: '', confirmPassword: '' };
  stats = { total: 0, pending: 0, accepted: 0, rejected: 0 };

  constructor(private auth: AuthService, private router: Router, private toast: ToastController, private reqSvc: RequestService, private modalCtrl: ModalController) {}

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login']);
    } else {
      this.initEditForm();
      this.loadStats();
    }
    // Si el usuario fue creado con Google y no tiene contraseña, pedirle que la establezca
    const needsSetPassword = localStorage.getItem('openSetPasswordModal');
    if (needsSetPassword === 'true') {
      localStorage.removeItem('openSetPasswordModal');
      this.showSetPasswordModal();
    }
    // If redirected to complete profile, open editor automatically
    const open = localStorage.getItem('openEditProfile');
    if (open === '1') {
      localStorage.removeItem('openEditProfile');
      this.toggleEditProfile();
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
        direccion: this.user.direccion || '',
        password: '',
        confirmPassword: ''
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

      // If password fields provided, validate and set password via AuthService
      if (this.editForm.password) {
        if (this.editForm.password !== this.editForm.confirmPassword) {
          const tt = await this.toast.create({ message: 'Las contraseñas no coinciden', duration: 2000, color: 'warning' });
          tt.present();
          return;
        }
        const ok = this.auth.setPassword(this.editForm.email, this.editForm.password);
        if (!ok) {
          const tt = await this.toast.create({ message: 'No se pudo actualizar la contraseña', duration: 2000, color: 'danger' });
          tt.present();
        }
      }

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
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigateByUrl('/usuario-solicitud').catch(err => {
      console.error('Navigation error to /usuario-solicitud', err);
    });
  }

  private loadStats() {
    if (!this.user) return;
    const requests = this.reqSvc.getRequestsByUser(this.user.id!);
    this.stats.total = requests.length;
    this.stats.pending = requests.filter(r => r.status === 'pendiente').length;
    this.stats.accepted = requests.filter(r => r.status === 'aceptada').length;
    this.stats.rejected = requests.filter(r => r.status === 'rechazada').length;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  async showSetPasswordModal() {
    const alert = await this.toast.create({
      message: 'Por favor establece una contraseña para tu cuenta',
      duration: 0,
      buttons: []
    });
    // En lugar de un alert simple, mostraremos un modal con inputs
    const modal = document.createElement('ion-modal');
    modal.component = 'ion-content';
    
    // Crear contenido del modal de forma manual
    const content = `
      <ion-header>
        <ion-toolbar>
          <ion-title>Establecer Contraseña</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <p>Necesitas establecer una contraseña para poder ingresar con tu correo electrónico.</p>
        <ion-item>
          <ion-label position="stacked">Nueva Contraseña</ion-label>
          <ion-input id="pwd" type="password" placeholder="Mínimo 8 caracteres"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Confirmar Contraseña</ion-label>
          <ion-input id="confirmPwd" type="password"></ion-input>
        </ion-item>
        <ion-button expand="block" class="ion-margin-top" id="setPwdBtn">Establecer Contraseña</ion-button>
      </ion-content>
    `;
    
    // Mejor: usar un componente standalone simple
    this.showSetPasswordModalWithComponent();
  }

  private async showSetPasswordModalWithComponent() {
    // Mostrar un alert simple pidiendo la contraseña
    const alert = await this.toast.create({
      message: 'Establece una contraseña para tu cuenta Google',
      duration: 0,
      buttons: []
    });
    alert.present();
    
    // Para una solución más simple, usar un prompt-like approach
    const password = prompt('Establece una contraseña (min 8 caracteres, mayúscula, minúscula, número, especial):');
    if (!password) return;
    
    const confirmPassword = prompt('Confirma la contraseña:');
    if (!confirmPassword) return;
    
    if (password !== confirmPassword) {
      const t = await this.toast.create({ message: 'Las contraseñas no coinciden', duration: 2000, color: 'warning' });
      t.present();
      return;
    }
    
    if (!this.auth.isStrongPassword(password)) {
      const t = await this.toast.create({ message: 'La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y un carácter especial', duration: 3500, color: 'warning' });
      t.present();
      return;
    }
    
    const email = localStorage.getItem('googleUserEmail') || this.user?.email;
    if (!email) {
      const t = await this.toast.create({ message: 'No se pudo obtener el email', duration: 2000, color: 'danger' });
      t.present();
      return;
    }
    
    const ok = this.auth.setPassword(email, password);
    if (ok) {
      localStorage.removeItem('googleUserEmail');
      const t = await this.toast.create({ message: 'Contraseña establecida exitosamente', duration: 2000, color: 'success' });
      t.present();
    } else {
      const t = await this.toast.create({ message: 'Error al establecer la contraseña', duration: 2000, color: 'danger' });
      t.present();
    }
  }
}
