import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaintenanceService } from '../services/maintenance.service';
import { Vehicle } from '../models/vehicle.model';

@Component({
  selector: 'app-vehicles',
  standalone: false,
  templateUrl: './vehicles.page.html',
  styleUrls: ['./vehicles.page.scss'],
})
export class VehiclesPage implements OnInit {
  vehicles: Vehicle[] = [];

  constructor(private svc: MaintenanceService, private router: Router) {}

  ngOnInit() {
    this.load();
  }

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.vehicles = this.svc.getVehicles();
  }

  add() {
    this.router.navigate(['/vehicle-form']);
  }

  edit(id: string) {
    this.router.navigate(['/vehicle-form'], { queryParams: { id } });
  }

  remove(id: string) {
    this.svc.deleteVehicle(id);
    this.load();
  }
}
