import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonBackButton, IonButtons, IonText } from '@ionic/angular/standalone';
import { ContactService } from '../services/contact';
import { Contact } from '../models/contact';

@Component({
  selector: 'app-contact-detail',
  templateUrl: './contact-detail.page.html',
  styleUrls: ['./contact-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader,IonText, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonBackButton, IonButtons, CommonModule, FormsModule]
})
export class ContactDetailPage implements OnInit {
  contact: Contact | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.contact = this.contactService.getById(+id) || null;
    }
  }

  editContact() {
    if (this.contact) {
      this.router.navigate(['/contact-form', this.contact.id]);
    }
  }

  deleteContact() {
    if (this.contact && confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      this.contactService.delete(this.contact.id);
      this.router.navigate(['/home']);
    }
  }
}
