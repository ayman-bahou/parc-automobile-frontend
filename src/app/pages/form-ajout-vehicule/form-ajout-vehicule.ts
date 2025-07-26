import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { Vehicule } from '../../models/vehicule';

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
  
  // Options pour les selects
  marques = [
    'Peugeot', 'Renault', 'Citroën', 'Ford', 'Volkswagen', 
    'BMW', 'Mercedes', 'Audi', 'Toyota', 'Honda', 'Nissan'
  ];
  
  typesCarburant = [
    { value: 'Essence', label: 'Essence' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Hybride', label: 'Hybride' },
    { value: 'Electrique', label: 'Électrique' },
    { value: 'GPL', label: 'GPL' }
  ];
  
  statuts = [
    { value: 'DISPONIBLE', label: 'Disponible' },
    { value: 'EN_MAINTENANCE', label: 'En maintenance' },
    { value: 'EN_REPARATION', label: 'En réparation' }
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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.vehiculeForm = this.formBuilder.group({
      // Informations de base
      nom: ['', [Validators.required, Validators.minLength(2)]],
      marque: ['', Validators.required],
      modele: ['', [Validators.required, Validators.minLength(2)]],
      immatriculation: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}-\d{3}-[A-Z]{2}$/)]],
      
      // Caractéristiques techniques
      annee: ['', [Validators.required, Validators.min(1990), Validators.max(new Date().getFullYear())]],
      kilometrage: ['', [Validators.required, Validators.min(0)]],
      carburant: ['', Validators.required],
      typeVehicule: ['', Validators.required],
      
      // Informations administratives
      dateAchat: [''],
      dateProchainerVisiteTechnique: [''],
      numeroSerie: [''],
      
      // État et statut
      statut: ['DISPONIBLE', Validators.required],
      
      // Informations optionnelles
      couleur: [''],
      nombrePlaces: ['', [Validators.min(1), Validators.max(50)]],
      consommationMoyenne: ['', [Validators.min(0)]],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.vehiculeForm.valid) {
      this.isLoading = true;
      
      const vehiculeData: Partial<Vehicule> = this.vehiculeForm.value;
      
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
      statut: 'DISPONIBLE'
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
        return 'Format: AB-123-CD';
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
