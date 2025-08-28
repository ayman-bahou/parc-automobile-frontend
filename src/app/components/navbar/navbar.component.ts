import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SidebarService } from '../../services/sidebar.service';
import { NotificationCountService } from '../../services/notification-count.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  notificationCount$: Observable<number>;

  constructor(
    private sidebarService: SidebarService,
    private notificationCountService: NotificationCountService
  ) {
    this.notificationCount$ = this.notificationCountService.notificationCount$;
  }

  ngOnInit() {
    // Charger le nombre de notifications au démarrage
    this.notificationCountService.loadNotificationCount();
    
    // Démarrer le polling automatique pour détecter les nouvelles notifications
    this.notificationCountService.startPolling(3000); // Toutes les 3 secondes
  }

  ngOnDestroy() {
    // Arrêter le polling quand le composant est détruit
    this.notificationCountService.stopPolling();
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }
}