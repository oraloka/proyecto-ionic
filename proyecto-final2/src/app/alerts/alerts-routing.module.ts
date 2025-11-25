import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlertsPage } from './alerts.page';

const routes: Routes = [
  {
    path: '',
    component: AlertsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlertsPageRoutingModule {}
