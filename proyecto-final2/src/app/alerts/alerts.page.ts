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

  getAlertIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'mantenimiento': 'wrench-outline',
      'servicio': 'build-outline',
      'info': 'information-circle-outline',
      'advertencia': 'warning-outline',
      'error': 'close-circle-outline'
    };
    return iconMap[type] || 'notifications-outline';
  }
}
