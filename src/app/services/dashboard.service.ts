import { Injectable, NgProbeToken } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service/auth-service';

export interface DashboardStats {
  totalVehicules: number;
  vehiculesDisponibles: number;
  vehiculesEnMission: number;
  vehiculesEnReparation: number;
  vehiculesEnMaintenance: number;
  missionsEnCours: number;
  alertes: {
    visitesEcheesProchainement: number;
    maintenancesEnRetard: number;
    vehiculesForteConsommation: number;
    reparationsEnCours: number;
  };
  coutsStats: {
    carburant: number;
    reparations: number;
    maintenance: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Méthode privée pour créer les en-têtes avec autorisation
  private getHttpHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Récupérer les statistiques du tableau de bord
  getDashboardStats(): Observable<DashboardStats> {
    const headers = this.getHttpHeaders();
    
    return this.http.get<DashboardStats>(`${this.apiUrl}/reporting/tableau-de-bord`, { headers });
  }  // Récupérer les véhicules par statut
  getVehiculesByStatut(statut: string): Observable<any[]> {
    const headers = this.getHttpHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/vehicules/statut/${statut}`, { headers });
  }

  // Récupérer les missions en cours
  getMissionsEnCours(): Observable<any[]> {
    const headers = this.getHttpHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/missions/statut/EN_COURS`, { headers });
  }

  // Récupérer les véhicules nécessitant une visite technique
  getVehiculesVisiteTechnique(jours: number = 30): Observable<any[]> {
    const headers = this.getHttpHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/vehicules/visite-technique-expiration/${jours}`, { headers });
  }

  // Récupérer les maintenances en retard
  getMaintenancesEnRetard(): Observable<any[]> {
    const headers = this.getHttpHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/maintenances/echues`, { headers });
  }

  // Récupérer le rapport du mois courant
  getRapportMoisCourant(): Observable<any> {
    const headers = this.getHttpHeaders();
    return this.http.get<any>(`${this.apiUrl}/reporting/mois-courant`, { headers });
  }
}
