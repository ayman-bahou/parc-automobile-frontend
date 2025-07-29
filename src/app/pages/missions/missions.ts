import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MissionService } from '../../services/mission.service';
import { AuthService } from '../../services/auth-service/auth-service';
import { Mission } from '../../models/mission';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
],
  templateUrl: './missions.html',
  styleUrl: './missions.css'
})
export class Missions implements OnInit {
  missions: Mission[] = [];
  filteredMissions: Mission[] = [];
  loading = true;
  error: string | null = null;
  selectedFilter: string = 'ALL'; // Filtre actuel sélectionné

  constructor(
    private missionService: MissionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMissions();
  }

  loadMissions(): void {
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.error = "Impossible de récupérer l'ID de l'utilisateur";
      this.loading = false;
      return;
    }

    this.missionService.getMissionsByConducteur(userId).subscribe({
      next: (missions) => {
        this.missions = missions;
        this.filteredMissions = missions; // Initialiser les missions filtrées
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des missions:', err);
        this.error = "Erreur lors du chargement des missions";
        this.loading = false;
      }
    });
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'EN_COURS':
        return 'accent';
      case 'TERMINEE':
        return 'primary';
      case 'ANNULEE':
        return 'warn';
      default:
        return '';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'EN_COURS':
        return 'En cours';
      case 'TERMINEE':
        return 'Terminée';
      case 'ANNULEE':
        return 'Annulée';
      default:
        return statut;
    }
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMissionsCount(statut: string): number {
    return this.missions.filter(mission => mission.statut === statut).length;
  }

  getFilteredMissionsCount(): number {
    return this.filteredMissions.length;
  }

  getStatusIcon(statut: string): string {
    switch (statut) {
      case 'EN_COURS':
        return 'play_circle_filled';
      case 'TERMINEE':
        return 'check_circle';
      case 'ANNULEE':
        return 'cancel';
      default:
        return 'radio_button_unchecked';
    }
  }

  trackByMission(index: number, mission: Mission): number {
    return mission.id || index;
  }

  filterByStatus(statut: string): void {
    this.selectedFilter = statut;
    if (statut === 'ALL') {
      this.filteredMissions = this.missions;
    } else {
      this.filteredMissions = this.missions.filter(mission => mission.statut === statut);
    }
  }

  isFilterActive(filter: string): boolean {
    return this.selectedFilter === filter;
  }
}
