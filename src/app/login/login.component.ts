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
    this.googleAuth.initializeGoogle();
  }

  ngAfterViewInit() {
    this.renderGoogleSignIn();
  }

  renderGoogleSignIn() {
    setTimeout(() => {
      if (google && google.accounts) {
        // Create a callback for Google Sign-In
        (window as any).handleGoogleSignIn = (response: any) => {
          this.handleGoogleLogin(response.credential);
        };

        // Render the button with the callback
        google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          { 
            theme: 'outline', 
            size: 'large',
            width: '100%',
            text: 'signin_with',
            callback: (window as any).handleGoogleSignIn
          }
        );
      }
    }, 100);
  }

  handleGoogleLogin(token: string) {
    console.log('Google token received');
    this.errorMessage = '';
    this.isLoading = true;
    
    // Verify token with backend
    this.auth.loginWithGoogle(token).subscribe({
      next: () => {
        console.log('Google login successful');
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Google login error:', err);
        this.errorMessage = err?.error?.message || 'Google login failed. Please try again.';
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

