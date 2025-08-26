import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ReparationDTO, TypeReparation, StatutReparation, ReparationDisplay } from '../../models/reparation';
import { Vehicule } from '../../models/vehicule';
import { ReparationService } from '../../services/reparation.service';
import { VehiculeService } from '../../services/vehicule.service';
import { AuthService } from '../../services/auth-service/auth-service';
import { SignalementService } from '../../services/signalement.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-form-reparation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form-reparation.component.html',
  styleUrl: './form-reparation.component.css'
})
export class FormReparationComponent implements OnInit {
  reparationForm!: FormGroup;
  isEditMode = false;
  signalementId: number | null = null;
  reparationId: number | null = null;
  loading = false;
  submitting = false;
  error: string | null = null;

  // Data
  vehicules: Vehicule[] = [];
  currentUserId: number | null = null;

  // Enums pour les templates
  TypeReparation = TypeReparation;
  StatutReparation = StatutReparation;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private reparationService: ReparationService,
    private vehiculeService: VehiculeService,
    private authService: AuthService,
    private signalementService: SignalementService,
    private snackBar: MatSnackBar
  )  {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadVehicules();
    this.loadCurrentUserId();
    
    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.reparationId = +params['id'];
        this.loadReparation(this.reparationId);
      }else if (params['idSignalement']) {
        this.signalementId = +params['idSignalement'];
      }
    });
  }

  private initializeForm(): void {
    // Obtenir la date actuelle au format ISO (YYYY-MM-DD)
    const currentDate = new Date().toISOString().split('T')[0];
    
    this.reparationForm = this.fb.group({
      typeReparation: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      coutPieces: [0, [Validators.min(0)]],
      coutMainOeuvre: [0, [Validators.min(0)]],
      kilometrageReparation: [''],
      nomGarage: [''],
      numeroFacture: [''],
      statut: [StatutReparation.EN_COURS],
      dateDebutReparation: [currentDate],
      dateFinReparation: [''],
      observations: [''],
      vehiculeId: ['', Validators.required]
    });
  }

  private loadVehicules(): void {
    this.vehiculeService.getVehiculesForReparation().subscribe({
      next: (vehicules) => {
        this.vehicules = vehicules;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des véhicules:', err);
        this.error = 'Erreur lors du chargement des véhicules';
      }
    });
  }

  private loadCurrentUserId(): void {
    // Récupérer l'ID de l'utilisateur actuel depuis le service d'authentification
    this.currentUserId = this.authService.getCurrentUserId();
  }

  private loadReparation(id: number): void {
    this.loading = true;
    this.reparationService.getReparationById(id).subscribe({
      next: (reparation) => {
        this.populateForm(reparation);
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Erreur lors du chargement de la réparation';
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  private populateForm(reparation: ReparationDTO): void {
    this.reparationForm.patchValue({
      typeReparation: reparation.typeReparation,
      description: reparation.description,
      coutPieces: reparation.coutPieces || 0,
      coutMainOeuvre: reparation.coutMainOeuvre || 0,
      kilometrageReparation: reparation.kilometrageReparation,
      nomGarage: reparation.nomGarage,
      numeroFacture: reparation.numeroFacture,
      statut: reparation.statut,
      dateDebutReparation: reparation.dateDebutReparation,
      dateFinReparation: reparation.dateFinReparation,
      observations: reparation.observations,
      vehiculeId: reparation.vehiculeId
    });
  }

  onSubmit(): void {
    if (this.reparationForm.valid) {
      this.submitting = true;
      this.error = null;

      const formData = this.reparationForm.value;
      
      // Calculer le coût total
      const coutTotal = (formData.coutPieces || 0) + (formData.coutMainOeuvre || 0);

      const reparationData: ReparationDTO = {
        ...formData,
        coutTotal: coutTotal,
        utilisateurId: this.currentUserId || 1 // Fallback au cas où
      };

      // Ne pas envoyer dateFinReparation lors de la création (seulement en mode édition)
      if (!this.isEditMode) {
        delete reparationData.dateFinReparation;
      }

      if (this.isEditMode && this.reparationId) {
        reparationData.id = this.reparationId;
        this.updateReparation(reparationData);
      } else {
        this.createReparation(reparationData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createReparation(reparation: ReparationDTO): void {
    this.reparationService.createReparation(reparation).subscribe({
      next: (response) => {
        if(this.signalementId) {
          this.signalementService.resoudreSignalement(this.signalementId).subscribe({
            next: () => {
              this.snackBar.open('Signalement résolu', 'Fermer', { duration: 3000 });
              this.router.navigate(['/admin/reparations']);
            },
            error: (err: HttpErrorResponse) => {
              this.error = 'Erreur lors de la résolution du signalement';
              console.error('Erreur:', err);
              this.submitting = false;
            }
          });
        } else {
          this.router.navigate(['/admin/reparations']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Erreur lors de la création de la réparation';
        console.error('Erreur:', err);
        this.submitting = false;
      }
    });
  }

  private updateReparation(reparation: ReparationDTO): void {
    this.reparationService.updateReparation(this.reparationId!, reparation).subscribe({
      next: (response) => {
        this.router.navigate(['/admin/reparations']);
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Erreur lors de la modification de la réparation';
        console.error('Erreur:', err);
        this.submitting = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.reparationForm.controls).forEach(key => {
      const control = this.reparationForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/reparations']);
  }

  // Getters pour la validation
  get dateDebutReparation() { return this.reparationForm.get('dateDebutReparation'); }
  get typeReparation() { return this.reparationForm.get('typeReparation'); }
  get description() { return this.reparationForm.get('description'); }
  get coutPieces() { return this.reparationForm.get('coutPieces'); }
  get coutMainOeuvre() { return this.reparationForm.get('coutMainOeuvre'); }
  get vehiculeId() { return this.reparationForm.get('vehiculeId'); }

  // Calcul du coût total en temps réel
  get coutTotal(): number {
    const pieces = this.reparationForm.get('coutPieces')?.value || 0;
    const mainOeuvre = this.reparationForm.get('coutMainOeuvre')?.value || 0;
    return pieces + mainOeuvre;
  }

  // Utilitaires pour les options
  getTypeReparationOptions() {
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

  getStatutReparationOptions() {
    return [
      { value: StatutReparation.EN_COURS, label: 'En Cours' },
      { value: StatutReparation.TERMINEE, label: 'Terminée' }
    ];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}
