import { Routes } from '@angular/router';
import { JournalPageComponent } from './pages/journal/journal-page.component';
import { OcrUpload } from './pages/ocr-upload/ocr-upload';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [loginGuard]
    },
    {
        path: 'signup',
        component: SignupComponent,
        canActivate: [loginGuard]
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {
        path: 'journal',
        component: JournalPageComponent,
        canActivate: [authGuard]
    },
    {
        path: 'scanandupload',
        component: OcrUpload,
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
