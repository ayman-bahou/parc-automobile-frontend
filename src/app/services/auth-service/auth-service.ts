// auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SessionExpiryService } from '../session-expiry.service';

interface LoginResponse {
  bearer: string;
}

interface TokenPayload {
  id: number;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/connexion';
  private _tokenPayload: TokenPayload | null = null;
  private _currentUser = new BehaviorSubject<TokenPayload | null>(null);
  
  // Observable pour que les composants puissent s'abonner aux changements d'utilisateur
  public currentUser$ = this._currentUser.asObservable();

  constructor(
    private http: HttpClient,
    private sessionExpiryService: SessionExpiryService
  ) {
    // Initialiser le payload au démarrage du service
    this.initializeUserFromToken();
  }

  private initializeUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      try {
        const payload = this.parseTokenPayload(token);
        if (payload && this.isTokenValid(payload)) {
          this._tokenPayload = payload;
          this._currentUser.next(payload);
        } else {
          this.handleTokenExpiration();
        }
      } catch (error) {
        this.silentLogout();
      }
    }
  }

  private parseTokenPayload(token: string): TokenPayload | null {
    try {
      return JSON.parse(atob(token.split('.')[1])) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  private isTokenValid(payload: TokenPayload): boolean {
    const currentTime = Date.now() / 1000;
    return !!(payload.exp && payload.exp > currentTime);
  }

  // Méthode optimisée pour obtenir le payload du token
  getTokenPayload(): TokenPayload | null {
    if (this._tokenPayload) {
      // Vérifier si le token est toujours valide
      if (this.isTokenValid(this._tokenPayload)) {
        return this._tokenPayload;
      } else {
        this.handleTokenExpiration();
        return null;
      }
    }

    // Si pas de payload en cache, le récupérer depuis le token
    const token = this.getToken();
    if (token) {
      const payload = this.parseTokenPayload(token);
      if (payload && this.isTokenValid(payload)) {
        this._tokenPayload = payload;
        this._currentUser.next(payload);
        return payload;
      }
    }

    return null;
  }

  // Méthode optimisée pour obtenir l'ID utilisateur
  getCurrentUserId(): number | null {
    const payload = this.getTokenPayload();
    return payload?.id || null;
  }

  // Méthode optimisée pour obtenir l'email utilisateur
  getCurrentUserEmail(): string | null {
    const payload = this.getTokenPayload();
    return payload?.email || null;
  }

  login(credentials: { email: string; motDePasse: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}`, credentials).pipe(
      tap((response) => {
        if (response.bearer) {
          localStorage.setItem('token', response.bearer);
          this.initializeUserFromToken();
        }
      })
    );
  }

  logout() {
    this._tokenPayload = null;
    this._currentUser.next(null);
    localStorage.removeItem('token');
    // Redirection vers login après déconnexion
    window.location.href = '/login';
  }

  // Nouvelle méthode pour logout silencieux (sans redirection)
  silentLogout() {
    this._tokenPayload = null;
    this._currentUser.next(null);
    localStorage.removeItem('token');
  }

  // Méthode pour forcer l'affichage du modal d'expiration
  handleTokenExpiration() {
    this.silentLogout();
    this.sessionExpiryService.showSessionExpiredModal();
  }

  isLoggedIn(): boolean {
    return this.getTokenPayload() !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const payload = this.getTokenPayload();
    return payload?.role === 'ADMIN';
  }

  getUserRole(): string | null {
    const payload = this.getTokenPayload();
    return payload?.role || null;
  }

  
}
