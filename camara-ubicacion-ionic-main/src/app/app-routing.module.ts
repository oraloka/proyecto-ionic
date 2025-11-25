import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'add-note',
    loadChildren: () => import('./pages/add-note/add-note.module').then(m => m.AddNotePageModule)
  },
  {
    path: 'note-detail/:id',
    loadChildren: () => import('./pages/note-detail/note-detail.module').then(m => m.NoteDetailPageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}