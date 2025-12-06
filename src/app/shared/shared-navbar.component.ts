import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'shared-navbar',
  imports: [RouterModule],
  template: `
  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container-fluid">
      <a class="navbar-brand" routerLink="/">SoulNote</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav" aria-controls="nav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="nav">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link" routerLink="/journal" routerLinkActive="active">Journal</a>
          </li>
          <!-- Add more links if needed -->
        </ul>
         <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link" routerLink="/scanandupload" routerLinkActive="active">Scan and Upload</a>
          </li>
          <!-- Add more links if needed -->
        </ul>
      </div>
    </div>
  </nav>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      /* Gradient Background */
      .navbar {
        background: linear-gradient(90deg, rgba(0, 102, 255, 1) 0%, rgba(255, 94, 77, 1) 100%);
        transition: background 0.5s ease-in-out;
      }

      /* Hover Effects for Navbar */
      .navbar:hover {
        background: linear-gradient(90deg, rgba(0, 102, 255, 1) 0%, rgba(0, 255, 255, 1) 100%);
      }

      .navbar-brand {
        font-size: 1.7rem;
        font-weight: bold;
        color: #ffffff;
        transition: color 0.3s ease;
      }

      .navbar-brand:hover {
        color: #ffd700; /* Gold on hover */
      }

      .navbar-nav .nav-link {
        font-size: 1.1rem;
        font-weight: 500;
        color: #ffffff;
        margin: 0 20px;
        transition: color 0.3s ease, transform 0.2s ease;
      }

      /* Hover Effects for Links */
      .navbar-nav .nav-link:hover {
        color: #ffeb3b; /* Yellow */
        transform: scale(1.1); /* Slight scale effect */
      }

      /* Navbar Toggle Button Color */
      .navbar-toggler-icon {
        background-color: #ffffff;
        transition: background-color 0.3s ease;
      }

      .navbar-toggler-icon:hover {
        background-color: #ffeb3b;
      }

      /* Responsive UI Enhancements */
      @media (max-width: 992px) {
        .navbar-nav {
          text-align: center;
          width: 100%;
        }
        .navbar-nav .nav-item {
          margin-bottom: 15px;
        }
      }

      @media (max-width: 576px) {
        .navbar-brand {
          font-size: 1.5rem;
        }
      }
    `,
  ]
})
export class SharedNavbarComponent {}
