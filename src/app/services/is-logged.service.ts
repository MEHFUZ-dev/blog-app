import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IsLoggedService {

  isLoggedIn = false;
  showLogin = false;
  showRegister = false;

  constructor() {
    // Check localStorage on service initialization
    this.checkLoggedInStatus();
  }

  openLogin() {
    this.showLogin = true;
    this.showRegister = false;
    this.isLoggedIn = false;
  }
  
  loginSuccess(token?: any) {
    this.isLoggedIn = true;
    this.showLogin = false;
    this.showRegister = false;
    localStorage.setItem('isLoggedIn', 'true');
  }

  openRegister() {
    this.showLogin = false;
    this.showRegister = true;
  }

  logout() {
    this.isLoggedIn = false;
    this.showLogin = true;
    this.showRegister = false;
    localStorage.removeItem('isLoggedIn');
  }

  checkLoggedInStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
  }
}
