import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { GoogleAuthService } from '../services/google-auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { PORTFOLIO_DATA } from '../data/portfolio-data';

declare var google: any;

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, AfterViewInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private auth: AuthService,
    private googleAuth: GoogleAuthService,
    private router: Router,
    private isLoggedService: IsLoggedService
  ) {}

  ngOnInit() {
    this.googleAuth.initializeGoogle();
  }

  ngAfterViewInit() {
    this.renderGoogleSignIn();
  }

  renderGoogleSignIn() {
    setTimeout(() => {
      if (google && google.accounts) {
        google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          { 
            theme: 'outline', 
            size: 'large',
            width: '100%',
            text: 'signin_with'
          }
        );

        google.accounts.id.promptAsync((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Auto-prompt was not displayed
          }
        });

        // Handle credential response
        (window as any).handleGoogleCredential = (response: any) => {
          this.handleGoogleLogin(response.credential);
        };
      }
    }, 100);
  }

  handleGoogleLogin(token: string) {
    console.log('Google token received:', token);
    this.errorMessage = '';
    
    // Verify token with backend
    this.auth.loginWithGoogle(token).subscribe({
      next: () => {
        console.log('Google login successful');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Google login error:', err);
        this.errorMessage = err?.error?.message || 'Google login failed';
      }
    });
  }

  login() {
    this.errorMessage = '';
    
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    const email = this.email.toLowerCase().trim();
    this.auth.loginApi(email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Invalid credentials';
      },
    });
  }
}

