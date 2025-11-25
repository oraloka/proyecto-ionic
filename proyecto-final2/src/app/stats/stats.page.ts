import { Component, OnInit } from '@angular/core';
import { MaintenanceService } from '../services/maintenance.service';

@Component({
  selector: 'app-stats',
  standalone: false,
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements OnInit {
  stats: any[] = [];

  constructor(private svc: MaintenanceService) {}

  ngOnInit() {
    this.load();
  }

  ionViewWillEnter() { this.load(); }

  load() {
    this.stats = this.svc.getMonthlyStats();
  }
}
