import { Component, OnInit, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  name: string = '';
  apellido: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  telefono: string = '';
  direccion: string = '';
  cedula: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  termsAccepted: boolean = false;
  saving: boolean = false;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    private envInjector: EnvironmentInjector
  ) { }

  ngOnInit() {
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onRegister() {
    if (!this.name || !this.apellido || !this.email || !this.password || !this.confirmPassword || !this.telefono || !this.direccion || !this.cedula) {
      const toast = await this.toastCtrl.create({
        message: 'Completa todos los campos',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    if (this.password !== this.confirmPassword) {
      const toast = await this.toastCtrl.create({
        message: 'Las contraseñas no coinciden',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    if (!this.termsAccepted) {
      const toast = await this.toastCtrl.create({
        message: 'Debes aceptar los términos y condiciones',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    this.saving = true;
    try {
      await runInInjectionContext(this.envInjector, async () => await this.afAuth.createUserWithEmailAndPassword(this.email, this.password));
      
      // Save user to localStorage with additional fields
      const users = JSON.parse(localStorage.getItem('mf_users_v1') || '[]');
      const newUser = {
        id: `user-${Date.now()}`,
        nombre: this.name,
        apellido: this.apellido,
        email: this.email,
        telefono: this.telefono,
        direccion: this.direccion,
        cedula: this.cedula,
        password: btoa(this.password),
        rol: 'usuario',
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('mf_users_v1', JSON.stringify(users));
      localStorage.setItem('mf_current_user_v1', JSON.stringify(newUser));

      const toast = await this.toastCtrl.create({
        message: 'Cuenta creada correctamente',
        duration: 2000,
        color: 'success'
      });
      toast.present();
      this.router.navigate(['/usuario-dashboard']);
    } catch (err: any) {
      console.error('Register error', err);
      const toast = await this.toastCtrl.create({
        message: err.message || 'Error al crear la cuenta',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    } finally {
      this.saving = false;
    }
  }

  async onRegisterWithApple() {
    try {
      const toast = await this.toastCtrl.create({
        message: 'Apple Sign-In no está disponible en este momento',
        duration: 3000,
        color: 'info'
      });
      toast.present();
      console.info('Apple Sign-In not implemented yet');
    } catch (err: any) {
      console.error('Apple register error', err);
      const toast = await this.toastCtrl.create({
        message: err.message || 'Error con Apple Sign-In',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    }
  }

  async onRegisterWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await runInInjectionContext(this.envInjector, async () => await this.afAuth.signInWithPopup(provider));
      const toast = await this.toastCtrl.create({
        message: 'Autenticado con Google',
        duration: 2000,
        color: 'success'
      });
      toast.present();
      this.router.navigate(['/home']);
    } catch (err: any) {
      console.error('Google register error', err);
      const toast = await this.toastCtrl.create({
        message: err.message || 'Error con Google Sign-In',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    }
  }

}
