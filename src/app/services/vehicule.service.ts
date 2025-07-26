import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicule, VehiculeStats } from '../models/vehicule';
import { AuthService } from './auth-service/auth-service';

@Injectable({
  providedIn: 'root'
})
export class VehiculeService {
  private baseUrl = 'http://localhost:8080/api/vehicules'; // Ajustez l'URL selon votre backend

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Méthode pour obtenir les headers avec le token d'autorisation
  private getHttpHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }


  saveVehicule(vehicule: Vehicule): void{
    this.http.post<Vehicule>(this.baseUrl, vehicule, { headers: this.getHttpHeaders() }).subscribe();
  }


  // Récupérer tous les véhicules
  getAllVehicules(): Observable<Vehicule[]> {
    return this.http.get<Vehicule[]>(this.baseUrl, { headers: this.getHttpHeaders() });
  }

  // Récupérer un véhicule par ID
  getVehiculeById(id: number): Observable<Vehicule> {
    return this.http.get<Vehicule>(`${this.baseUrl}/${id}`, { headers: this.getHttpHeaders() });
  }

  // Récupérer les véhicules par statut
  getVehiculesByStatut(statut: string): Observable<Vehicule[]> {
    return this.http.get<Vehicule[]>(`${this.baseUrl}/statut/${statut}`, { headers: this.getHttpHeaders() });
  }

  // Récupérer les statistiques des véhicules
  getVehiculeStats(): Observable<VehiculeStats> {
    return this.http.get<VehiculeStats>(`${this.baseUrl}/stats`, { headers: this.getHttpHeaders() });
  }

  // Créer un nouveau véhicule
  createVehicule(vehicule: Vehicule): Observable<Vehicule> {
    return this.http.post<Vehicule>(this.baseUrl, vehicule, { headers: this.getHttpHeaders() });
  }

  // Mettre à jour un véhicule
  updateVehicule(id: number, vehicule: Vehicule): Observable<Vehicule> {
    return this.http.put<Vehicule>(`${this.baseUrl}/${id}`, vehicule, { headers: this.getHttpHeaders() });
  }

  // Supprimer un véhicule
  deleteVehicule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHttpHeaders() });
  }

  // Assigner un véhicule à un utilisateur
  assignerVehicule(vehiculeId: number, utilisateurId: number): Observable<Vehicule> {
    return this.http.put<Vehicule>(`${this.baseUrl}/${vehiculeId}/assigner/${utilisateurId}`, {}, { headers: this.getHttpHeaders() });
  }

  // Libérer un véhicule
  libererVehicule(vehiculeId: number): Observable<Vehicule> {
    return this.http.put<Vehicule>(`${this.baseUrl}/${vehiculeId}/liberer`, {}, { headers: this.getHttpHeaders() });
  }
}
