import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

declare var window: any;
declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  constructor(private http: HttpClient) {}

  /**
   * Initialize Google Sign-In
   */
  initializeGoogle() {
    const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (script) {
      if (google && google.accounts) {
        google.accounts.id.initialize({
          client_id: window.googleClientId,
          callback: this.handleCredentialResponse.bind(this)
        });
      }
    }
  }

  /**
   * Handle Google credential response
   */
  private handleCredentialResponse(response: any) {
    console.log('Google token received:', response.credential);
    // This will be handled in the component
  }

  /**
   * Verify Google token with backend
   */
  verifyGoogleToken(token: string): Observable<any> {
    return this.http.post('/api/auth/google', { token });
  }

  /**
   * Render Google Sign-In button
   */
  renderSignInButton(elementId: string, options?: any) {
    if (google && google.accounts) {
      google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          ...options
        }
      );
    }
  }

  /**
   * Sign out from Google
   */
  signOut() {
    if (google && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }
  }
}
