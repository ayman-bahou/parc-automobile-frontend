import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ConsommationService } from '../../services/consommation.service';
import { Consommation, TypeConsommation } from '../../models/consommation';
import { Vehicule } from '../../models/vehicule';
import { Utilisateur } from '../../models/utilisateur';

@Component({
  selector: 'app-form-consommation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  template: `
    <div class="form-consommation-container">
      <h2 mat-dialog-title>
        <mat-icon>local_gas_station</mat-icon>
        Ajouter une consommation
      </h2>
      
      <mat-dialog-content>
        <div class="vehicule-info">
          <h3>Véhicule : {{ data.vehicule.marque }} {{ data.vehicule.modele }}</h3>
          <p>Immatriculation : {{ data.vehicule.immatriculation }}</p>
        </div>

        <form [formGroup]="consommationForm" class="consommation-form">
          <!-- Date de consommation -->
          <mat-form-field appearance="outline">
            <mat-label>Date de consommation</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="dateConsommation" required>
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="consommationForm.get('dateConsommation')?.hasError('required')">
              La date est obligatoire
            </mat-error>
          </mat-form-field>

          <!-- Type de consommation -->
          <mat-form-field appearance="outline">
            <mat-label>Type de consommation</mat-label>
            <mat-select formControlName="typeConsommation" required>
              <mat-option *ngFor="let type of typesConsommation" [value]="type.value">
                <mat-icon>{{ type.icon }}</mat-icon>
                {{ type.label }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="consommationForm.get('typeConsommation')?.hasError('required')">
              Le type est obligatoire
            </mat-error>
          </mat-form-field>

          <!-- Quantité -->
          <mat-form-field appearance="outline">
            <mat-label>Quantité</mat-label>
            <input matInput type="number" step="0.01" formControlName="quantite" required>
            <span matSuffix>L</span>
            <mat-error *ngIf="consommationForm.get('quantite')?.hasError('required')">
              La quantité est obligatoire
            </mat-error>
            <mat-error *ngIf="consommationForm.get('quantite')?.hasError('min')">
              La quantité doit être positive
            </mat-error>
          </mat-form-field>

          <!-- Prix unitaire -->
          <mat-form-field appearance="outline">
            <mat-label>Prix unitaire</mat-label>
            <input matInput type="number" step="0.001" formControlName="prixUnitaire" required>
            <span matSuffix>€/L</span>
            <mat-error *ngIf="consommationForm.get('prixUnitaire')?.hasError('required')">
              Le prix unitaire est obligatoire
            </mat-error>
            <mat-error *ngIf="consommationForm.get('prixUnitaire')?.hasError('min')">
              Le prix doit être positif
            </mat-error>
          </mat-form-field>

          <!-- Montant total (calculé automatiquement) -->
          <mat-form-field appearance="outline">
            <mat-label>Montant total</mat-label>
            <input matInput type="number" step="0.01" formControlName="montantTotal" readonly>
            <span matSuffix>€</span>
          </mat-form-field>

          <!-- Kilométrage actuel -->
          <mat-form-field appearance="outline">
            <mat-label>Kilométrage actuel</mat-label>
            <input matInput type="number" formControlName="kilometrageActuel">
            <span matSuffix>km</span>
          </mat-form-field>

          <!-- Nom du fournisseur -->
          <mat-form-field appearance="outline">
            <mat-label>Nom du fournisseur</mat-label>
            <input matInput formControlName="nomFournisseur">
          </mat-form-field>

          <!-- Numéro de facture -->
          <mat-form-field appearance="outline">
            <mat-label>Numéro de facture</mat-label>
            <input matInput formControlName="numeroFacture">
          </mat-form-field>

          <!-- Observations -->
          <mat-form-field appearance="outline">
            <mat-label>Observations</mat-label>
            <textarea matInput rows="3" formControlName="observations"></textarea>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Annuler</button>
        <button 
          mat-raised-button 
          color="primary" 
          [disabled]="consommationForm.invalid || isLoading"
          (click)="onSubmit()">
          <mat-icon *ngIf="isLoading">refresh</mat-icon>
          <mat-icon *ngIf="!isLoading">save</mat-icon>
          {{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .form-consommation-container {
      min-width: 500px;
      max-width: 600px;
    }
    
    .vehicule-info {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .vehicule-info h3 {
      margin: 0 0 8px 0;
      color: #1976d2;
    }
    
    .vehicule-info p {
      margin: 0;
      color: #666;
    }
    
    .consommation-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    mat-form-field {
      width: 100%;
    }
    
    .mat-mdc-dialog-actions {
      padding: 16px 24px;
    }
  `]
})
export class FormConsommationComponent implements OnInit {
  consommationForm: FormGroup;
  isLoading = false;
  
  typesConsommation = [
    { value: TypeConsommation.CARBURANT, label: 'Carburant', icon: 'local_gas_station' },
    { value: TypeConsommation.HUILE_MOTEUR, label: 'Huile moteur', icon: 'opacity' },
    { value: TypeConsommation.HUILE_BOITE, label: 'Huile de boîte', icon: 'settings' },
    { value: TypeConsommation.LIQUIDE_FREIN, label: 'Liquide de frein', icon: 'car_repair' },
    { value: TypeConsommation.LIQUIDE_REFROIDISSEMENT, label: 'Liquide de refroidissement', icon: 'ac_unit' },
    { value: TypeConsommation.LUBRIFIANT_AUTRE, label: 'Autre lubrifiant', icon: 'category' }
  ];

  constructor(
    private fb: FormBuilder,
    private consommationService: ConsommationService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<FormConsommationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { vehicule: Vehicule, utilisateurConnecte?: number } // Utilisateur connecté optionnel pour la création
  ) {
    this.consommationForm = this.createForm();
  }

  ngOnInit(): void {
    this.setupFormListeners();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      dateConsommation: [new Date(), Validators.required],
      typeConsommation: [TypeConsommation.CARBURANT, Validators.required],
      quantite: [0, [Validators.required, Validators.min(0.1)]],
      prixUnitaire: [0, [Validators.required, Validators.min(0.01)]],
      montantTotal: [{ value: 0, disabled: true }],
      kilometrageActuel: [this.data.vehicule.kilometrageActuel || null],
      nomFournisseur: [''],
      numeroFacture: [''],
      observations: ['']
    });
  }

  private setupFormListeners(): void {
    // Calcul automatique du montant total
    this.consommationForm.get('quantite')?.valueChanges.subscribe(() => this.calculateTotal());
    this.consommationForm.get('prixUnitaire')?.valueChanges.subscribe(() => this.calculateTotal());
  }

  private calculateTotal(): void {
    const quantite = this.consommationForm.get('quantite')?.value || 0;
    const prixUnitaire = this.consommationForm.get('prixUnitaire')?.value || 0;
    const montantTotal = (quantite * prixUnitaire).toFixed(2);
    this.consommationForm.get('montantTotal')?.setValue(parseFloat(montantTotal));
  }

  onSubmit(): void {
    if (this.consommationForm.valid) {
      this.isLoading = true;
      
      const formValue = this.consommationForm.getRawValue();
      console.log(formValue);
      const consommationData: Consommation = {
        ...formValue,
        dateConsommation: formValue.dateConsommation.toISOString().split('T')[0],
        vehicule: { id: this.data.vehicule.id } as Vehicule,
        ...(this.data.utilisateurConnecte && { 
          utilisateur: { id: this.data.utilisateurConnecte } as Utilisateur 
        })
      };

      this.consommationService.creerConsommation(consommationData).subscribe({
        next: (result) => {
          this.snackBar.open('Consommation enregistrée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Erreur lors de l\'enregistrement:', error);
          this.snackBar.open('Erreur lors de l\'enregistrement de la consommation', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
