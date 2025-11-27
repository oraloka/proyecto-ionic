import { Component, OnInit, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: string = '';
  password: string = '';
  rememberMe: boolean = false;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    private envInjector: EnvironmentInjector,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Recover remembered email if available
    const remembered = localStorage.getItem('rememberMe_email');
    if (remembered) {
      this.email = remembered;
      this.rememberMe = true;
    }
  }

  isValidEmail(): boolean {
    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  async onLogin() {
    // Validate email format
    if (!this.isValidEmail()) {
      const toast = await this.toastCtrl.create({
        message: 'Ingresa un correo electrónico válido',
        duration: 3000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    // Remember email if checkbox is selected
    if (this.rememberMe) {
      localStorage.setItem('rememberMe_email', this.email);
    } else {
      localStorage.removeItem('rememberMe_email');
    }

    // Use Firebase Auth to sign in inside an injection context
    try {
      await runInInjectionContext(this.envInjector, async () => await this.afAuth.signInWithEmailAndPassword(this.email, this.password));
      // Ensure local app user exists and set current user
      try {
        this.authService.ensureUserByEmail(this.email);
      } catch (e) {
        console.warn('Could not ensure local user by email', e);
      }
      // If the local user is admin, redirect to admin dashboard
      const current = this.authService.getCurrentUser();
      if (current && current.rol === 'admin') {
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.router.navigate(['/usuario-dashboard']);
      }
    } catch (err: any) {
      console.error('Login error', err);
      // If Firebase user not found or Firebase failed, try local fallback
      try {
        const local = this.authService.loginLocal(this.email, this.password);
        if (local.success && local.user) {
          const user = local.user;
          if (user.rol === 'admin') {
            this.router.navigate(['/admin-dashboard']);
          } else {
            this.router.navigate(['/usuario-dashboard']);
          }
          return;
        }
      } catch (e) {
        console.warn('Local login attempt failed', e);
      }

      if (err && err.code === 'auth/user-not-found') {
        const toast = await this.toastCtrl.create({
          message: 'No se encuentra un usuario con ese email',
          duration: 3000,
          color: 'danger'
        });
        toast.present();
      } else {
        const toast = await this.toastCtrl.create({
          message: err.message || 'Error en el login',
          duration: 3000,
          color: 'danger'
        });
        toast.present();
      }
    }
  }

  async onLoginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      // Ensure AngularFire runs inside an injection context to avoid NG0203
      await runInInjectionContext(this.envInjector, async () => await this.afAuth.signInWithPopup(provider));
      // Try to grab displayName and email to create local user if needed
      try {
        const current = await this.afAuth.currentUser;
        const email = current?.email || '';
        const display = current?.displayName || '';
        let nombre = '';
        let apellido = '';
        if (display) {
          const parts = display.split(' ');
          nombre = parts.shift() || '';
          apellido = parts.join(' ') || '';
        }
        if (email) {
          const user = this.authService.ensureUserByEmail(email, nombre, apellido);
          // Si el usuario de Google no tiene contraseña local, pedirle que la establezca
          if (!user.password) {
            localStorage.setItem('openSetPasswordModal', 'true');
            localStorage.setItem('googleUserEmail', email);
          }
        }
      } catch (e) {
        console.warn('Could not sync Google user to local auth', e);
      }
      // Redirect to usuario-dashboard instead of home for regular users
      this.router.navigate(['/usuario-dashboard']);
    } catch (err: any) {
      console.error('Google login error', err);
      const toast = await this.toastCtrl.create({
        message: err.message || 'Error con Google Sign-In',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    }
  }

  async onLoginWithApple() {
    try {
      // Placeholder for Apple Sign-In
      // Note: Apple Sign-In requires additional Firebase and Capacitor configuration
      const toast = await this.toastCtrl.create({
        message: 'Apple Sign-In no está disponible en este momento',
        duration: 3000,
        color: 'info'
      });
      toast.present();
      console.info('Apple Sign-In not implemented yet');
    } catch (err: any) {
      console.error('Apple login error', err);
      const toast = await this.toastCtrl.create({
        message: err.message || 'Error con Apple Sign-In',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    }
  }

}
