import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionExpiredModalComponent } from './components/session-expired-modal/session-expired-modal.component';
import { AuthService } from './services/auth-service/auth-service';
import { NotificationCountService } from './services/notification-count.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SessionExpiredModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('st-frontend');

  constructor(
    private authService: AuthService,
    private notificationCountService: NotificationCountService
  ) {}

  ngOnInit() {
    // Charger les notifications si l'utilisateur est connecté
    if (this.authService.isLoggedIn()) {
      this.notificationCountService.loadNotificationCount();
    }

    // S'abonner aux changements d'état de connexion pour charger les notifications
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Utilisateur connecté, charger les notifications
        this.notificationCountService.loadNotificationCount();
      } else {
        // Utilisateur déconnecté, réinitialiser le compteur
        this.notificationCountService.resetNotificationCount();
      }
    });
  }
}
