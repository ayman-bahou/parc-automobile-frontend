import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Signalement } from '../models/signalement';
import { AuthService } from './auth-service/auth-service';
import { SignalementDTO } from '../models/signalement-dto';

@Injectable({
  providedIn: 'root'
})
export class SignalementService {
  private baseUrl = 'http://localhost:8080/api/signaler';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Méthode pour obtenir les headers avec le token d'autorisation
  private getHttpHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Récupérer tous les signalements
  getAllSignalements(): Observable<Signalement[]> {
    return this.http.get<Signalement[]>(`${this.baseUrl}/getAll`, { headers: this.getHttpHeaders() });
  }

  // Récupérer un signalement par ID
  getSignalementById(id: number): Observable<Signalement> {
    return this.http.get<Signalement>(`${this.baseUrl}/${id}`, { headers: this.getHttpHeaders() });
  }

  // Récupérer les signalements par utilisateur
  getSignalementsByUser(userId: number): Observable<Signalement[]> {
    return this.http.get<Signalement[]>(`${this.baseUrl}/utilisateur/${userId}`, { headers: this.getHttpHeaders() });
  }

  // Récupérer les signalements par véhicule
  getSignalementsByVehicule(vehiculeId: number): Observable<Signalement[]> {
    return this.http.get<Signalement[]>(`${this.baseUrl}/vehicule/${vehiculeId}`, { headers: this.getHttpHeaders() });
  }

  // Créer un nouveau signalement
  createSignalement(signalement: SignalementDTO): Observable<Signalement> {
    return this.http.post<Signalement>(`${this.baseUrl}/creer`, signalement, { headers: this.getHttpHeaders() });
  }

  // Mettre à jour un signalement
  updateSignalement(id: number, signalement: Signalement): Observable<Signalement> {
    return this.http.put<Signalement>(`${this.baseUrl}/${id}`, signalement, { headers: this.getHttpHeaders() });
  }

  // Supprimer un signalement
  deleteSignalement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHttpHeaders() });
  }

  // Marquer un signalement comme résolu (pour admin)
  resoudreSignalement(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/resoudre/${id}`, {}, { headers: this.getHttpHeaders() });
  }

  // Rejeter un signalement (pour admin)
  rejeterSignalement(id: number, commentaire?: string): Observable<Signalement> {
    const body = { commentaireAdmin: commentaire };
    return this.http.patch<Signalement>(`${this.baseUrl}/${id}/rejeter`, body, { headers: this.getHttpHeaders() });
  }
}
