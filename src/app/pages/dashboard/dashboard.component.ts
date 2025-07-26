import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatProgressBarModule,
    MatChipsModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Statistiques du parc automobile
  parkingStats = {
    totalVehicules: 0,
    vehiculesDisponibles: 0,
    vehiculesEnMission: 0,
    vehiculesEnReparation: 0,
    vehiculesEnMaintenance: 0
  };

  // Missions en cours
  missionsStats = {
    missionsEnCours: 0,
    missionsTermineesAujourdhui: 0,
    distanceParcourueAujourdhui: 0, // en km
    missionsPlanifiees: 0
  };

  // Alertes et notifications
  alertes = {
    visitesEcheesProchainement: 0,
    maintenancesEnRetard: 0,
    vehiculesForteConsommation: 0,
    reparationsEnCours: 0
  };

  // Coûts du mois
  coutsStats = {
    carburant: 0,
    reparations: 0,
    maintenance: 0,
    total: 0
  };

  // Véhicules nécessitant une attention
  vehiculesAttention: any[] = [];

  // Missions récentes
  missionsRecentes: any[] = [];

  isLoading = true;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Charger les statistiques principales du dashboard
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats: DashboardStats) => {
        this.parkingStats = {
          totalVehicules: this.safeNumber(stats.totalVehicules),
          vehiculesDisponibles: this.safeNumber(stats.vehiculesDisponibles),
          vehiculesEnMission: this.safeNumber(stats.vehiculesEnMission),
          vehiculesEnReparation: this.safeNumber(stats.vehiculesEnReparation),
          vehiculesEnMaintenance: this.safeNumber(stats.vehiculesEnMaintenance)
        };
        
        this.missionsStats.missionsEnCours = this.safeNumber(stats.missionsEnCours);
        this.alertes = {
          visitesEcheesProchainement: this.safeNumber(stats.alertes?.visitesEcheesProchainement),
          maintenancesEnRetard: this.safeNumber(stats.alertes?.maintenancesEnRetard),
          vehiculesForteConsommation: this.safeNumber(stats.alertes?.vehiculesForteConsommation),
          reparationsEnCours: this.safeNumber(stats.alertes?.reparationsEnCours)
        };
        this.coutsStats = {
          carburant: this.safeNumber(stats.coutsStats?.carburant),
          reparations: this.safeNumber(stats.coutsStats?.reparations),
          maintenance: this.safeNumber(stats.coutsStats?.maintenance),
          total: this.safeNumber(stats.coutsStats?.total)
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.isLoading = false;
        // Garder les données par défaut en cas d'erreur
        //this.setDefaultData();
      }
    });

    // Charger les missions en cours
    this.dashboardService.getMissionsEnCours().subscribe({
      next: (missions) => {
        this.missionsRecentes = missions.slice(0, 5); // Les 5 dernières missions
      },
      error: (error) => {
        console.error('Erreur lors du chargement des missions:', error);
      }
    });

    // Charger les véhicules nécessitant une attention
    this.dashboardService.getVehiculesVisiteTechnique(30).subscribe({
      next: (vehicules) => {
        this.vehiculesAttention = vehicules.map(v => ({
          immatriculation: v.immatriculation,
          probleme: `Visite technique échue le ${new Date(v.dateProchainerVisiteTechnique).toLocaleDateString()}`,
          priorite: 'haute'
        }));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des véhicules attention:', error);
      }
    });

    // Charger les maintenances en retard
    this.dashboardService.getMaintenancesEnRetard().subscribe({
      next: (maintenances) => {
        const maintenancesAttention = maintenances.map(m => ({
          immatriculation: m.vehicule?.immatriculation || 'N/A',
          probleme: `Maintenance ${m.typeMaintenance} en retard`,
          priorite: 'moyenne'
        }));
        this.vehiculesAttention = [...this.vehiculesAttention, ...maintenancesAttention];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des maintenances:', error);
      }
    });
  }

  //setDefaultData(): void {
  //  // Données de démonstration en cas d'erreur de connexion
  //  this.parkingStats = {
  //    totalVehicules: 45,
  //    vehiculesDisponibles: 32,
  //    vehiculesEnMission: 8,
  //    vehiculesEnReparation: 3,
  //    vehiculesEnMaintenance: 2
  //  };
  //  
  //  this.alertes = {
  //    visitesEcheesProchainement: 5,
  //    maintenancesEnRetard: 2,
  //    vehiculesForteConsommation: 3,
  //    reparationsEnCours: 3
  //  };
  //  
  //  this.coutsStats = {
  //    carburant: 12500,
  //    reparations: 8750,
  //    maintenance: 4200,
  //    total: 25450
  //  };
  //}

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'EN_COURS': return 'accent';
      case 'TERMINEE': return 'primary';
      case 'PLANIFIEE': return 'warn';
      default: return '';
    }
  }

  getPrioriteColor(priorite: string): string {
    switch (priorite) {
      case 'haute': return 'warn';
      case 'moyenne': return 'accent';
      case 'basse': return 'primary';
      default: return '';
    }
  }

  calculatePercentage(value: number, total: number): number {
    if (!total || total === 0) return 0;
    return Math.round((this.safeNumber(value) / total) * 100);
  }

  // Méthode pour gérer les valeurs nulles/undefined et éviter NaN
  safeNumber(value: number | undefined | null): number {
    return value ?? 0;
  }

  // Méthode pour calculer le total des véhicules en maintenance/réparation
  getTotalMaintenanceReparation(): number {
    return this.safeNumber(this.parkingStats.vehiculesEnReparation) + 
           this.safeNumber(this.parkingStats.vehiculesEnMaintenance);
  }
}
