// auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SessionExpiryService } from '../session-expiry.service';

interface LoginResponse {
  bearer: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/connexion';

  constructor(
    private http: HttpClient,
    private sessionExpiryService: SessionExpiryService
  ) {}

  login(credentials: { email: string; motDePasse: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}`, credentials);
    
  }

  logout() {
    localStorage.removeItem('token');
    // Redirection vers login après déconnexion
    window.location.href = '/login';
  }

  // Nouvelle méthode pour logout silencieux (sans redirection)
  silentLogout() {
    localStorage.removeItem('token');
  }

  // Méthode pour forcer l'affichage du modal d'expiration
  handleTokenExpiration() {
    this.silentLogout();
    this.sessionExpiryService.showSessionExpiredModal();
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    
    // Vérification basique de l'expiration du token JWT
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Si le token est expiré
      if (payload.exp && payload.exp < currentTime) {
        // Utiliser la nouvelle méthode pour gérer l'expiration
        this.handleTokenExpiration();
        return false;
      }
      
      return true;
    } catch (error) {
      // Si le token est malformé
      this.silentLogout();
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Supposons que le rôle soit stocké dans le payload du token
      return payload.role === 'ADMIN' ;
    } catch (error) {
      return false;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role ;
    } catch (error) {
      return null;
    }
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id ;
    } catch (error) {
      return null;
    }
  }
}
