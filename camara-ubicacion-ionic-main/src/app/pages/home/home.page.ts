import { Component } from '@angular/core';
import { NoteService } from '../../services/note';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage {
  notes: Note[] = [];

  constructor(private noteService: NoteService) {
    this.loadNotes();
  }

  ionViewWillEnter() {
    this.loadNotes();
  }

  loadNotes() {
    this.notes = this.noteService.getNotes();
  }
}