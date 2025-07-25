import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service/auth-service';

export const loginGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Si déjà connecté, redirection vers le dashboard
    router.navigate(['/admin/dashboard']);
    return false;
  } else {
    // Si non connecté, accès autorisé à la page de login
    return true;
  }
};
