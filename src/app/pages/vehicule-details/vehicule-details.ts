import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VehiculeService } from '../../services/vehicule.service';
import { Vehicule, StatutVehicule, TypeCarburant } from '../../models/vehicule';

@Component({
  selector: 'app-vehicule-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './vehicule-details.html',
  styleUrl: './vehicule-details.css'
})
export class VehiculeDetails implements OnInit {
  vehicule: Vehicule | null = null;
  isLoading = true;
  vehiculeId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehiculeService: VehiculeService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du véhicule depuis l'URL
    this.route.params.subscribe(params => {
      this.vehiculeId = +params['id']; // Le + convertit en number
      if (this.vehiculeId) {
        this.loadVehiculeDetails();
      }
    });
  }

  loadVehiculeDetails(): void {
    this.isLoading = true;
    this.vehiculeService.getVehiculeById(this.vehiculeId!).subscribe({
      next: (vehicule) => {
        this.vehicule = vehicule;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du véhicule:', err);
        this.isLoading = false;
      }
    });
    
    
  }

  // Méthode temporaire pour simuler la récupération d'un véhicule
  private getVehiculeFactice(id: number): Vehicule | null {
    const vehicules: Vehicule[] = [
      {
        id: 1,
        immatriculation: 'AB-123-CD',
        marque: 'Renault',
        modele: 'Clio V',
        statut: StatutVehicule.DISPONIBLE,
        annee: 2022,
        kilometrageActuel: 25000,
        typeCarburant: TypeCarburant.ESSENCE,
        consommationMoyenne: 5.8,
        capaciteReservoir: 45,
        dateMiseEnService: '2022-03-15',
        dateDerniereVisiteTechnique: '2024-03-10',
        dateProchainerVisiteTechnique: '2026-03-10'
      },
      {
        id: 2,
        immatriculation: 'EF-456-GH',
        marque: 'Peugeot',
        modele: '3008',
        statut: StatutVehicule.EN_MISSION,
        annee: 2021,
        kilometrageActuel: 35000,
        typeCarburant: TypeCarburant.DIESEL,
        consommationMoyenne: 6.2,
        capaciteReservoir: 60,
        dateMiseEnService: '2021-06-20',
        dateDerniereVisiteTechnique: '2023-06-15',
        dateProchainerVisiteTechnique: '2025-06-15'
      },
      {
        id: 3,
        immatriculation: 'IJ-789-KL',
        marque: 'Ford',
        modele: 'Transit',
        statut: StatutVehicule.EN_REPARATION,
        annee: 2019,
        kilometrageActuel: 45000,
        typeCarburant: TypeCarburant.DIESEL,
        consommationMoyenne: 8.5,
        capaciteReservoir: 80,
        dateMiseEnService: '2019-09-10',
        dateDerniereVisiteTechnique: '2023-09-05',
        dateProchainerVisiteTechnique: '2025-09-05'
      },
      {
        id: 4,
        immatriculation: 'MN-012-OP',
        marque: 'Citroën',
        modele: 'Berlingo Multispace',
        statut: StatutVehicule.EN_MAINTENANCE,
        annee: 2020,
        kilometrageActuel: 60000,
        typeCarburant: TypeCarburant.DIESEL,
        consommationMoyenne: 7.1,
        capaciteReservoir: 55,
        dateMiseEnService: '2020-01-12',
        dateDerniereVisiteTechnique: '2024-01-08',
        dateProchainerVisiteTechnique: '2026-01-08'
      },
      {
        id: 5,
        immatriculation: 'QR-345-ST',
        marque: 'Volkswagen',
        modele: 'Golf 8',
        statut: StatutVehicule.DISPONIBLE,
        annee: 2023,
        kilometrageActuel: 8000,
        typeCarburant: TypeCarburant.ESSENCE,
        consommationMoyenne: 5.2,
        capaciteReservoir: 50,
        dateMiseEnService: '2023-05-20',
        dateDerniereVisiteTechnique: '2024-05-15',
        dateProchainerVisiteTechnique: '2026-05-15'
      }
    ];
    
    return vehicules.find(v => v.id === id) || null;
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'DISPONIBLE': return '#4CAF50';
      case 'EN_MISSION': return '#2196F3';
      case 'EN_REPARATION': return '#FF5722';
      case 'EN_MAINTENANCE': return '#FF9800';
      default: return '#9E9E9E';
    }
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'DISPONIBLE': return 'check_circle';
      case 'EN_MISSION': return 'directions_car';
      case 'EN_REPARATION': return 'build';
      case 'EN_MAINTENANCE': return 'settings';
      default: return 'help';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'DISPONIBLE': return 'Disponible';
      case 'EN_MISSION': return 'En mission';
      case 'EN_REPARATION': return 'En réparation';
      case 'EN_MAINTENANCE': return 'En maintenance';
      default: return statut;
    }
  }

  retourVersListe(): void {
    this.router.navigate(['/admin/vehicules']);
  }

  modifierVehicule(): void {
    if (this.vehicule?.id) {
      this.router.navigate(['/admin/modifier-vehicule', this.vehicule.id]);
    }
  }
}
