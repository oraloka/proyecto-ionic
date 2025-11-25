import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { UsuarioMisSolicitudesPage } from './usuario-mis-solicitudes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: UsuarioMisSolicitudesPage }])
  ],
  declarations: [UsuarioMisSolicitudesPage],
})
export class UsuarioMisSolicitudesPageModule {}
