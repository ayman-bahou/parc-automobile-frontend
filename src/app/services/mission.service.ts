import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mission } from '../models/mission';
import { Utilisateur } from '../models/utilisateur';
import { AuthService } from './auth-service/auth-service';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private baseUrl = 'http://localhost:8080/api/missions';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Méthode pour obtenir les headers avec le token d'autorisation
  private getHttpHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Récupérer toutes les missions
  getAllMissions(): Observable<Mission[]> {
    return this.http.get<Mission[]>(this.baseUrl, { headers: this.getHttpHeaders() });
  }

  // Récupérer une mission par ID
  getMissionById(id: number): Observable<Mission> {
    return this.http.get<Mission>(`${this.baseUrl}/${id}`, { headers: this.getHttpHeaders() });
  }

  // Créer une nouvelle mission
  createMission(mission: Mission): Observable<Mission> {
    return this.http.post<Mission>(this.baseUrl, mission, { headers: this.getHttpHeaders() });
  }

  // Mettre à jour une mission
  updateMission(id: number, mission: Mission): Observable<Mission> {
    return this.http.put<Mission>(`${this.baseUrl}/${id}`, mission, { headers: this.getHttpHeaders() });
  }

  // Supprimer une mission
  deleteMission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHttpHeaders() });
  }

  // Récupérer les missions par véhicule
  getMissionsByVehicule(vehiculeId: number): Observable<Mission[]> {
    return this.http.get<Mission[]>(`${this.baseUrl}/vehicule/${vehiculeId}`, { headers: this.getHttpHeaders() });
  }

  // Récupérer les missions par conducteur
  getMissionsByConducteur(conducteurId: number): Observable<Mission[]> {
    return this.http.get<Mission[]>(`${this.baseUrl}/conducteur/${conducteurId}`, { headers: this.getHttpHeaders() });
  }

  // Récupérer les conducteurs disponibles
  getConducteursDisponibles(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.baseUrl}/conducteurs-disponibles`, { headers: this.getHttpHeaders() });
  }

  // Terminer une mission
  terminerMission(missionId: number, kilometrageRetour: number, observations?: string): Observable<Mission> {
    const params = new URLSearchParams();
    params.append('kilometrageRetour', kilometrageRetour.toString());
    if (observations) {
      params.append('observations', observations);
    }
    
    return this.http.post<Mission>(
      `${this.baseUrl}/${missionId}/terminer?${params.toString()}`, 
      {}, 
      { headers: this.getHttpHeaders() }
    );
  }

  // Récupérer les missions en cours par véhicule
  getMissionEnCoursByVehicule(vehiculeId: number): Observable<Mission> {
    return this.http.get<Mission>(`${this.baseUrl}/encours/vehicule/${vehiculeId}`, { headers: this.getHttpHeaders() });
  }
}