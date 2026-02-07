import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { PORTFOLIO_DATA } from '../data/portfolio-data';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  // OTP flow state
  showOtpScreen: boolean = false;
  userId: string = '';
  otpEmail: string = '';
  otp: string = '';
  resendTimer: number = 0;

  formData = {
    name: '',
    email: '',
    password: ''
  };

  constructor(private auth: AuthService, private router: Router, private isLoggedService: IsLoggedService) {}

  ngOnInit() {
    // Check if username is provided in query params to pre-fill
    // This allows pre-filling default user data
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
      next: (res) => {
        this.isLoading = false;
        this.userId = res.userId;
        this.otpEmail = res.email;
        this.successMessage = 'OTP sent to your email!';
        this.showOtpScreen = true;
        this.formData = { name: '', email: '', password: '' };
        this.startResendTimer();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Registration failed';
      },
    });
  }

  verifyOtp() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.otp.trim() || this.otp.length !== 6) {
      this.errorMessage = 'Please enter a valid 6-digit OTP';
      return;
    }

    this.isLoading = true;
    this.auth.verifyOtp(this.userId, this.otp, 'register').subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Registration successful!';
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Invalid OTP';
      },
    });
  }

  resendOtp() {
    this.errorMessage = '';
    this.successMessage = '';
    
    this.auth.resendOtp(this.userId).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'OTP resent to your email!';
        this.startResendTimer();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to resend OTP';
      },
    });
  }

  startResendTimer() {
    this.resendTimer = 60;
    const interval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  goBack() {
    this.showOtpScreen = false;
    this.otp = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}