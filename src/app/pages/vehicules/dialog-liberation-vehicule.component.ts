import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Mission } from '../../models/mission';
import { Vehicule } from '../../models/vehicule';

export interface DialogData {
  mission: Mission;
  vehicule: Vehicule;
}

@Component({
  selector: 'app-dialog-liberation-vehicule',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>logout</mat-icon>
      Libérer le véhicule
    </h2>
    
    <mat-dialog-content>
      <div class="vehicle-info">
        <h3>Informations du véhicule</h3>
        <p><strong>Immatriculation:</strong> {{ data.vehicule.immatriculation }}</p>
        <p><strong>Marque:</strong> {{ data.vehicule.marque }} {{ data.vehicule.modele }}</p>
        <p><strong>Mission:</strong> {{ data.mission.objet }}</p>
        <p><strong>Kilométrage de départ:</strong> {{ data.mission.kilometrageDepart || 'Non renseigné' }} km</p>
      </div>

      <form [formGroup]="liberationForm" class="liberation-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Kilométrage de retour *</mat-label>
          <input 
            matInput 
            type="number" 
            formControlName="kilometrageRetour"
            placeholder="Entrez le kilométrage de retour">
          <mat-icon matSuffix>speed</mat-icon>
          <mat-error *ngIf="liberationForm.get('kilometrageRetour')?.hasError('required')">
            Le kilométrage de retour est obligatoire
          </mat-error>
          <mat-error *ngIf="liberationForm.get('kilometrageRetour')?.hasError('min')">
            Le kilométrage doit être positif
          </mat-error>
          <mat-error *ngIf="liberationForm.get('kilometrageRetour')?.hasError('invalidKilometrage')">
            Le kilométrage de retour doit être supérieur ou égal au kilométrage de départ
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observations (optionnel)</mat-label>
          <textarea 
            matInput 
            formControlName="observations"
            placeholder="Remarques, incidents, commentaires..."
            rows="4">
          </textarea>
          <mat-icon matSuffix>note</mat-icon>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        <mat-icon>cancel</mat-icon>
        Annuler
      </button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onConfirm()"
        [disabled]="liberationForm.invalid">
        <mat-icon>check</mat-icon>
        Libérer le véhicule
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .vehicle-info {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    
    .vehicle-info h3 {
      margin-top: 0;
      color: #1976d2;
    }
    
    .vehicle-info p {
      margin: 8px 0;
    }
    
    .liberation-form {
      width: 100%;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .mat-mdc-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }
    
    .mat-mdc-dialog-actions {
      padding: 16px 0;
    }
  `]
})
export class DialogLiberationVehiculeComponent {
  liberationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogLiberationVehiculeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.liberationForm = this.fb.group({
      kilometrageRetour: ['', [
        Validators.required, 
        Validators.min(0),
        this.kilometrageValidator.bind(this)
      ]],
      observations: ['']
    });
  }

  // Validateur personnalisé pour vérifier que le kilométrage de retour >= kilométrage de départ
  kilometrageValidator(control: any) {
    const value = control.value;
    const kilometrageDepart = this.data.mission.kilometrageDepart || 0;
    
    if (value && value < kilometrageDepart) {
      return { invalidKilometrage: true };
    }
    return null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.liberationForm.valid) {
      const result = {
        kilometrageRetour: this.liberationForm.value.kilometrageRetour,
        observations: this.liberationForm.value.observations || undefined
      };
      this.dialogRef.close(result);
    }
  }
}
