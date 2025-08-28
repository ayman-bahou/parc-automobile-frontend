import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from './auth-service/auth-service';
import { UserService } from './user-service/user-service';

@Injectable({
  providedIn: 'root'
})
export class NotificationCountService {
  private notificationCountSubject = new BehaviorSubject<number>(0);
  public notificationCount$ = this.notificationCountSubject.asObservable();
  private pollingSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  /**
   * Récupère le nombre de notifications pour l'utilisateur connecté
   */
  loadNotificationCount(): void {
    const currentUserId = this.authService.getCurrentUserId();
    
    if (!currentUserId) {
      this.notificationCountSubject.next(0);
      return;
    }

    this.userService.getAllNotifications(currentUserId).subscribe({
      next: (notifications) => {
        this.notificationCountSubject.next(notifications.length);
      },
      error: (error) => {
        console.error('Erreur lors du chargement du nombre de notifications:', error);
        this.notificationCountSubject.next(0);
      }
    });
  }

  /**
   * Met à jour le nombre de notifications (utilisé après suppression ou ajout)
   */
  updateNotificationCount(count: number): void {
    this.notificationCountSubject.next(count);
  }

  /**
   * Décrémente le nombre de notifications (utilisé après suppression d'une notification)
   */
  decrementNotificationCount(): void {
    const currentCount = this.notificationCountSubject.value;
    this.notificationCountSubject.next(Math.max(0, currentCount - 1));
  }

  /**
   * Remet à zéro le nombre de notifications (utilisé après suppression de toutes les notifications)
   */
  resetNotificationCount(): void {
    this.notificationCountSubject.next(0);
  }

  /**
   * Démarre un polling automatique pour mettre à jour le nombre de notifications
   * @param intervalMs Intervalle en millisecondes (par défaut: 30 secondes)
   */
  startPolling(intervalMs: number = 30000): void {
    // Arrêter le polling existant s'il y en a un
    this.stopPolling();

    this.pollingSubscription = interval(intervalMs).pipe(
      switchMap(() => {
        const currentUserId = this.authService.getCurrentUserId();
        if (!currentUserId) {
          return [];
        }
        return this.userService.getAllNotifications(currentUserId);
      }),
      catchError((error) => {
        console.error('Erreur lors du polling des notifications:', error);
        return [];
      })
    ).subscribe((notifications) => {
      this.notificationCountSubject.next(notifications.length);
    });
  }

  /**
   * Arrête le polling automatique
   */
  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }
}
