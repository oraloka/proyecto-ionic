import { Component, OnInit, OnDestroy, EnvironmentInjector, runInInjectionContext, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  welcome = '¡Bienvenido a la app!';
  // student form
  name: string = '';
  age: number | null = null;
  address: string = '';

  // list of students
  students: Array<any> = [];
  saving: boolean = false;
  private studentsSub?: Subscription;
  private authSub?: Subscription;
  private userUid: string | null = null;

  constructor(
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    private router: Router
    ,
    private afs: AngularFirestore,
    private alertCtrl: AlertController,
    private envInjector: EnvironmentInjector
    ,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Suscribirnos al estado de autenticación y crear/limpiar la suscripción
    // a la colección de estudiantes del usuario actual.
    this.authSub = this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userUid = user.uid;
        this.subscribeToStudents();
      } else {
        this.userUid = null;
        this.clearStudentsSubscription();
        this.students = [];
        // forzar actualización de UI
        try { this.cdr.detectChanges(); } catch {}
      }
    });
  }

  ngOnDestroy() {
    this.clearStudentsSubscription();
    if (this.authSub) {
      this.authSub.unsubscribe();
      this.authSub = undefined;
    }
  }

  async onLogout() {
    await runInInjectionContext(this.envInjector, async () => await this.afAuth.signOut());
    // limpiar subscripciones y datos locales
    this.clearStudentsSubscription();
    this.students = [];
    try { this.cdr.detectChanges(); } catch {}
    const toast = await this.toastCtrl.create({
      message: 'Sesión cerrada',
      duration: 2000,
      color: 'primary'
    });
    toast.present();
    this.router.navigate(['/login']);
  }

  private subscribeToStudents() {
    if (!this.userUid) return;
    // limpiar subscripción anterior si existe
    this.clearStudentsSubscription();
    runInInjectionContext(this.envInjector, () => {
      this.studentsSub = this.afs.collection('students', ref => ref.where('owner', '==', this.userUid!).orderBy('name'))
        .snapshotChanges()
        .subscribe(snaps => {
          this.students = snaps.map(s => ({ id: s.payload.doc.id, ...(s.payload.doc.data() as any) }));
          try { this.cdr.detectChanges(); } catch {}
        });
    });
  }

  private clearStudentsSubscription() {
    if (this.studentsSub) {
      this.studentsSub.unsubscribe();
      this.studentsSub = undefined;
    }
  }

  async createStudent(event?: Event) {
    // evitar que el formulario haga una sumisión nativa que recargue la página
    try { event?.preventDefault(); } catch {}
    if (!this.name || this.age === null || !this.address) {
      const t = await this.toastCtrl.create({ message: 'Completa todos los campos', duration: 2000, color: 'warning' });
      t.present();
      return;
    }
    this.saving = true;
    // fallback: si por alguna razón la operación queda colgada, forzamos reset del flag
    const fallback = setTimeout(() => {
      if (this.saving) {
        this.saving = false;
        try { this.cdr.detectChanges(); } catch {}
      }
    }, 8000);
    if (!this.userUid) {
      const t = await this.toastCtrl.create({ message: 'Debe iniciar sesión para crear registros', duration: 3000, color: 'danger' });
      t.present();
      this.saving = false;
      try { this.cdr.detectChanges(); } catch {}
      return;
    }
    const payload = { name: this.name.trim(), age: Number(this.age), address: this.address.trim(), owner: this.userUid };
    try {
      await runInInjectionContext(this.envInjector, async () => await this.afs.collection('students').add(payload));
      const t = await this.toastCtrl.create({ message: 'Registro creado', duration: 2000, color: 'success' });
      t.present();
      this.name = '';
      this.age = null;
      this.address = '';
    } catch (err: any) {
      console.error('Create student error', err);
      const t = await this.toastCtrl.create({ message: err.message || 'Error creando registro', duration: 3000, color: 'danger' });
      t.present();
    } finally {
      clearTimeout(fallback);
      this.saving = false;
      try { this.cdr.detectChanges(); } catch {}
    }
  }

  async deleteStudent(id: string) {
    try {
      await runInInjectionContext(this.envInjector, async () => await this.afs.doc(`students/${id}`).delete());
      const t = await this.toastCtrl.create({ message: 'Registro eliminado', duration: 2000, color: 'medium' });
      t.present();
    } catch (err: any) {
      console.error('Delete error', err);
      const t = await this.toastCtrl.create({ message: err.message || 'Error eliminando registro', duration: 3000, color: 'danger' });
      t.present();
    }
  }

  async editStudent(student: any) {
    const alert = await this.alertCtrl.create({
      header: 'Editar registro',
      inputs: [
        { name: 'name', type: 'text', value: student.name, placeholder: 'Nombre' },
        { name: 'age', type: 'number', value: student.age, placeholder: 'Años' },
        { name: 'address', type: 'text', value: student.address, placeholder: 'Direccion' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            try {
                  await runInInjectionContext(this.envInjector, async () => await this.afs.doc(`students/${student.id}`).update({ name: data.name, age: Number(data.age), address: data.address }));
              const t = await this.toastCtrl.create({ message: 'Registro actualizado', duration: 2000, color: 'success' });
              t.present();
            } catch (err: any) {
              console.error('Update error', err);
              const t = await this.toastCtrl.create({ message: err.message || 'Error actualizando', duration: 3000, color: 'danger' });
              t.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

}
