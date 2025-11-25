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

  async onRegister() {
    try {
      await runInInjectionContext(this.envInjector, async () => await this.afAuth.createUserWithEmailAndPassword(this.email, this.password));
      const toast = await this.toastCtrl.create({
        message: 'Cuenta creada correctamente',
        duration: 2000,
        color: 'success'
      });
      toast.present();
      this.router.navigate(['/login']);
    } catch (err: any) {
      console.error('Register error', err);
      const toast = await this.toastCtrl.create({
        message: err.message || 'Error al crear la cuenta',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    }
  }

  async onRegisterWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      // Ensure AngularFire runs inside an injection context to avoid NG0203
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
