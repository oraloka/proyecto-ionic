import { Component, OnInit } from '@angular/core';
import { RestService, Motorcycle } from '../../providers/rest'; // ajusta la ruta si tu archivo está en otro lugar
import { LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class GroupsPage implements OnInit {
  motorcycles: Motorcycle[] = [];

  constructor(private rest: RestService, private loadingCtrl: LoadingController) {}

  async ngOnInit() {
    const loader = await this.loadingCtrl.create({ message: 'Cargando grupos...' });
    await loader.present();

    this.rest.getMotorcycles().subscribe({
      next: (data: Motorcycle[]) => {
        this.motorcycles = data;
        loader.dismiss();
      },
      error: err => {
        console.error(err);
        loader.dismiss();
      }
    });
  }
}
