import { Component, OnInit } from '@angular/core';
import { MaintenanceService } from '../services/maintenance.service';

@Component({
  selector: 'app-alerts',
  standalone: false,
  templateUrl: './alerts.page.html',
  styleUrls: ['./alerts.page.scss'],
})
export class AlertsPage implements OnInit {
  alerts: any[] = [];

  constructor(private svc: MaintenanceService) {}

  ngOnInit() {
    this.load();
  }

  ionViewWillEnter() { this.load(); }

  load() {
    this.alerts = this.svc.getAlerts();
  }
}
