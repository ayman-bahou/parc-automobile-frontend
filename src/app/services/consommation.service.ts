import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consommation } from '../models/consommation';
import { AuthService } from './auth-service/auth-service';

@Injectable({
  providedIn: 'root'
})
export class ConsommationService {
  private baseUrl = 'http://localhost:8080/api/consommations';

  constructor(private http: HttpClient, private authService: AuthService) { }

 private getHttpHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }


  /**
   * Créer une nouvelle consommation
   */
  creerConsommation(consommation: Consommation): Observable<Consommation> {
    return this.http.post<Consommation>(this.baseUrl, consommation,{headers : this.getHttpHeaders()});
  }

  /**
   * Récupérer les consommations d'un véhicule
   */
  getConsommationsParVehicule(vehiculeId: number): Observable<Consommation[]> {
    return this.http.get<Consommation[]>(`${this.baseUrl}/vehicule/${vehiculeId}`);
  }

  /**
   * Récupérer les consommations d'un utilisateur
   */
  getConsommationsParUtilisateur(utilisateurId: number): Observable<Consommation[]> {
    return this.http.get<Consommation[]>(`${this.baseUrl}/utilisateur/${utilisateurId}`);
  }

  /**
   * Supprimer une consommation
   */
  supprimerConsommation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Mettre à jour une consommation
   */
  modifierConsommation(id: number, consommation: Consommation): Observable<Consommation> {
    return this.http.put<Consommation>(`${this.baseUrl}/${id}`, consommation);
  }
}
