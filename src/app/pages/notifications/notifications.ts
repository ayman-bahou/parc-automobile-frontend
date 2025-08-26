import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service/auth-service';
import { UserService } from '../../services/user-service/user-service';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/Notification';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  currentUserId: number | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.error = null;

    // Récupérer l'ID de l'utilisateur connecté
    this.currentUserId = this.authService.getCurrentUserId();

    if (!this.currentUserId) {
      this.error = 'Utilisateur non connecté';
      this.isLoading = false;
      this.authService.logout();
      return;
    }

    // Charger les notifications depuis le backend
    this.userService.getAllNotifications(this.currentUserId).subscribe({
      next: (notifications: Notification[]) => {
        this.notifications = notifications.sort((a, b) => 
          new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des notifications:', error);
        this.error = 'Erreur lors du chargement des notifications';
        this.isLoading = false;
        
        // Si l'erreur est liée à l'authentification, déconnecter l'utilisateur
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
        }
      }
    });
  }

  // Méthode pour rafraîchir les notifications
  refreshNotifications(): void {
    this.loadNotifications();
  }

  // Méthode pour supprimer une notification
  supprimerNotification(notification: Notification): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      this.notificationService.supprimerNotification(notification.id).subscribe({
        next: (response: string) => {
          console.log('Notification supprimée:', response);
          // Supprimer la notification de la liste locale
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.error = 'Erreur lors de la suppression de la notification';
          
          // Si l'erreur est liée à l'authentification, déconnecter l'utilisateur
          if (error.status === 401 || error.status === 403) {
            this.authService.logout();
          }
        }
      });
    }
  }

  // Méthode pour supprimer toutes les notifications
  supprimerToutesNotifications(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes vos notifications ?')) {
      this.notificationService.supprimerToutesNotifications(this.currentUserId!).subscribe({
        next: (response: string) => {
          console.log('Toutes les notifications supprimées:', response);
          // Vider la liste locale
          this.notifications = [];
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.error = 'Erreur lors de la suppression des notifications';
          
          // Si l'erreur est liée à l'authentification, déconnecter l'utilisateur
          if (error.status === 401 || error.status === 403) {
            this.authService.logout();
          }
        }
      });
    }
  }

  // Méthode pour formater la date
  formatDate(date: Date): string {
    const notificationDate = new Date(date);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - notificationDate.getTime();
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));

    if (diffInDays > 0) {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInMinutes > 0) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    } else {
      return 'À l\'instant';
    }
  }

  // Méthode pour obtenir l'icône selon le type de notification
  getNotificationIcon(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('mission') || lowerMessage.includes('affectation')) {
      return 'assignment';
    } else if (lowerMessage.includes('véhicule') || lowerMessage.includes('vehicule')) {
      return 'directions_car';
    } else if (lowerMessage.includes('réparation') || lowerMessage.includes('reparation')) {
      return 'build';
    } else if (lowerMessage.includes('carburant') || lowerMessage.includes('consommation')) {
      return 'local_gas_station';
    } else {
      return 'notifications';
    }
  }

  // Méthode pour obtenir la couleur selon le type de notification
  getNotificationColor(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('urgent') || lowerMessage.includes('critique')) {
      return 'text-red-600';
    } else if (lowerMessage.includes('mission') || lowerMessage.includes('affectation')) {
      return 'text-blue-600';
    } else if (lowerMessage.includes('véhicule') || lowerMessage.includes('vehicule')) {
      return 'text-green-600';
    } else if (lowerMessage.includes('réparation') || lowerMessage.includes('reparation')) {
      return 'text-orange-600';
    } else {
      return 'text-gray-600';
    }
  }

  // Méthode de tracking pour optimiser les performances d'Angular
  trackByNotificationId(index: number, notification: Notification): number {
    return notification.id;
  }
}
