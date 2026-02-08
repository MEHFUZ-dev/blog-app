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
  isLoading: boolean = false;

  constructor(
    private auth: AuthService,
    private googleAuth: GoogleAuthService,
    private router: Router,
    private isLoggedService: IsLoggedService
  ) {}

  ngOnInit() {
    // Set global callback for Google response
    (window as any).handleGoogleCredential = (response: any) => {
      console.log('Google response received:', response);
      if (response.credential) {
        this.handleGoogleLogin(response.credential);
      }
    };

    // Initialize Google
    if (google && google.accounts) {
      google.accounts.id.initialize({
        client_id: window.googleClientId,
        callback: (window as any).handleGoogleCredential
      });
    }
  }

  ngAfterViewInit() {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      this.renderGoogleSignIn();
    }, 50);
  }

  renderGoogleSignIn() {
    if (google && google.accounts) {
      // Just render the button, initialization is done in ngOnInit
      google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        { 
          theme: 'outline', 
          size: 'large',
          width: '350'
        }
      );
      console.log('Google Sign-In button rendered');
    }
  }

  handleGoogleLogin(token: string) {
    console.log('Google token received - starting login');
    this.errorMessage = '';
    this.isLoading = true;
    
    console.log('Sending token to backend...');
    
    // Verify token with backend
    this.auth.loginWithGoogle(token).subscribe({
      next: (response) => {
        console.log('✅ Google login response:', response);
        this.isLoading = false;
        console.log('Navigating to home');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Google login error:', err);
        const errorMsg = err?.error?.message || err?.message || 'Google login failed';
        console.error('Error details:', errorMsg);
        this.errorMessage = errorMsg;
      }
    });
  }

  login() {
    this.errorMessage = '';
    
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.isLoading = true;
    const email = this.email.toLowerCase().trim();
    this.auth.loginApi(email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Invalid credentials';
      },
    });
  }
}

