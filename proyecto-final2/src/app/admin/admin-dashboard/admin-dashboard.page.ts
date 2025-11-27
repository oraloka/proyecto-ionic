import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../services/request.service';
import { EmailService } from '../../services/email.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';

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

  constructor(private req: RequestService, private email: EmailService, private auth: AuthService, private router: Router, private toast: ToastController, private alertController: AlertController) {}

  ngOnInit() {
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/login']);
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
    const alert = await this.alertController.create({
      header: 'Motivo de rechazo',
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Describe por qué se rechaza la solicitud'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: async (data: { reason?: string }) => {
            const reason = data?.reason || '';
            const updated = this.req.updateRequestStatus(id, 'rechazada', reason);
            if (updated) {
              await this.email.sendRequestRejectedEmail(updated.userEmail, updated.id, updated.userName);
              const t = await this.toast.create({ message: 'Solicitud rechazada y notificación enviada', duration: 2000, color: 'medium' });
              t.present();
              this.load();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  viewDetails(r: any) {
    this.selectedRequest = r;
  }

  closeDetails() {
    this.selectedRequest = null;
  }

  getPendingCount(): number {
    return this.req.getAllRequests().filter(r => r.status === 'pendiente').length;
  }

  getApprovedCount(): number {
    return this.req.getAllRequests().filter(r => r.status === 'aceptada').length;
  }

  getRejectedCount(): number {
    return this.req.getAllRequests().filter(r => r.status === 'rechazada').length;
  }
}
