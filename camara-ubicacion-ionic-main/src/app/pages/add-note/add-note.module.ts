import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AddNotePage } from './add-note.page';
import { AddNotePageRoutingModule } from './add-note-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddNotePageRoutingModule
  ],
  declarations: [AddNotePage]
})
export class AddNotePageModule {}