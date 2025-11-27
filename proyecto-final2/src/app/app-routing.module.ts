import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  // Keep a single login route; redirect legacy login routes to the single login page
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'login-select',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login-usuario',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login-admin',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  // Single register route; redirect legacy register path
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'register-usuario',
    redirectTo: 'register',
    pathMatch: 'full'
  },
  {
    path: 'usuario-dashboard',
    loadChildren: () => import('./usuario/usuario-dashboard/usuario-dashboard.module').then(m => m.UsuarioDashboardPageModule)
  },
  {
    path: 'usuario-solicitud',
    loadChildren: () => import('./usuario/usuario-solicitud/usuario-solicitud.module').then(m => m.UsuarioSolicitudPageModule)
  },
  {
    path: 'usuario-mis-solicitudes',
    loadChildren: () => import('./usuario/usuario-mis-solicitudes/usuario-mis-solicitudes.module').then(m => m.UsuarioMisSolicitudesPageModule)
  },
  {
    path: 'admin-dashboard',
    loadChildren: () => import('./admin/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardPageModule)
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'vehicles',
    loadChildren: () =>
      import('./vehicles/vehicles.module').then(m => m.VehiclesPageModule)
  },
  {
    path: 'vehicle-form',
    loadChildren: () =>
      import('./vehicle-form/vehicle-form.module').then(m => m.VehicleFormPageModule)
  },
  {
    path: 'alerts',
    loadChildren: () =>
      import('./alerts/alerts.module').then(m => m.AlertsPageModule)
  },
  {
    path: 'expenses',
    loadChildren: () =>
      import('./expenses/expenses.module').then(m => m.ExpensesPageModule)
  },
  {
    path: 'stats',
    loadChildren: () =>
      import('./stats/stats.module').then(m => m.StatsPageModule)
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./settings/settings.module').then(m => m.SettingsPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.module').then(m => m.TabsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}

