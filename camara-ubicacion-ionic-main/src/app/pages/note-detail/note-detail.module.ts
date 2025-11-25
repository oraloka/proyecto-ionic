import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NoteDetailPage } from './note-detail.page';
import { NoteDetailPageRoutingModule } from './note-detail-routing.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    NoteDetailPageRoutingModule
  ],
  declarations: [NoteDetailPage]
})
export class NoteDetailPageModule {}