import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service/auth-service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Redirection vers la page de login si non connecté
    router.navigate(['/login']);
    return false;
  }
};
