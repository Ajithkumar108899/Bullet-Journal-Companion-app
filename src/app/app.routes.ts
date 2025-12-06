import { Routes } from '@angular/router';
import { JournalPageComponent } from './pages/journal/journal-page.component';
import { OcrUpload } from './pages/ocr-upload/ocr-upload';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'journal',
        pathMatch: 'full'
    },
    {
        path: 'journal',
        component: JournalPageComponent
    },
    {
        path: 'scanandupload',
        component: OcrUpload
    },
    {
        path: '**',
        redirectTo: 'journal'
    }
];
