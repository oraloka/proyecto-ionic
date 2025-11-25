import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactService } from '../services/contact';
import { Contact } from '../models/contact';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './contact-form.page.html',
})
export class ContactFormPage implements OnInit {
  contact: Contact = { id: 0, name: '', phone: '', email: '' };
  isEdit = false;

  constructor(
    private contactService: ContactService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (id) {
      const existing = this.contactService.getById(id);
      if (existing) {
        this.contact = { ...existing };
        this.isEdit = true;
      }
    }
  }

  save() {
    if (this.isEdit) {
      this.contactService.update(this.contact.id, this.contact);
    } else {
      this.contactService.add(this.contact);
    }
    this.router.navigate(['/home']);
  }
}