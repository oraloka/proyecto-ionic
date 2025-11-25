// src/app/services/note.service.ts
import { Injectable } from '@angular/core';
import { Note } from '../models/note.model';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private key = 'notes';

  getNotes(): Note[] {
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  }

  saveNote(note: Note) {
    const notes = this.getNotes();
    notes.push(note);
    localStorage.setItem(this.key, JSON.stringify(notes));
  }

  getNoteById(id: string): Note | undefined {
    return this.getNotes().find(n => n.id === id);
  }

  deleteNote(id: string) {
    const notes = this.getNotes().filter(n => n.id !== id);
    localStorage.setItem(this.key, JSON.stringify(notes));
  }
}