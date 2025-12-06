import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'shared-navbar',
  imports: [RouterModule, CommonModule],
  template: `
  <nav class="modern-navbar">
    <div class="navbar-container">
      <div class="navbar-brand-section">
        <a class="navbar-brand" routerLink="/dashboard">
          <span class="brand-icon">📔</span>
          <span class="brand-text">SoulNote</span>
        </a>
      </div>
      
      <button class="navbar-toggler" type="button" (click)="toggleMenu()" [attr.aria-expanded]="menuOpen">
        <span class="toggler-line" [class.active]="menuOpen"></span>
        <span class="toggler-line" [class.active]="menuOpen"></span>
        <span class="toggler-line" [class.active]="menuOpen"></span>
      </button>
      
      <div class="navbar-menu" [class.active]="menuOpen" *ngIf="authService.isAuthenticated()">
        <ul class="nav-links">
          <li class="nav-item">
            <a class="nav-link" routerLink="/dashboard" routerLinkActive="active" (click)="closeMenu()">
              <span class="nav-icon">📊</span>
              <span class="nav-text">Dashboard</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/journal" routerLinkActive="active" (click)="closeMenu()">
              <span class="nav-icon">📝</span>
              <span class="nav-text">Journal</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/scanandupload" routerLinkActive="active" (click)="closeMenu()">
              <span class="nav-icon">📷</span>
              <span class="nav-text">Scan & Upload</span>
            </a>
          </li>
        </ul>
        
        <div class="user-section">
          <div class="user-dropdown" (click)="toggleUserMenu()">
            <div class="user-avatar">
              <span class="avatar-text">{{ getInitials() }}</span>
            </div>
            <div class="user-info">
              <span class="user-name">{{ authService.currentUser()?.name || 'User' }}</span>
              <span class="user-email">{{ authService.currentUser()?.email || '' }}</span>
            </div>
            <span class="dropdown-arrow" [class.open]="userMenuOpen">▼</span>
          </div>
          
          <div class="user-dropdown-menu" [class.show]="userMenuOpen">
            <div class="dropdown-header">
              <div class="dropdown-avatar">
                <span class="avatar-text">{{ getInitials() }}</span>
              </div>
              <div class="dropdown-user-info">
                <div class="dropdown-name">{{ authService.currentUser()?.name || 'User' }}</div>
                <div class="dropdown-email">{{ authService.currentUser()?.email || '' }}</div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" (click)="logout(); closeMenu();">
              <span class="item-icon">🚪</span>
              <span class="item-text">Logout</span>
            </a>
          </div>
        </div>
      </div>
      
      <div class="navbar-menu" [class.active]="menuOpen" *ngIf="!authService.isAuthenticated()">
        <ul class="nav-links">
          <li class="nav-item">
            <a class="nav-link btn-nav" routerLink="/login" routerLinkActive="active" (click)="closeMenu()">
              <span class="nav-text">Login</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link btn-nav btn-primary-nav" routerLink="/signup" routerLinkActive="active" (click)="closeMenu()">
              <span class="nav-text">Sign Up</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
      
      :host {
        display: block;
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .modern-navbar {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        border-bottom: 1px solid rgba(102, 126, 234, 0.1);
        font-family: 'Poppins', sans-serif;
        transition: all 0.3s ease;
      }

      .navbar-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 1rem 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .navbar-brand-section {
        display: flex;
        align-items: center;
      }

      .navbar-brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        color: #1a202c;
        font-size: 1.5rem;
        font-weight: 800;
        transition: all 0.3s ease;
      }

      .navbar-brand:hover {
        transform: scale(1.05);
      }

      .brand-icon {
        font-size: 2rem;
        animation: bounce 2s ease-in-out infinite;
      }

      .brand-text {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .navbar-toggler {
        display: none;
        flex-direction: column;
        gap: 5px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        z-index: 1001;
      }

      .toggler-line {
        width: 25px;
        height: 3px;
        background: #667eea;
        border-radius: 3px;
        transition: all 0.3s ease;
      }

      .toggler-line.active:nth-child(1) {
        transform: rotate(45deg) translate(8px, 8px);
      }

      .toggler-line.active:nth-child(2) {
        opacity: 0;
      }

      .toggler-line.active:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -7px);
      }

      .navbar-menu {
        display: flex;
        align-items: center;
        gap: 2rem;
        flex: 1;
        justify-content: space-between;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .nav-item {
        position: relative;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        text-decoration: none;
        color: #4a5568;
        font-weight: 500;
        font-size: 0.95rem;
        border-radius: 12px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .nav-link::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
      }

      .nav-link:hover {
        color: white;
        transform: translateY(-2px);
      }

      .nav-link:hover::before {
        opacity: 1;
      }

      .nav-link.active {
        color: white;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }

      .nav-icon {
        font-size: 1.2rem;
      }

      .nav-text {
        font-weight: 600;
      }

      .btn-nav {
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        border: 2px solid #e2e8f0;
        background: transparent;
      }

      .btn-nav:hover {
        border-color: #667eea;
        color: #667eea;
      }

      .btn-primary-nav {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
      }

      .btn-primary-nav:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        color: white;
      }

      .user-section {
        position: relative;
      }

      .user-dropdown {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 1rem;
        background: #f8f9fa;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
      }

      .user-dropdown:hover {
        background: #f1f3f5;
        border-color: #667eea;
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 0.9rem;
        flex-shrink: 0;
      }

      .avatar-text {
        line-height: 1;
      }

      .user-info {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
      }

      .user-name {
        font-weight: 600;
        color: #1a202c;
        font-size: 0.9rem;
        line-height: 1.2;
      }

      .user-email {
        font-size: 0.75rem;
        color: #718096;
        line-height: 1.2;
      }

      .dropdown-arrow {
        font-size: 0.7rem;
        color: #718096;
        transition: transform 0.3s ease;
      }

      .dropdown-arrow.open {
        transform: rotate(180deg);
      }

      .user-dropdown-menu {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        min-width: 250px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        border: 1px solid #e2e8f0;
        z-index: 1000;
      }

      .user-dropdown-menu.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .dropdown-header {
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .dropdown-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 1.1rem;
        flex-shrink: 0;
      }

      .dropdown-user-info {
        flex: 1;
      }

      .dropdown-name {
        font-weight: 700;
        color: #1a202c;
        font-size: 1rem;
        margin-bottom: 0.25rem;
      }

      .dropdown-email {
        font-size: 0.85rem;
        color: #718096;
      }

      .dropdown-divider {
        height: 1px;
        background: #e2e8f0;
        margin: 0.5rem 0;
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        text-decoration: none;
        color: #dc3545;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 0;
      }

      .dropdown-item:hover {
        background: #fee;
        color: #dc3545;
      }

      .item-icon {
        font-size: 1.2rem;
      }

      .item-text {
        font-size: 0.95rem;
      }

      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }

      @media (max-width: 992px) {
        .navbar-toggler {
          display: flex;
        }

        .navbar-menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: white;
          flex-direction: column;
          justify-content: flex-start;
          padding: 5rem 2rem 2rem;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index: 1000;
          overflow-y: auto;
        }

        .navbar-menu.active {
          transform: translateX(0);
        }

        .nav-links {
          flex-direction: column;
          width: 100%;
          gap: 0.5rem;
        }

        .nav-link {
          width: 100%;
          justify-content: flex-start;
          padding: 1rem 1.5rem;
        }

        .user-section {
          width: 100%;
          margin-top: 2rem;
        }

        .user-dropdown {
          width: 100%;
          justify-content: flex-start;
        }

        .user-dropdown-menu {
          position: static;
          width: 100%;
          margin-top: 1rem;
        }
      }

      @media (max-width: 576px) {
        .navbar-container {
          padding: 1rem;
        }

        .navbar-brand {
          font-size: 1.25rem;
        }

        .brand-icon {
          font-size: 1.5rem;
        }

        .user-info {
          display: none;
        }
      }
    `,
  ]
})
export class SharedNavbarComponent {
  menuOpen = false;
  userMenuOpen = false;

  constructor(public authService: AuthService) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      this.userMenuOpen = false;
    }
  }

  closeMenu() {
    this.menuOpen = false;
    this.userMenuOpen = false;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return 'U';
    
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    
    const name = user.name || user.firstName || user.email || 'User';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  logout() {
    this.authService.logout();
    this.closeMenu();
  }
}
