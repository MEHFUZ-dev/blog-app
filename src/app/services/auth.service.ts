import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { IsLoggedService } from './is-logged.service';
import { API_BASE_URL } from '../api.config';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: string | null = null;
  private STORAGE_KEY = 'PORTFOLIO_USERS';

  constructor(private isLoggedService: IsLoggedService, private http: HttpClient) {}

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  login(username: string) {
    this.currentUser = username;
    localStorage.setItem('CURRENT_USER', username);
    this.isLoggedService.loginSuccess(username);
  }

  loginApi(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('authToken', res.token);
          this.login(res.user.name);
        }),
      );
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('CURRENT_USER');
    localStorage.removeItem('authToken');
    this.isLoggedService.logout();
  }

  getCurrentUser() {
    if (!this.currentUser) {
      this.currentUser = localStorage.getItem('CURRENT_USER');
    }
    return this.currentUser;
  }

  isLoggedInStatus(): boolean {
    return this.currentUser !== null;
  }

  registerApi(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/register`, { name, email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('authToken', res.token);
          this.login(res.user.name);
        }),
      );
  }

  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${API_BASE_URL}/auth/profile`);
  }

  // Register a new user in localStorage
  registerUser(email: string, username: string, password: string): boolean {
    const users = this.getAllUsers();

    // Check if email or username already exists
    for (let user of Object.values(users)) {
      if ((user as any).email === email || (user as any).username === username) {
        return false; // Already exists
      }
    }

    // Store user in localStorage
    users[email] = {
      username,
      email,
      password,
      name: '',
      role: '',
      about: '',
      skills: [],
      projects: [],
      contact: {
        email,
        github: ''
      }
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    return true; // Success
  }

  // Get all users from localStorage
  private getAllUsers(): any {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  // Check if user exists by email
  userExists(email: string): boolean {
    const users = this.getAllUsers();
    return email in users;
  }

  // Get user by email
  getUserByEmail(email: string): any {
    const users = this.getAllUsers();
    return users[email] || null;
  }

  // Get user by username
  getUserByUsername(username: string): any {
    const users = this.getAllUsers();
    for (let user of Object.values(users)) {
      if ((user as any).username === username) {
        return user;
      }
    }
    return null;
  }

  /**
   * Login with email only (for admin users)
   */
  loginWithEmailOnly(email: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/email-login`, { email })
      .pipe(
        tap((res) => {
          localStorage.setItem('authToken', res.token);
          this.login(res.user.name);
        }),
      );
  }

  /**
   * Login with Google OAuth token
   */
  loginWithGoogle(token: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/google/login`, { token })
      .pipe(
        tap((res) => {
          localStorage.setItem('authToken', res.token);
          this.login(res.user.name);
        }),
      );
  }

  /**
   * Register with Google OAuth token
   */
  registerWithGoogle(token: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/google/register`, { token })
      .pipe(
        tap((res) => {
          localStorage.setItem('authToken', res.token);
          this.login(res.user.name);
        }),
      );
  }
}
