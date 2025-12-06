import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SharedNavbarComponent } from './shared/shared-navbar.component';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SharedNavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Bullet-Journal-Companion-app');
  currentPath = signal('');
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Track current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentPath.set(event.url);
      });
    
    // Set initial path
    this.currentPath.set(this.router.url);
  }
  
  get currentUser() {
    return this.authService.currentUser;
  }
  
  showNavbar = computed(() => {
    const path = this.currentPath();
    // Hide navbar on home page
    return path !== '/' && path !== '';
  });
}
