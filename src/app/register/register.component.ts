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