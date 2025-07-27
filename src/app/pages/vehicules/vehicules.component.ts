import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { Router } from '@angular/router';
import { VehiculeService } from '../../services/vehicule.service';
import {  StatutVehicule, TypeCarburant , Vehicule } from '../../models/vehicule';

@Component({
  selector: 'app-vehicules',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatGridListModule
  ],
  templateUrl: './vehicules.component.html',
  styleUrls: ['./vehicules.component.css']
})
export class VehiculesComponent implements OnInit {
  vehicules: Vehicule[] = [];
  vehiculesFiltres: Vehicule[] = [];
  isLoading = true;
  filtreStatut = 'TOUS';
  
  statutOptions = [
    { value: 'TOUS', label: 'Tous', count: 0 },
    { value: 'DISPONIBLE', label: 'Disponibles', count: 0 },
    { value: 'EN_MISSION', label: 'En mission', count: 0 },
    { value: 'EN_REPARATION', label: 'En réparation', count: 0 },
    { value: 'EN_MAINTENANCE', label: 'En maintenance', count: 0 }
  ];

  constructor(private vehiculeService: VehiculeService, private router: Router) { }

  ngOnInit(): void {
    this.loadVehicules();
  }

  loadVehicules(): void {
    this.isLoading = true;
    this.vehiculeService.getAllVehicules().subscribe({
      next: (vehicules) => {
        
        this.vehicules = vehicules;
        this.vehiculesFiltres = vehicules;
        //this.loadDemoData();
        this.updateStatutCounts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des véhicules:', error);
        this.isLoading = false;
        // Données de démonstration en cas d'erreur
        this.loadDemoData();
      }
    });
  }

  loadDemoData(): void {
    // Données de démonstration
    this.vehicules = [
      {
        id: 1,
        immatriculation: 'AB-123-CD',
        marque: 'Peugeot',
        modele: '308 SW',
        statut: StatutVehicule.DISPONIBLE,
        annee: 2022,
        kilometrageActuel: 25000,
        typeCarburant: TypeCarburant.ESSENCE
      },
      {
        id: 2,
        immatriculation: 'EF-456-GH',
        marque: 'Renault',
        modele: 'Clio V',
        statut: StatutVehicule.EN_MISSION,
        annee: 2023,
        kilometrageActuel: 15000,
        typeCarburant: TypeCarburant.DIESEL
      },
      {
        id: 3,
        immatriculation: 'IJ-789-KL',
        marque: 'Ford',
        modele: 'Transit Custom',
        statut: StatutVehicule.EN_REPARATION,
        annee: 2021,
        kilometrageActuel: 45000,
        typeCarburant: TypeCarburant.DIESEL
      },
      {
        id: 4,
        immatriculation: 'MN-012-OP',
        marque: 'Citroën',
        modele: 'Berlingo Multispace',
        statut: StatutVehicule.EN_MAINTENANCE,
        annee: 2020,
        kilometrageActuel: 60000,
        typeCarburant: TypeCarburant.DIESEL
      },
      {
        id: 5,
        immatriculation: 'QR-345-ST',
        marque: 'Volkswagen',
        modele: 'Golf 8',
        statut: StatutVehicule.DISPONIBLE,
        annee: 2023,
        kilometrageActuel: 8000,
        typeCarburant: TypeCarburant.ESSENCE
      }
    ];
    this.vehiculesFiltres = this.vehicules;
    this.updateStatutCounts();
  }

  filtrerParStatut(statut: string): void {
    this.filtreStatut = statut;
    if (statut === 'TOUS') {
      this.vehiculesFiltres = this.vehicules;
    } else {
      this.vehiculesFiltres = this.vehicules.filter(v => v.statut === statut);
    }
  }

  updateStatutCounts(): void {
    this.statutOptions.forEach(option => {
      if (option.value === 'TOUS') {
        option.count = this.vehicules.length;
      } else {
        option.count = this.vehicules.filter(v => v.statut === option.value).length;
      }
    });
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'DISPONIBLE': return '#4CAF50'; // Vert
      case 'EN_MISSION': return '#2196F3'; // Bleu
      case 'EN_REPARATION': return '#FF5722'; // Rouge/Orange
      case 'EN_MAINTENANCE': return '#FF9800'; // Orange
      default: return '#9E9E9E'; // Gris
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

 // getUtilisateurInfo(vehicule: Vehicule): string {
 //   if (vehicule.utilisateur) {
 //     return `${vehicule.utilisateur.prenom} ${vehicule.utilisateur.nom}`;
 //   }
 //   return 'Non assigné';
 // }

  onVehiculeClick(vehicule: Vehicule): void {
    // Navigation vers la page de détails du véhicule
    console.log('Véhicule sélectionné:', vehicule);
    this.router.navigate(['/admin/vehicules', vehicule.id]);
  }

  ajouterVehicule(): void {
    this.router.navigate(['/admin/form-ajout-vehicule']);
  }
}
