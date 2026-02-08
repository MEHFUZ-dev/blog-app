import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { GoogleAuthService } from '../services/google-auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { PORTFOLIO_DATA } from '../data/portfolio-data';

declare var google: any;

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit, AfterViewInit {
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  formData = {
    name: '',
    email: '',
    password: ''
  };

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
    this.renderGoogleSignUp();
  }

  renderGoogleSignUp() {
    setTimeout(() => {
      if (google && google.accounts) {
        google.accounts.id.renderButton(
          document.getElementById('googleSignUpButton'),
          { 
            theme: 'outline', 
            size: 'large',
            width: '100%',
            text: 'signup_with'
          }
        );

        // Handle credential response
        (window as any).handleGoogleSignUp = (response: any) => {
          this.handleGoogleSignUp(response.credential);
        };
      }
    }, 100);
  }

  handleGoogleSignUp(token: string) {
    console.log('Google token received for signup:', token);
    this.errorMessage = '';
    this.successMessage = '';
    
    // Verify token with backend and register
    this.auth.registerWithGoogle(token).subscribe({
      next: () => {
        console.log('Google registration successful');
        this.successMessage = 'Registration successful!';
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      },
      error: (err) => {
        console.error('Google registration error:', err);
        this.errorMessage = err?.error?.message || 'Google registration failed';
      }
    });
  }

  prefillDefaultUser(username: string) {
    // Method removed - no longer auto-filling default users
  }

  register() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.formData.name || !this.formData.email || !this.formData.password) {
      this.errorMessage = 'Name, Email, and Password are required!';
      return;
    }

    const name = this.formData.name.toLowerCase().trim();
    const email = this.formData.email.toLowerCase().trim();

    this.isLoading = true;
    this.auth.registerApi(name, email, this.formData.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Registration successful!';
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Registration failed';
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}