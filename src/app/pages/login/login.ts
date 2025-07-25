import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth-service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  motDePasse: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    if (!this.email || !this.motDePasse) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, motDePasse: this.motDePasse })
  .pipe(
    finalize(() => {
      this.isLoading = false; // S'exécute même en cas d'erreur
    })
  )
  .subscribe({
    next: (response) => {
      console.log('Connexion réussie:', response);
      localStorage.setItem('token', response.bearer);
      this.router.navigate(['/admin/dashboard']);
    },
    error: (error) => {
      console.error('Erreur de connexion:', error);
      if (error.status === 401) {
        this.errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.status === 0) {
        this.errorMessage = 'Erreur de connexion au serveur';
      } else {
        this.errorMessage = 'Une erreur est survenue lors de la connexion';
      }
    }
  });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}