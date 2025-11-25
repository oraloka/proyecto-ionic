import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VehicleFormPage } from './vehicle-form.page';
import { VehicleFormPageRoutingModule } from './vehicle-form-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, VehicleFormPageRoutingModule],
  declarations: [VehicleFormPage],
})
export class VehicleFormPageModule {}
