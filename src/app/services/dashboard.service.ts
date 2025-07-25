import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) { }

  // Récupérer les statistiques du tableau de bord
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/reporting/tableau-de-bord`);
  }

  // Récupérer les véhicules par statut
  getVehiculesByStatut(statut: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vehicules/statut/${statut}`);
  }

  // Récupérer les missions en cours
  getMissionsEnCours(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/missions/statut/EN_COURS`);
  }

  // Récupérer les véhicules nécessitant une visite technique
  getVehiculesVisiteTechnique(jours: number = 30): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vehicules/visite-technique-expiration/${jours}`);
  }

  // Récupérer les maintenances en retard
  getMaintenancesEnRetard(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/maintenances/echues`);
  }

  // Récupérer le rapport du mois courant
  getRapportMoisCourant(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reporting/mois-courant`);
  }
}
