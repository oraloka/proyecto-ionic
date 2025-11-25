import { Component, OnInit, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    private envInjector: EnvironmentInjector
  ) { }

  ngOnInit() {
  }

  async onLogin() {
    // Use Firebase Auth to sign in inside an injection context
    try {
      await runInInjectionContext(this.envInjector, async () => await this.afAuth.signInWithEmailAndPassword(this.email, this.password));
      this.router.navigate(['/home']);
    } catch (err: any) {
      console.error('Login error', err);
      if (err && err.code === 'auth/user-not-found') {
        const toast = await this.toastCtrl.create({
          message: 'No se encuentra un usuario con ese gmail',
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
      this.router.navigate(['/home']);
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

}
