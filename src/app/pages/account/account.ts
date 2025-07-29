import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service/auth-service';
import { UserService } from '../../services/user-service/user-service';
import { Utilisateur } from '../../models/utilisateur';


interface Activity {
  icon: string;
  action: string;
  timestamp: Date;
}

@Component({
  selector: 'app-account',
  imports: [CommonModule, FormsModule],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account implements OnInit {
  userProfile: Utilisateur = {
    id: 0,
    nom: '',
    prenom: '',
    email: '',
    numeroTelephone: '',
    role: { libelle: '' },
    motDePasse: '', // Ajout du mot de passe pour la modification
    //createdAt: new Date(),
    //lastLogin: new Date(),
    //twoFactorEnabled: false
  };

  editedProfile: Utilisateur = { ...this.userProfile };
  isEditing: boolean = false;
  isLoading: boolean = true;

  // Propriétés pour la gestion des utilisateurs (admin uniquement)
  allUsers: Utilisateur[] = [];
  isLoadingUsers: boolean = false;
  isAdmin: boolean = false;
  availableRoles: string[] = ['USER', 'ADMIN']; // Correspond exactement à votre BDD
  //selectedRoles: { [userId: number]: string } = {}; // Pour gérer les rôles sélectionnés

  recentActivity: Activity[] = [
    {
      icon: 'login',
      action: 'Connexion réussie',
      timestamp: new Date()
    },
    {
      icon: 'edit',
      action: 'Profil modifié',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      icon: 'lock',
      action: 'Mot de passe modifié',
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  ];

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit() {
    this.loadUserProfile();
    this.checkAdminStatus();
  }

  checkAdminStatus() {
    this.isAdmin = this.authService.isAdmin();
    if (this.isAdmin) {
      this.loadAllUsers();
    }
  }

  loadUserProfile() {
    // Vérifier si un token existe
    //if (!this.authService.getToken()) {
    //  console.error('Aucun token trouvé');
    //  this.authService.logout();
    //  return;
    //}

    console.log('Loading started, isLoading:', this.isLoading);

    // Utiliser le service pour récupérer le profil utilisateur via API
    this.userService.getUserProfile().subscribe({
      next: (user) => {
        this.userProfile = {
          id: user.id,
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          numeroTelephone: user.numeroTelephone,
          role: user.role,
          motDePasse: '' // Ne pas afficher le mot de passe
        };
        
        this.editedProfile = { ...this.userProfile };
        console.log('Profil utilisateur chargé depuis l\'API:', this.userProfile);
        console.log('Loading finished, setting isLoading to false');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
        // En cas d'erreur (token invalide, utilisateur non trouvé, etc.)
        this.authService.logout();
        this.isLoading = false;
      }
    });
  }

  toggleEdit() {
    if (this.isEditing) {
      this.saveProfile();
    } else {
      this.editedProfile = { ...this.userProfile }; // Créer une copie pour l'édition
      this.isEditing = true;
    }
  }

  saveProfile() {
    // Vérifier si l'email a changé
    const emailChanged = this.editedProfile.email !== null && this.editedProfile.email !== this.userProfile.email;

    // Appel API pour sauvegarder
    this.userService.updateUser(this.userProfile.id, this.editedProfile).subscribe({
      next: (updatedUser) => {
        this.userProfile = {
          id: this.userProfile.id,
          prenom: updatedUser.prenom,
          nom: updatedUser.nom,
          email: updatedUser.email,
          numeroTelephone: updatedUser.numeroTelephone,
          role: this.userProfile.role, // Le rôle ne change pas dans cette opération
          motDePasse: this.userProfile.motDePasse // Le mot de passe ne change pas dans cette opération
        };
        this.isEditing = false;
        console.log('Profil sauvegardé avec succès:', this.userProfile);
        // Si l'email a changé, déconnecter l'utilisateur
        if (emailChanged) {
          alert('Votre email a été modifié avec succès. Vous allez être déconnecté pour vous reconnecter avec votre nouvel email.');
          this.authService.logout();
        }
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde du profil !');
      }
    });
  }

  changePassword() {
    // TODO: Ouvrir une modal ou rediriger vers une page de changement de mot de passe
    console.log('Changement de mot de passe');
  }

  enableTwoFactor() {
    // TODO: Logique pour activer/désactiver l'authentification à deux facteurs
    //this.userProfile.twoFactorEnabled = !this.userProfile.twoFactorEnabled;
    //console.log('2FA:', this.userProfile.twoFactorEnabled ? 'Activé' : 'Désactivé');
  }

  logout() {
    // Confirmer la déconnexion
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      console.log('Déconnexion de l\'utilisateur');
      this.authService.logout();
    }
  }

  // Méthodes pour la gestion des utilisateurs (admin uniquement)
  loadAllUsers() {
    if (!this.isAdmin) {
      return;
    }

    this.isLoadingUsers = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        console.log(this.allUsers);
        // Initialiser les rôles sélectionnés
        //this.selectedRoles = {};
        //users.forEach(user => {
        //  this.selectedRoles[user.id] = user.role.libelle;
        //  console.log(`User ${user.prenom} ${user.nom} - Role: "${user.role.libelle}"`);
        //});
        this.isLoadingUsers = false;
        //console.log('Utilisateurs chargés:', this.allUsers);
        //console.log('Rôles sélectionnés:', this.selectedRoles);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.isLoadingUsers = false;
        alert('Erreur lors du chargement des utilisateurs');
      }
    });
  }

  changeUserRole(user: Utilisateur, newRole: string) {
    console.log(`Changement de rôle pour ${user.prenom} ${user.nom}:`);
    console.log(`Ancien rôle: "${user.role.libelle}"`);
    console.log(`Nouveau rôle: "${newRole}"`);
    
   // if (!this.isAdmin || !confirm(`Êtes-vous sûr de vouloir changer le rôle de ${user.prenom} ${user.nom} vers ${newRole} ?`)) {
   //   // Restaurer la valeur précédente si l'utilisateur annule
   //   this.selectedRoles[user.id] = user.role.libelle;
   //   return;
   // }

    const ancienRole = user.role.libelle;

    this.userService.changerRole(user.id, newRole).subscribe({
      next: (response) => {
        // Mettre à jour le rôle de l'utilisateur dans la liste locale
        user.role.libelle = newRole;
        console.log(`Rôle changé avec succès pour ${user.prenom} ${user.nom}`);
        
        // Afficher le message de succès du serveur
        const successMessage = response.message || `Le rôle de ${user.prenom} ${user.nom} a été changé vers ${newRole} avec succès !`;
        alert(successMessage);
      },
      error: (error: any) => {
        console.error('Erreur lors du changement de rôle:', error);
        // Restaurer l'ancien rôle en cas d'erreur
        user.role.libelle = ancienRole;
        
        // Afficher un message d'erreur approprié
        let errorMessage = 'Erreur lors du changement de rôle';
        
        if (error.status === 403) {
          errorMessage = 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action';
        } else if (error.status === 404) {
          errorMessage = 'Utilisateur ou rôle non trouvé';
        } else if (error.status === 400 && error.error && error.error.error) {
          // Erreur du serveur avec message personnalisé
          errorMessage = error.error.error;
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(errorMessage);
      }
    });



  }

  onRoleChange(user: Utilisateur, newRole: string) {
    this.changeUserRole(user, newRole);
  }

  deleteUser(user: Utilisateur) {
    if (!this.isAdmin) {
      return;
    }

    // Empêcher la suppression de son propre compte
    if (user.id === this.userProfile.id) {
      alert('Vous ne pouvez pas supprimer votre propre compte !');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur ${user.prenom} ${user.nom} ?\n\nCette action est irréversible !`)) {
      return;
    }

    this.userService.supprimerUser(user.id).subscribe({
      next: () => {
        // Retirer l'utilisateur de la liste
        this.allUsers = this.allUsers.filter(u => u.id !== user.id);
        alert('Utilisateur supprimé avec succès !');
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    });
  }
}
