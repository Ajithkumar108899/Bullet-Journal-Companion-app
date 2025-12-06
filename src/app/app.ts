import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedNavbarComponent } from './shared/shared-navbar.component';
import { JournalPageComponent } from "./pages/journal/journal-page.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SharedNavbarComponent, JournalPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Bullet-Journal-Companion-app');
}
