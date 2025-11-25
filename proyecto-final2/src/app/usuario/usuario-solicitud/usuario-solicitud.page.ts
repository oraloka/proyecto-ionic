import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RequestService } from '../../services/request.service';
import { EmailService } from '../../services/email.service';
import { MaintenanceService, User } from '../../models/user.model';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-usuario-solicitud',
  standalone: false,
  templateUrl: './usuario-solicitud.page.html',
  styleUrls: ['./usuario-solicitud.page.scss'],
})
export class UsuarioSolicitudPage implements OnInit {
  user: User | null = null;
  services: MaintenanceService[] = [];
  selectedServices: { [key: string]: boolean } = {};
  form = {
    placa: '',
    make: '',
    model: '',
    year: 2024,
    vehicleType: 'sedan',
    additionalNotes: ''
  };

  constructor(
    private auth: AuthService,
    private requestSvc: RequestService,
    private emailSvc: EmailService,
    private router: Router,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login-usuario']);
      return;
    }
    this.services = this.requestSvc.getServices();
    this.services.forEach(s => (this.selectedServices[s.id] = false));
  }

  calculateTotal(): number {
    return this.services
      .filter(s => this.selectedServices[s.id])
      .reduce((sum, s) => sum + s.price, 0);
  }

  goBack() {
    this.router.navigate(['/usuario-dashboard']);
  }

  async submitRequest() {
    if (!this.user) return;

    if (!this.form.placa || !this.form.make || !this.form.model || !this.form.year) {
      const t = await this.toast.create({ message: 'Completa datos del vehículo', duration: 2000, color: 'warning' });
      t.present();
      return;
    }

    const selectedCount = Object.values(this.selectedServices).filter(v => v).length;
    if (selectedCount === 0) {
      const t = await this.toast.create({ message: 'Selecciona al menos un servicio', duration: 2000, color: 'warning' });
      t.present();
      return;
    }

    const maintenanceTypes = this.services
      .filter(s => this.selectedServices[s.id])
      .map(s => s.id);

    const req = this.requestSvc.createRequest({
      userId: this.user.id!,
      userName: `${this.user.nombre} ${this.user.apellido}`,
      userEmail: this.user.email,
      userPhone: this.user.telefono,
      cedula: this.user.cedula,
      placa: this.form.placa,
      vehicleType: this.form.vehicleType,
      make: this.form.make,
      model: this.form.model,
      year: this.form.year,
      maintenanceTypes,
      additionalNotes: this.form.additionalNotes,
      totalPrice: this.calculateTotal()
    });

    const t = await this.toast.create({ message: 'Solicitud enviada. Espera confirmación por email', duration: 2000, color: 'success' });
    t.present();

    this.router.navigate(['/usuario-mis-solicitudes']);
  }
}
