import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VehiclesPage } from './vehicles.page';
import { VehiclesPageRoutingModule } from './vehicles-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, VehiclesPageRoutingModule],
  declarations: [VehiclesPage],
})
export class VehiclesPageModule {}
