import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule, RouterOutlet],
  template: `<ion-app>
    <ion-router-outlet></ion-router-outlet>
  </ion-app>`,
})
export class AppComponent {}