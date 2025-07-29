import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { VehiculeService } from '../../services/vehicule.service';
import { MissionService } from '../../services/mission.service';
import { UserService } from '../../services/user-service/user-service';
import {  StatutVehicule, TypeCarburant , Vehicule, StatutMission } from '../../models/vehicule';
import { Mission } from '../../models/mission';
import { Utilisateur } from '../../models/utilisateur';
import { DialogLiberationVehiculeComponent } from './dialog-liberation-vehicule.component';

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
    MatGridListModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './vehicules.component.html',
  styleUrls: ['./vehicules.component.css']
})
export class VehiculesComponent implements OnInit {
  vehicules: Vehicule[] = [];
  vehiculesFiltres: Vehicule[] = [];
  isLoading = true;
  filtreStatut = 'TOUS';
  selectedFilter: string = 'TOUS'; // Pour cohérence avec missions
  utilisateurConnecte: Utilisateur | null = null;
  missionsEnCours: Map<number, Mission> = new Map(); // Stockage des missions en cours par ID de véhicule
  
  statutOptions = [
    { value: 'TOUS', label: 'Tous', count: 0 },
    { value: 'DISPONIBLE', label: 'Disponibles', count: 0 },
    { value: 'EN_MISSION', label: 'En mission', count: 0 },
    { value: 'EN_REPARATION', label: 'En réparation', count: 0 },
    { value: 'EN_MAINTENANCE', label: 'En maintenance', count: 0 }
  ];

  constructor(
    private vehiculeService: VehiculeService, 
    private router: Router,
    private missionService: MissionService,
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadUtilisateurConnecte();
    this.loadVehicules();
  }

  loadUtilisateurConnecte(): void {
    this.userService.getUserProfile().subscribe({
      next: (utilisateur) => {
        this.utilisateurConnecte = utilisateur;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil utilisateur:', error);
      }
    });
  }

  loadVehicules(): void {
    this.isLoading = true;
    this.vehiculeService.getAllVehicules().subscribe({
      next: (vehicules) => {
        
        this.vehicules = vehicules;
        this.vehiculesFiltres = vehicules;
        //this.loadDemoData();
        this.updateStatutCounts();
        this.loadMissionsEnCours(); // Charger les missions en cours
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

  loadMissionsEnCours(): void {
    // Charger les missions en cours pour chaque véhicule en mission
    const vehiculesEnMission = this.vehicules.filter(v => v.statut === 'EN_MISSION');
    
    vehiculesEnMission.forEach(vehicule => {
      if (vehicule.id) {
        this.missionService.getMissionEnCoursByVehicule(vehicule.id).subscribe({
          next: (mission) => {
            //const missionEnCours = missions.find(mission => 
            //  mission.statut === StatutMission.EN_COURS
            //);
            if (mission && vehicule.id) {
              this.missionsEnCours.set(vehicule.id, mission);
            }
          },
          error: (error) => {
            console.error(`Erreur lors du chargement de la mission pour le véhicule ${vehicule.id}:`, error);
          }
        });
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
    this.loadMissionsEnCours(); // Charger les missions en cours même pour les données de demo
  }

  filtrerParStatut(statut: string): void {
    this.filtreStatut = statut;
    this.selectedFilter = statut; // Pour cohérence avec missions
    if (statut === 'TOUS') {
      this.vehiculesFiltres = this.vehicules;
    } else {
      this.vehiculesFiltres = this.vehicules.filter(v => v.statut === statut);
    }
  }

  isFilterActive(filter: string): boolean {
    return this.selectedFilter === filter;
  }

  getVehiculesCount(statut: string): number {
    if (statut === 'TOUS') {
      return this.vehicules.length;
    }
    return this.vehicules.filter(v => v.statut === statut).length;
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

  voirDetails(vehicule: Vehicule): void {
    console.log('Voir détails du véhicule:', vehicule);
    this.router.navigate(['/admin/vehicules', vehicule.id]);
  }

  assignerVehicule(vehicule: Vehicule): void {
    console.log('Assigner véhicule:', vehicule);
    // Navigation vers le formulaire de mission avec l'ID du véhicule
    this.router.navigate(['/admin/form-mission', vehicule.id]);
  }

  libererVehicule(vehicule: Vehicule): void {
    console.log('Libérer véhicule:', vehicule);
    
    // D'abord récupérer l'utilisateur connecté
    this.userService.getUserProfile().subscribe({
      next: (utilisateurConnecte) => {
        // Ensuite récupérer les missions en cours pour ce véhicule
        if (!vehicule.id) {
          this.snackBar.open('ID du véhicule manquant', 'Fermer', { duration: 3000 });
          return;
        }

        const missionEnCours = this.missionsEnCours.get(vehicule.id);

        if (missionEnCours) {
          // Vérifier si l'utilisateur connecté est le conducteur de la mission
          if (missionEnCours.conducteur.id !== utilisateurConnecte.id) {
            this.snackBar.open(
              'Vous ne pouvez terminer que vos propres missions', 
              'Fermer', 
              { duration: 4000 }
            );
            return;
          }
          
          // Ouvrir la boîte de dialogue pour saisir les informations
          this.ouvrirDialogueLiberation(missionEnCours, vehicule);
        } else {
          this.snackBar.open('Aucune mission en cours trouvée pour ce véhicule', 'Fermer', {
            duration: 3000
          });
        }
      },
      error: (error: any) => {
        console.error('Erreur lors de la récupération du profil utilisateur:', error);
        this.snackBar.open('Erreur lors de la vérification des autorisations', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  ouvrirDialogueLiberation(mission: Mission, vehicule: Vehicule): void {
    const dialogRef = this.dialog.open(DialogLiberationVehiculeComponent, {
      width: '500px',
      data: {
        mission: mission,
        vehicule: vehicule
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Appeler l'API de libération avec les données saisies
        this.terminerMission(mission.id!, result.kilometrageRetour, result.observations);
      }
    });
  }

  terminerMission(missionId: number, kilometrageRetour: number, observations?: string): void {
    this.missionService.terminerMission(missionId, kilometrageRetour, observations).subscribe({
      next: (mission: any) => {
        this.snackBar.open('Mission terminée avec succès', 'Fermer', {
          duration: 3000
        });
        
        // Nettoyer le cache des missions pour le véhicule concerné
        if (mission.vehicule && mission.vehicule.id) {
          this.missionsEnCours.delete(mission.vehicule.id);
        }
        
        // Recharger la liste des véhicules pour mettre à jour les statuts
        this.loadVehicules();
      },
      error: (error: any) => {
        console.error('Erreur lors de la terminaison de la mission:', error);
        this.snackBar.open('Erreur lors de la terminaison de la mission', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  canLibererVehicule(vehicule: Vehicule): boolean {
    // Si l'utilisateur connecté n'est pas chargé, ne pas afficher le bouton
    if (!this.utilisateurConnecte || !vehicule.id) {
      return false;
    }

    // Si le véhicule n'est pas en mission, il ne peut pas être libéré
    if (vehicule.statut !== 'EN_MISSION') {
      return false;
    }

    // Récupérer la mission en cours pour ce véhicule
    const missionEnCours = this.missionsEnCours.get(vehicule.id);
    
    // Si aucune mission en cours trouvée, ne pas afficher le bouton
    if (!missionEnCours) {
      return false;
    }

    // Vérifier si l'utilisateur connecté est le conducteur de la mission
    return missionEnCours.conducteur.id === this.utilisateurConnecte.id;
  }

  getConducteurMission(vehicule: Vehicule): string | null {
    if (!vehicule.id || vehicule.statut !== 'EN_MISSION') {
      return null;
    }

    const missionEnCours = this.missionsEnCours.get(vehicule.id);
    if (missionEnCours && missionEnCours.conducteur) {
      return `${missionEnCours.conducteur.prenom} ${missionEnCours.conducteur.nom}`;
    }

    return null;
  }

  isCurrentUserConducteur(vehicule: Vehicule): boolean {
    if (!this.utilisateurConnecte || !vehicule.id || vehicule.statut !== 'EN_MISSION') {
      return false;
    }

    const missionEnCours = this.missionsEnCours.get(vehicule.id);
    return missionEnCours?.conducteur.id === this.utilisateurConnecte.id;
  }

  ajouterVehicule(): void {
    this.router.navigate(['/admin/form-ajout-vehicule']);
  }
}
