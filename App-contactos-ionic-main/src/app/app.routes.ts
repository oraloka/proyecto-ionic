import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: 'contact-form',
    loadComponent: () => import('./contact-form/contact-form.page').then(m => m.ContactFormPage)
  },
  {
    path: 'contact-form/:id',  // Para editar un contacto específico
    loadComponent: () => import('./contact-form/contact-form.page').then(m => m.ContactFormPage)
  },
  {
    path: 'contact-detail/:id',
    loadComponent: () => import('./contact-detail/contact-detail.page').then( m => m.ContactDetailPage)
  }
];