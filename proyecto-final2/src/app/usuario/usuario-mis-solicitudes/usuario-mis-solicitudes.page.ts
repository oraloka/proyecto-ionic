import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RequestService } from '../../services/request.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuario-mis-solicitudes',
  standalone: false,
  templateUrl: './usuario-mis-solicitudes.page.html',
  styleUrls: ['./usuario-mis-solicitudes.page.scss'],
})
export class UsuarioMisSolicitudesPage implements OnInit {
  requests: any[] = [];
  selectedRequest: any = null;

  constructor(private auth: AuthService, private req: RequestService, private router: Router) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login-usuario']);
      return;
    }
    this.requests = this.req.getRequestsByUser(user.id!);
  }

  viewDetails(r: any) {
    this.selectedRequest = r;
  }

  closeDetails() {
    this.selectedRequest = null;
  }
}
