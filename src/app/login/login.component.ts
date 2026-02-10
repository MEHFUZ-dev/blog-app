import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';

declare var google: any;

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, AfterViewInit {
  email: string = '';
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
          size: 'large',
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
        this.errorMessage = err?.error?.message || 'Please register with Google first.';
      }
    });
  }

  login() {
    this.errorMessage = '';
    
    if (!this.email.trim()) {
      this.errorMessage = 'Please enter email';
      return;
    }

    this.isLoading = true;
    const email = this.email.toLowerCase().trim();
    
    this.auth.loginWithEmailOnly(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        // Check if user not found
        if (err?.error?.message?.includes('not found')) {
          this.errorMessage = 'Account not found. Please register first.';
        } else {
          this.errorMessage = err?.error?.message || 'Login failed';
        }
      },
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}

