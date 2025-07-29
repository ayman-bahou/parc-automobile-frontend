import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { VehiculeService } from '../../services/vehicule.service';
import { MissionService } from '../../services/mission.service';
import { Vehicule, StatutMission } from '../../models/vehicule';
import { Mission } from '../../models/mission';
import { Utilisateur } from '../../models/utilisateur';
import { UserService } from '../../services/user-service/user-service';

@Component({
  selector: 'app-form-mission',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  templateUrl: './form-mission.html',
  styleUrls: ['./form-mission.css']
})
export class FormMissionComponent implements OnInit {
  missionForm: FormGroup;
  vehiculeId: number | null = null;
  vehicule: Vehicule | null = null;
  conducteur: Utilisateur | null = null;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private userService:UserService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vehiculeService: VehiculeService,
    private missionService: MissionService,
    private snackBar: MatSnackBar
  ) {
    this.missionForm = this.fb.group({
      objet: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      lieuDepart: ['', [Validators.required]],
      lieuDestination: ['', [Validators.required]],
      dateDebut: ['', [Validators.required]],
      dateFin: [''],
      conducteurId: ['', [Validators.required]],
      kilometrageDepart: ['', [Validators.required, Validators.min(0)]],
      observations: ['']
    });
  }

  ngOnInit(): void {
    // Récupérer l'ID du véhicule depuis l'URL
    this.route.params.subscribe(params => {
      this.vehiculeId = +params['id'];
      if (this.vehiculeId) {
        this.loadVehicule();
        this.loadConducteur(); // Charger le conducteur connecté
      } else {
        this.showError('ID de véhicule manquant');
        this.router.navigate(['/admin/vehicules']);
      }
    });
  }

  loadVehicule(): void {
    if (!this.vehiculeId) return;
    
    this.isLoading = true;
    this.vehiculeService.getVehiculeById(this.vehiculeId).subscribe({
      next: (vehicule) => {
        this.vehicule = vehicule;
        // Pré-remplir le kilométrage de départ avec le kilométrage actuel du véhicule
        this.missionForm.patchValue({
          kilometrageDepart: vehicule.kilometrageActuel
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du véhicule:', error);
        this.showError('Erreur lors du chargement du véhicule');
        this.isLoading = false;
      }
    });
  }

  loadConducteur(): void {
    this.userService.getUserProfile().subscribe({
      next: (conducteur) => {
        this.conducteur = conducteur;
        // Remplir automatiquement le champ conducteurId avec l'utilisateur connecté
        this.missionForm.patchValue({
          conducteurId: conducteur.id
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement du conducteur:', error);
        this.showError('Erreur lors du chargement du conducteur');
      }
    });
  }  onSubmit(): void {
    if (this.missionForm.valid && this.vehicule) {
      this.isSubmitting = true;
      
      const formValue = this.missionForm.value;
      
      // Vérifier que le conducteur est bien chargé
      if (!this.conducteur) {
        this.loadConducteur(); // Tenter de recharger le conducteur
        this.showError('Conducteur sélectionné introuvable');
        this.isSubmitting = false;
        return;
      }

      const mission: Mission = {
        objet: formValue.objet,
        description: formValue.description,
        lieuDepart: formValue.lieuDepart,
        lieuDestination: formValue.lieuDestination,
        dateDebut: new Date(formValue.dateDebut),
        dateFin: formValue.dateFin ? new Date(formValue.dateFin) : undefined,
        statut: StatutMission.PLANIFIEE,
        kilometrageDepart: formValue.kilometrageDepart,
        observations: formValue.observations,
        vehicule: this.vehicule,
        conducteur: this.conducteur
      };

      this.missionService.createMission(mission).subscribe({
        next: (missionCreee) => {
          this.showSuccess('Mission créée avec succès');
          this.router.navigate(['/admin/vehicules']);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Erreur lors de la création de la mission:', error);
          this.showError('Erreur lors de la création de la mission');
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/vehicules']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.missionForm.controls).forEach(key => {
      this.missionForm.get(key)?.markAsTouched();
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Méthodes pour l'affichage du statut du véhicule
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

  // Getters pour faciliter l'accès aux erreurs de validation
  get objet() { return this.missionForm.get('objet'); }
  get lieuDepart() { return this.missionForm.get('lieuDepart'); }
  get lieuDestination() { return this.missionForm.get('lieuDestination'); }
  get dateDebut() { return this.missionForm.get('dateDebut'); }
  get conducteurId() { return this.missionForm.get('conducteurId'); }
  get kilometrageDepart() { return this.missionForm.get('kilometrageDepart'); }
}
