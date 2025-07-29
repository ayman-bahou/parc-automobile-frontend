import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SessionExpiryService } from '../services/session-expiry.service';
import { AuthService } from '../services/auth-service/auth-service';

@Injectable()
export class TokenExpiredInterceptor implements HttpInterceptor {

  constructor(
    private sessionExpiryService: SessionExpiryService,
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Vérifier si l'erreur est due à un token expiré (401 Unauthorized)
        if (error.status === 401) {
          // Vérifier si un token existe (pour éviter de montrer le modal lors du login)
          const token = this.authService.getToken();
          if (token) {
            // Afficher le modal d'expiration de session
            this.sessionExpiryService.showSessionExpiredModal();
            
            // Nettoyer le token expiré
            localStorage.removeItem('token');
          }
        }
        
        return throwError(() => error);
      })
    );
  }
}
