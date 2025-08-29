import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service/user-service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-inscription',
  imports: [CommonModule, FormsModule],
  templateUrl: './inscription.html',
  styleUrl: './inscription.css'
})
export class Inscription {
  nom: string = '';
  prenom: string = '';
  numeroTelephone : string = '';
  email: string = '';
  motDePasse: string = '';
  confirmMotDePasse: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router, private userService: UserService) {}

  onSubmit() {
    // Validation des champs
    if (!this.nom || !this.prenom || !this.email || !this.motDePasse || !this.confirmMotDePasse || !this.numeroTelephone) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Veuillez entrer un email valide';
      return;
    }

    // Validation mot de passe
    if (this.motDePasse.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    // Vérification confirmation mot de passe
    if (this.motDePasse !== this.confirmMotDePasse) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    // Validation numéro de téléphone (simple vérification de longueur)
    if (this.numeroTelephone.length < 10) {
      this.errorMessage = 'Veuillez entrer un numéro de téléphone valide';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userData = {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      motDePasse: this.motDePasse,
      numeroTelephone: this.numeroTelephone
    };

    this.userService.inscription(userData)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Inscription réussie:', response);
          this.successMessage = 'Inscription réussie ! Redirection vers la page de connexion...';
          
          // Redirection vers la page de login après 2 secondes
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          console.error('Erreur d\'inscription:', error);
          if (error.status === 400) {
            this.errorMessage = 'Données invalides. Veuillez vérifier vos informations.';
          } else if (error.status === 409) {
            this.errorMessage = 'Un compte avec cet email existe déjà.';
          } else if (error.status === 0) {
            this.errorMessage = 'Erreur de connexion au serveur';
          } else {
            this.errorMessage = 'Une erreur est survenue lors de l\'inscription';
          }
        }
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
