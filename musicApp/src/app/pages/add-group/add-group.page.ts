import { Component } from '@angular/core';
import { RestService, Motorcycle } from '../../providers/rest';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.page.html',
  styleUrls: ['./add-group.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AddGroupPage {

  group: Motorcycle = { id: 0, name: '', brand: '', year: new Date().getFullYear() };

  constructor(
    private rest: RestService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async addGroup() {
    if (!this.group.name || !this.group.brand || !this.group.year) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa todos los campos.',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    this.rest.addMotorcycle(this.group).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Grupo agregado correctamente ✅',
          duration: 2000,
          color: 'success'
        });
        toast.present();
        this.router.navigateByUrl('/pages/groups');
      },
      error: async (err) => {
        console.error(err);
        const toast = await this.toastCtrl.create({
          message: 'Error al guardar el grupo ❌',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }
}
