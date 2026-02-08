import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';

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
    private router: Router, 
    private isLoggedService: IsLoggedService
  ) {}

  ngOnInit() {
    // Set up global handler for Google response
    (window as any).handleGoogleSignUp = (response: any) => {
      console.log('✅ Google callback triggered', response);
      if (response.credential) {
        this.handleGoogleSignUp(response.credential);
      }
    };
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeGoogleSignUp();
    }, 500);
  }

  initializeGoogleSignUp() {
    if (!google || !google.accounts) {
      console.error('Google accounts library not loaded');
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: '559516392697-19mmpvsm8u9pmli96k6fft0ceqibgann.apps.googleusercontent.com',
        callback: (window as any).handleGoogleSignUp
      });

      google.accounts.id.renderButton(
        document.getElementById('googleSignUpButton'),
        { 
          theme: 'outline',
          size: 'large'
        }
      );
      console.log('✅ Google Sign-Up button initialized');
    } catch (error) {
      console.error('❌ Error initializing Google Sign-Up:', error);
    }
  }

  handleGoogleSignUp(token: string) {
    console.log('🔵 Handling Google sign up...');
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;
    
    console.log('Sending token to backend...');
    
    this.auth.registerWithGoogle(token).subscribe({
      next: (response) => {
        console.log('✅ Google registration response:', response);
        this.isLoading = false;
        this.successMessage = 'Registration successful!';
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Google registration error:', err);
        // Check if it's "already exists" error
        if (err?.error?.message?.includes('already exists')) {
          this.errorMessage = err.error.message + '\nPlease use the login page instead.';
        } else {
          this.errorMessage = err?.error?.message || 'Google registration failed. Please try again.';
        }
      }
    });
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