import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-usuario-dashboard',
  standalone: false,
  templateUrl: './usuario-dashboard.page.html',
  styleUrls: ['./usuario-dashboard.page.scss'],
})
export class UsuarioDashboardPage implements OnInit {
  user: User | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login-usuario']);
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login-select']);
  }
}
