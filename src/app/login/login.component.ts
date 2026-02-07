import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { PORTFOLIO_DATA } from '../data/portfolio-data';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  otp: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  
  // OTP flow state
  showOtpScreen: boolean = false;
  userId: string = '';
  otpEmail: string = '';
  resendTimer: number = 0;

  constructor(
    private auth: AuthService,
    private router: Router,
    private isLoggedService: IsLoggedService
  ) {}

  login() {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    const email = this.email.toLowerCase().trim();
    this.auth.loginApi(email, this.password).subscribe({
      next: (res) => {
        this.userId = res.userId;
        this.otpEmail = res.email;
        this.successMessage = 'OTP sent to your email!';
        this.showOtpScreen = true;
        this.email = '';
        this.password = '';
        this.startResendTimer();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Invalid credentials';
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

    this.auth.verifyOtp(this.userId, this.otp, 'login').subscribe({
      next: () => {
        this.successMessage = 'Login successful!';
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      },
      error: (err) => {
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
}

