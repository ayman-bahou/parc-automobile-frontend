import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReparationDTO, ReparationDisplay, TypeReparation, StatutReparation } from '../models/reparation';
import { AuthService } from './auth-service/auth-service';

@Injectable({
  providedIn: 'root'
})
export class ReparationService {
  private readonly apiUrl = 'http://localhost:8080/api/reparations';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Méthode pour obtenir les headers avec le token d'autorisation
  private getHttpHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Récupère toutes les réparations
   */
  getAllReparations(): Observable<ReparationDisplay[]> {
    return this.http.get<ReparationDisplay[]>(this.apiUrl, { headers: this.getHttpHeaders() });
  }

  /**
   * Récupère une réparation par son ID
   */
  getReparationById(id: number): Observable<ReparationDTO> {
    return this.http.get<ReparationDTO>(`${this.apiUrl}/${id}`, { headers: this.getHttpHeaders() });
  }

  /**
   * Crée une nouvelle réparation
   */
  createReparation(reparation: ReparationDTO): Observable<ReparationDTO> {
    return this.http.post<ReparationDTO>(this.apiUrl, reparation, { headers: this.getHttpHeaders() });
  }

  /**
   * Met à jour une réparation existante
   */
  updateReparation(id: number, reparation: ReparationDTO): Observable<ReparationDTO> {
    return this.http.put<ReparationDTO>(`${this.apiUrl}/${id}`, reparation, { headers: this.getHttpHeaders() });
  }

  /**
   * Supprime une réparation
   */
  deleteReparation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHttpHeaders() });
  }

  /**
   * Récupère les réparations d'un véhicule
   */
  getReparationsByVehicule(vehiculeId: number): Observable<ReparationDTO[]> {
    return this.http.get<ReparationDTO[]>(`${this.apiUrl}/vehicule/${vehiculeId}`, { headers: this.getHttpHeaders() });
  }

  /**
   * Récupère les réparations par type
   */
  getReparationsByType(typeReparation: TypeReparation): Observable<ReparationDTO[]> {
    return this.http.get<ReparationDTO[]>(`${this.apiUrl}/type/${typeReparation}`, { headers: this.getHttpHeaders() });
  }

  /**
   * Récupère les réparations par statut
   */
  getReparationsByStatut(statut: StatutReparation): Observable<ReparationDTO[]> {
    return this.http.get<ReparationDTO[]>(`${this.apiUrl}/statut/${statut}`, { headers: this.getHttpHeaders() });
  }

  /**
   * Récupère les réparations entre deux dates
   */
  getReparationsEntreDates(dateDebut: string, dateFin: string): Observable<ReparationDTO[]> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get<ReparationDTO[]>(`${this.apiUrl}/periode`, { params, headers: this.getHttpHeaders() });
  }

  /**
   * Récupère les réparations d'un véhicule sur une période
   */
  getReparationsByVehiculeAndPeriode(
    vehiculeId: number, 
    dateDebut: string, 
    dateFin: string
  ): Observable<ReparationDTO[]> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get<ReparationDTO[]>(`${this.apiUrl}/vehicule/${vehiculeId}/periode`, { params, headers: this.getHttpHeaders() });
  }

  /**
   * Récupère le coût total des réparations d'un véhicule pour une année
   */
  getTotalCoutByVehiculeAndAnnee(vehiculeId: number, annee: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/vehicule/${vehiculeId}/total-cout/${annee}`, { headers: this.getHttpHeaders() });
  }

  /**
   * Récupère les visites techniques triées par date
   */
  getVisitesTechniquesOrderByDate(): Observable<ReparationDTO[]> {
    return this.http.get<ReparationDTO[]>(`${this.apiUrl}/visites-techniques`, { headers: this.getHttpHeaders() });
  }

  /**
   * Compte les réparations en cours
   */
  countReparationsEnCours(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/en-cours`, { headers: this.getHttpHeaders() });
  }

  /**
   * Récupère le coût moyen par type et période
   */
  getAverageCoutByTypeAndPeriode(
    type: TypeReparation, 
    dateDebut: string, 
    dateFin: string
  ): Observable<number> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get<number>(`${this.apiUrl}/cout-moyen/${type}/periode`, { params, headers: this.getHttpHeaders() });
  }

  /**
   * Démarre une réparation
   */
  demarrerReparation(id: number): Observable<ReparationDTO> {
    return this.http.post<ReparationDTO>(`${this.apiUrl}/${id}/demarrer`, {}, { headers: this.getHttpHeaders() });
  }

  /**
   * Termine une réparation
   */
  terminerReparation(id: number): Observable<ReparationDTO> {
    return this.http.post<ReparationDTO>(`${this.apiUrl}/${id}/terminer`, {}, { headers: this.getHttpHeaders() });
  }

  /**
   * Récupère les réparations en cours
   */
  getReparationsEnCours(): Observable<ReparationDTO[]> {
    return this.http.get<ReparationDTO[]>(`${this.apiUrl}/en-cours`, { headers: this.getHttpHeaders() });
  }

  /**
   * Utilitaires pour les enums
   */
  getTypeReparationOptions(): { value: TypeReparation; label: string }[] {
    return [
      { value: TypeReparation.VISITE_TECHNIQUE, label: 'Visite Technique' },
      { value: TypeReparation.MAINTENANCE_PREVENTIVE, label: 'Maintenance Préventive' },
      { value: TypeReparation.REPARATION_MOTEUR, label: 'Réparation Moteur' },
      { value: TypeReparation.REPARATION_FREINS, label: 'Réparation Freins' },
      { value: TypeReparation.REPARATION_TRANSMISSION, label: 'Réparation Transmission' },
      { value: TypeReparation.REPARATION_SUSPENSION, label: 'Réparation Suspension' },
      { value: TypeReparation.REPARATION_ELECTRIQUE, label: 'Réparation Électrique' },
      { value: TypeReparation.REPARATION_CARROSSERIE, label: 'Réparation Carrosserie' },
      { value: TypeReparation.CHANGEMENT_PNEUS, label: 'Changement Pneus' },
      { value: TypeReparation.REPARATION_AUTRE, label: 'Autre Réparation' }
    ];
  }

  getStatutReparationOptions(): { value: StatutReparation; label: string }[] {
    return [
      { value: StatutReparation.EN_COURS, label: 'En Cours' },
      { value: StatutReparation.TERMINEE, label: 'Terminée' }
    ];
  }
}
