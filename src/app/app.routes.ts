import { Routes } from '@angular/router';
import { JournalPageComponent } from './pages/journal/journal-page.component';

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
        path: '**',
        redirectTo: 'journal'
    }
];
