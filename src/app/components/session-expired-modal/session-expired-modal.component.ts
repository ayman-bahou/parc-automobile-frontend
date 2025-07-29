import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SessionExpiryService } from '../../services/session-expiry.service';

@Component({
  selector: 'app-session-expired-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="session-expired-overlay" *ngIf="isVisible" (click)="redirectToLogin()">
      <div class="session-expired-modal" (click)="$event.stopPropagation()">
        <div class="modal-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#dc3545"/>
            <path d="M12 6v6l4 2" stroke="#dc3545" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        
        <div class="modal-content">
          <h2>Session expirée</h2>
          <p>Votre session a expiré pour des raisons de sécurité. Veuillez vous reconnecter pour continuer.</p>
        </div>
        
        <div class="modal-actions">
          <button class="btn-login" (click)="redirectToLogin()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Se reconnecter
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./session-expired-modal.component.css']
})
export class SessionExpiredModalComponent implements OnInit, OnDestroy {
  isVisible = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private sessionExpiryService: SessionExpiryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.sessionExpiryService.sessionExpired$.subscribe(
        (isExpired) => {
          this.isVisible = isExpired;
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  redirectToLogin() {
    this.sessionExpiryService.hideSessionExpiredModal();
    this.router.navigate(['/login']);
  }
}
