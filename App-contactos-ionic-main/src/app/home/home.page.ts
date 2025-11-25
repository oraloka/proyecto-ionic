import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ContactService } from '../services/contact';
import { Router } from '@angular/router';
import { Contact } from '../models/contact';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './home.page.html',
})
export class HomePage implements OnInit {
  contacts: Contact[] = [];

  constructor(private contactService: ContactService, private router: Router) {}

  ngOnInit() {
    this.contacts = this.contactService.getAll();
  }

  addContact() {
    this.router.navigate(['/contact-form']);
  }

  viewContact(id: number) {
    this.router.navigate(['/contact-detail', id]);
  }

  editContact(id: number) {
    this.router.navigate(['/contact-form', id]);
  }

  deleteContact(id: number) {
    this.contactService.delete(id);
    this.contacts = this.contactService.getAll();
  }
}