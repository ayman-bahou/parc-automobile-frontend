import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service/auth-service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api/notifications';
  private apiUrlUser = "http://localhost:8080/api"

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Récupérer toutes les notifications (Admin seulement)
   */
 

  /**
   * Supprimer une notification par son ID
   */
  supprimerNotification(idUser:number,idNotif: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${idNotif}/${idUser}`, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  /**
   * Supprimer toutes les notifications de l'utilisateur connecté
   */
  supprimerToutesNotifications(id:number): Observable<string> {
    return this.http.delete(`${this.apiUrlUser}/mes-notifications/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }
}