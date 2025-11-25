import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NoteService } from '../../services/note';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-detail',
  templateUrl: './note-detail.page.html',
  styleUrls: ['./note-detail.page.scss'],
  standalone: false
})
export class NoteDetailPage {
  note: Note | undefined;

  constructor(
    private route: ActivatedRoute,
    private noteService: NoteService,
    private router: Router
  ) {
    this.loadNote();
  }

  ionViewWillEnter() {
    this.loadNote();
  }

  loadNote() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.note = this.noteService.getNoteById(id);
    }
  }

  deleteNote() {
    if (this.note) {
      this.noteService.deleteNote(this.note.id);
      this.router.navigate(['/home']);
    }
  }
}