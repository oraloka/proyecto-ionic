import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ExpensesPage } from './expenses.page';
import { ExpensesPageRoutingModule } from './expenses-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ExpensesPageRoutingModule],
  declarations: [ExpensesPage],
})
export class ExpensesPageModule {}
