import { Injectable } from '@angular/core';
import { Contact } from '../models/contact';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private contacts: Contact[] = [];
  private storageKey = 'contacts';

  constructor() {
    this.loadContacts();
  }

  private loadContacts() {
    const stored = localStorage.getItem(this.storageKey);
    this.contacts = stored ? JSON.parse(stored) : [];
  }

  private saveContacts() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.contacts));
  }

  getAll(): Contact[] {
    return this.contacts;
  }

  getById(id: number): Contact | undefined {
    return this.contacts.find(c => c.id === id);
  }

  add(contact: Contact) {
    contact.id = this.contacts.length ? Math.max(...this.contacts.map(c => c.id)) + 1 : 1;
    this.contacts.push(contact);
    this.saveContacts();
  }

  update(id: number, updated: Contact) {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index !== -1) {
      this.contacts[index] = { ...updated, id };
      this.saveContacts();
    }
  }

  delete(id: number) {
    this.contacts = this.contacts.filter(c => c.id !== id);
    this.saveContacts();
  }
}