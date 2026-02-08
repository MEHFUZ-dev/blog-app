import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
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
    private router: Router,
    private isLoggedService: IsLoggedService
  ) {}

  ngOnInit() {
    // Set up global handler for Google response
    (window as any).handleGoogleLogin = (response: any) => {
      console.log('✅ Google callback triggered', response);
      if (response.credential) {
        this.handleGoogleLogin(response.credential);
      }
    };
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeGoogleSignIn();
    }, 500);
  }

  initializeGoogleSignIn() {
    if (!google || !google.accounts) {
      console.error('Google accounts library not loaded');
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: '559516392697-19mmpvsm8u9pmli96k6fft0ceqibgann.apps.googleusercontent.com',
        callback: (window as any).handleGoogleLogin
      });

      google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        { 
          theme: 'outline',
          size: 'large'
        }
      );
      console.log('✅ Google Sign-In button initialized');
    } catch (error) {
      console.error('❌ Error initializing Google Sign-In:', error);
    }
  }

  handleGoogleLogin(token: string) {
    console.log('🔵 Handling Google login...');
    this.errorMessage = '';
    this.isLoading = true;
    
    this.auth.loginWithGoogle(token).subscribe({
      next: (response) => {
        console.log('✅ Login successful:', response);
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Login failed:', err);
        // Check if it's "not found" error - ask to register
        if (err?.error?.message?.includes('not found') || err?.error?.message?.includes('register')) {
          this.errorMessage = err.error.message + '\nGo to register page to create an account.';
        } else {
          this.errorMessage = err?.error?.message || 'Login failed. Please try again.';
        }
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
        // Check if it's a Google account trying email+password login
        if (err?.error?.message?.includes('Google')) {
          this.errorMessage = err.error.message + '\nClick "Sign with Google" button above.';
        } else {
          this.errorMessage = err?.error?.message || 'Invalid credentials';
        }
      },
    });
  }
}

