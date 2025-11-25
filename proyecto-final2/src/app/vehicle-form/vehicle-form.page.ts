import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { MaintenanceService } from '../services/maintenance.service';
import { Vehicle } from '../models/vehicle.model';

@Component({
  selector: 'app-vehicle-form',
  standalone: false,
  templateUrl: './vehicle-form.page.html',
  styleUrls: ['./vehicle-form.page.scss'],
})
export class VehicleFormPage implements OnInit {
  vehicle: Vehicle = { id: '', make: '', model: '' } as Vehicle;

  constructor(private route: ActivatedRoute, private svc: MaintenanceService, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(q => {
      if (q['id']) {
        const found = this.svc.getVehicles().find(v => v.id === q['id']);
        if (found) this.vehicle = { ...found };
      }
    });
  }

  save(form: NgForm) {
    if (!this.vehicle.make || !this.vehicle.model) return;
    this.svc.saveVehicle(this.vehicle);
    this.router.navigate(['/vehicles']);
  }
}
