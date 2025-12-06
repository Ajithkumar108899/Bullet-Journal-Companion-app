import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // If user is already authenticated, redirect to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }
  features = [
    {
      icon: '📝',
      title: 'Digital Journaling',
      description: 'Create, organize, and manage your journal entries with ease. Track tasks, notes, events, and habits all in one place.'
    },
    {
      icon: '📷',
      title: 'OCR Scanning',
      description: 'Upload and scan your handwritten journal pages. Extract text automatically and convert your physical notes to digital format.'
    },
    {
      icon: '📊',
      title: 'Smart Dashboard',
      description: 'Get insights into your journaling habits with beautiful statistics and overview of your entries.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your journal entries are stored securely. Your thoughts and memories are safe with us.'
    },
    {
      icon: '📅',
      title: 'Event Tracking',
      description: 'Never miss important events. Schedule and track your upcoming activities and appointments.'
    },
    {
      icon: '✅',
      title: 'Task Management',
      description: 'Organize your tasks, mark them complete, and stay productive with our intuitive task management system.'
    }
  ];

  benefits = [
    {
      icon: '🚀',
      title: 'Get Started in Seconds',
      description: 'Simple signup process, start journaling immediately'
    },
    {
      icon: '💡',
      title: 'Easy to Use',
      description: 'Intuitive interface designed for everyone'
    },
    {
      icon: '📱',
      title: 'Responsive Design',
      description: 'Works perfectly on all devices - desktop, tablet, mobile'
    }
  ];
}

