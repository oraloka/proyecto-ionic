import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../services/request.service';
import { EmailService } from '../../services/email.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {
  results: any[] = [];
  filters: any = { type: '', placa: '', cedula: '' };
  selectedRequest: any = null;

  constructor(private req: RequestService, private email: EmailService, private auth: AuthService, private router: Router, private toast: ToastController) {}

  ngOnInit() {
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/login-admin']);
      return;
    }
    this.load();
  }

  load() {
    this.results = this.req.getAllRequests();
  }

  applyFilters() {
    this.results = this.req.filterRequests(this.filters);
  }

  async accept(id: string) {
    const updated = this.req.updateRequestStatus(id, 'aceptada');
    if (updated) {
      await this.email.sendRequestAcceptedEmail(updated.userEmail, updated.id, updated.userName);
      const t = await this.toast.create({ message: 'Solicitud aceptada y notificación enviada', duration: 2000, color: 'success' });
      t.present();
      this.load();
    }
  }

  async reject(id: string) {
    const updated = this.req.updateRequestStatus(id, 'rechazada');
    if (updated) {
      await this.email.sendRequestRejectedEmail(updated.userEmail, updated.id, updated.userName);
      const t = await this.toast.create({ message: 'Solicitud rechazada y notificación enviada', duration: 2000, color: 'medium' });
      t.present();
      this.load();
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login-select']);
  }

  viewDetails(r: any) {
    this.selectedRequest = r;
  }

  closeDetails() {
    this.selectedRequest = null;
  }
}
