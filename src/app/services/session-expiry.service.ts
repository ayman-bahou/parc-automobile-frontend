import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionExpiryService {
  private sessionExpiredSubject = new BehaviorSubject<boolean>(false);
  public sessionExpired$ = this.sessionExpiredSubject.asObservable();

  constructor() {}

  showSessionExpiredModal() {
    this.sessionExpiredSubject.next(true);
  }

  hideSessionExpiredModal() {
    this.sessionExpiredSubject.next(false);
  }

  isSessionExpiredModalVisible(): boolean {
    return this.sessionExpiredSubject.value;
  }
}
