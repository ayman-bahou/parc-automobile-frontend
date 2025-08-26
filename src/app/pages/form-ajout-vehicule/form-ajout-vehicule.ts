import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { VehiculeService } from '../../services/vehicule.service';
import { Vehicule, TypeCarburant, StatutVehicule } from '../../models/vehicule';

@Component({
  selector: 'app-form-ajout-vehicule',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule
  ],
  templateUrl: './form-ajout-vehicule.html',
  styleUrl: './form-ajout-vehicule.css'
})
export class FormAjoutVehicule implements OnInit {
  vehiculeForm!: FormGroup;
  isLoading = false;
  isEditMode = false;
  vehiculeId: number | null = null;
  vehicule: Vehicule | null = null;
  
  // Options pour les selects
  marques = [
    'Peugeot', 'Renault', 'Citroën', 'Ford', 'Volkswagen', 
    'BMW', 'Mercedes', 'Audi', 'Toyota', 'Honda', 'Nissan'
  ];
  
  typesCarburant = [
    { value: TypeCarburant.ESSENCE, label: 'Essence' },
    { value: TypeCarburant.DIESEL, label: 'Diesel' },
    { value: TypeCarburant.HYBRIDE, label: 'Hybride' },
    { value: TypeCarburant.ELECTRIQUE, label: 'Électrique' },
    { value: TypeCarburant.GPL, label: 'GPL' }
  ];
  
  statuts = [
    { value: StatutVehicule.DISPONIBLE, label: 'Disponible' },
    { value: StatutVehicule.EN_MAINTENANCE, label: 'En maintenance' },
    { value: StatutVehicule.EN_REPARATION, label: 'En réparation' }
  ];
  
  typesVehicule = [
    { value: 'BERLINE', label: 'Berline' },
    { value: 'BREAK', label: 'Break' },
    { value: 'SUV', label: 'SUV' },
    { value: 'UTILITAIRE', label: 'Utilitaire' },
    { value: 'CAMIONNETTE', label: 'Camionnette' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private vehiculeService: VehiculeService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    // Vérifier si on est en mode modification
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.vehiculeId = +params['id'];
        this.loadVehiculeForEdit(this.vehiculeId);
      }
    });
  }

  initializeForm(): void {
    this.vehiculeForm = this.formBuilder.group({
      // Informations de base - correspondant à l'interface Vehicule
      immatriculation: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}-\d{3}-[A-Z]{2}$/)]],
      marque: ['', Validators.required],
      modele: ['', [Validators.required, Validators.minLength(2)]],
      
      // Caractéristiques techniques
      annee: ['', [Validators.required, Validators.min(1990), Validators.max(new Date().getFullYear())]],
      kilometrageActuel: ['', [Validators.required, Validators.min(0)]],
      typeCarburant: ['', Validators.required],
      
      // Informations administratives
      dateMiseEnService: [''],
      
      
      // État et statut
      statut: [StatutVehicule.DISPONIBLE, Validators.required],
      
      // Informations optionnelles
      consommationMoyenne: ['', [Validators.min(0)]],
      capaciteReservoir: ['', [Validators.min(1), Validators.max(200)]]
    });
  }

  loadVehiculeForEdit(id: number): void {
    this.isLoading = true;
    this.vehiculeService.getVehiculeById(id).subscribe({
      next: (vehicule) => {
        this.vehicule = vehicule;
        this.populateForm(vehicule);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du véhicule:', error);
        this.snackBar.open('Erreur lors du chargement du véhicule', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
        this.router.navigate(['/admin/vehicules']);
      }
    });
  }

  populateForm(vehicule: Vehicule): void {
    this.vehiculeForm.patchValue({
      immatriculation: vehicule.immatriculation,
      marque: vehicule.marque,
      modele: vehicule.modele,
      annee: vehicule.annee,
      kilometrageActuel: vehicule.kilometrageActuel,
      typeCarburant: vehicule.typeCarburant,
      dateMiseEnService: vehicule.dateMiseEnService ? new Date(vehicule.dateMiseEnService) : null,
      
      statut: vehicule.statut,
      consommationMoyenne: vehicule.consommationMoyenne,
      capaciteReservoir: vehicule.capaciteReservoir
    });
  }

  onSubmit(): void {
    if (this.vehiculeForm.valid) {
      this.isLoading = true;
      
      const vehiculeData: Partial<Vehicule> = this.vehiculeForm.value;
      
      if (this.isEditMode && this.vehiculeId) {
        // Mode modification
        this.vehiculeService.updateVehicule(this.vehiculeId, vehiculeData as Vehicule).subscribe({
          next: (_) => {
            this.isLoading = false;
            this.snackBar.open('Véhicule modifié avec succès !', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/admin/vehicules', this.vehiculeId]);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Erreur lors de la modification du véhicule:', error);
            this.snackBar.open('Erreur lors de la modification du véhicule', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      } else {
        // Mode ajout
        this.vehiculeService.createVehicule(vehiculeData as Vehicule).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.snackBar.open('Véhicule ajouté avec succès !', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/admin/vehicules']);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Erreur lors de l\'ajout du véhicule:', error);
            this.snackBar.open('Erreur lors de l\'ajout du véhicule', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.vehiculeForm.controls).forEach(key => {
      const control = this.vehiculeForm.get(key);
      control?.markAsTouched();
    });
  }

  resetForm(): void {
    this.vehiculeForm.reset();
    this.vehiculeForm.patchValue({
      statut: StatutVehicule.DISPONIBLE
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/vehicules']);
  }

  // Méthodes de validation personnalisées
  getErrorMessage(fieldName: string): string {
    const control = this.vehiculeForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength'].requiredLength} caractères`;
    }
    if (control?.hasError('pattern')) {
      if (fieldName === 'immatriculation') {
        return 'Format requis: AB-123-CD';
      }
    }
    if (control?.hasError('min')) {
      return `Valeur minimale: ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('max')) {
      return `Valeur maximale: ${control.errors?.['max'].max}`;
    }
    return '';
  }
}
