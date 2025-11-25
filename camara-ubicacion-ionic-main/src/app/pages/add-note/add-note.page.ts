import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { NoteService } from '../../services/note'; // ← CORREGIDO: .service
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.page.html',
  styleUrls: ['./add-note.page.scss'],
  standalone: false
})
export class AddNotePage {
  title = '';
  content = '';
  photo: string | undefined;
  latitude: number | undefined;
  longitude: number | undefined;

  constructor(private noteService: NoteService, private router: Router) {}

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,  // ← WEBCAM EN NAVEGADOR
        allowEditing: false
      });
      this.photo = image.webPath!;
    } catch (error) {
      console.error('Error en cámara:', error);
      alert('No se pudo acceder a la cámara. Revisa permisos.');
    }
  }

  async getLocation() {
    try {
      const pos = await Geolocation.getCurrentPosition();
      this.latitude = pos.coords.latitude;
      this.longitude = pos.coords.longitude;
    } catch (error) {
      alert('No se pudo obtener ubicación. Activa en DevTools → Sensors.');
    }
  }

  saveNote() {
    if (!this.title || !this.content) return;
    const note = {
      id: uuidv4(),
      title: this.title,
      content: this.content,
      photo: this.photo,
      latitude: this.latitude,
      longitude: this.longitude,
      createdAt: new Date()
    };
    this.noteService.saveNote(note);
    this.router.navigate(['/home']);
  }
}