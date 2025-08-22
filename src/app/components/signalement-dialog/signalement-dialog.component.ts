import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SignalementService } from '../../services/signalement.service';
import { VehiculeService } from '../../services/vehicule.service';
import { AuthService } from '../../services/auth-service/auth-service';
import { Vehicule } from '../../models/vehicule';
import { SignalementDTO } from '../../models/signalement-dto';
import { StatutSignalement, Urgence } from '../../models/signalement';


@Component({
  selector: 'app-signalement-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>report_problem</mat-icon>
      Nouveau signalement
    </h2>

    <mat-dialog-content>
      <form [formGroup]="signalementForm" class="signalement-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Titre du signalement</mat-label>
          <input matInput formControlName="titre" placeholder="Ex: Problème de frein">
          <mat-icon matSuffix>title</mat-icon>
          <mat-error *ngIf="signalementForm.get('titre')?.hasError('required')">
            Le titre est obligatoire
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea 
            matInput 
            formControlName="description" 
            rows="4"
            placeholder="Décrivez le problème en détail...">
          </textarea>
          <mat-icon matSuffix>description</mat-icon>
          <mat-error *ngIf="signalementForm.get('description')?.hasError('required')">
            La description est obligatoire
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Niveau d'urgence</mat-label>
          <mat-select formControlName="urgence">
            <mat-option [value]="Urgence.FAIBLE">
              <mat-icon class="urgence-icon faible">info</mat-icon>
              Faible
            </mat-option>
            <mat-option [value]="Urgence.MOYENNE">
              <mat-icon class="urgence-icon moyenne">warning</mat-icon>
              Moyenne
            </mat-option>
            <mat-option [value]="Urgence.ELEVEE">
              <mat-icon class="urgence-icon elevee">error</mat-icon>
              Élevée
            </mat-option>
          </mat-select>
          <mat-icon matSuffix>priority_high</mat-icon>
          <mat-error *ngIf="signalementForm.get('urgence')?.hasError('required')">
            Le niveau d'urgence est obligatoire
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Véhicule concerné</mat-label>
          <mat-select formControlName="vehiculeId" [disabled]="loadingVehicules">
            <mat-option 
              *ngFor="let vehicule of vehicules" 
              [value]="vehicule.id">
              <div class="vehicule-option">
                <span class="vehicule-immat">{{ vehicule.immatriculation }}</span>
                <span class="vehicule-details">{{ vehicule.marque }} {{ vehicule.modele }}</span>
              </div>
            </mat-option>
          </mat-select>
          <mat-icon matSuffix>directions_car</mat-icon>
          <mat-error *ngIf="signalementForm.get('vehiculeId')?.hasError('required')">
            Le véhicule est obligatoire
          </mat-error>
        </mat-form-field>

        <div *ngIf="loadingVehicules" class="loading-vehicules">
          <mat-spinner diameter="20"></mat-spinner>
          <span>Chargement des véhicules...</span>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>
        <mat-icon>cancel</mat-icon>
        Annuler
      </button>
      <button 
        mat-raised-button 
        color="primary" 
        [disabled]="signalementForm.invalid || loading"
        (click)="onSubmit()">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <mat-icon *ngIf="!loading">save</mat-icon>
        {{ loading ? 'Création...' : 'Créer le signalement' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .signalement-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 500px;
      padding: 16px 0;
    }

    .full-width {
      width: 100%;
    }

    .urgence-icon {
      margin-right: 8px;
      vertical-align: middle;
    }

    .urgence-icon.faible {
      color: #4caf50;
    }

    .urgence-icon.moyenne {
      color: #ff9800;
    }

    .urgence-icon.elevee {
      color: #f44336;
    }

    .vehicule-option {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .vehicule-immat {
      font-weight: bold;
      color: #1976d2;
    }

    .vehicule-details {
      font-size: 0.9em;
      color: #666;
    }

    .loading-vehicules {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 0.9em;
    }

    mat-dialog-content {
      max-height: 80vh;
      overflow-y: auto;
    }

    mat-dialog-actions {
      padding: 16px 24px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 0;
    }
  `]
})
export class SignalementDialogComponent implements OnInit {
  signalementForm: FormGroup;
  vehicules: Vehicule[] = [];
  loading = false;
  loadingVehicules = true;
  
  // Expose l'enum pour le template
  Urgence = Urgence;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SignalementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private signalementService: SignalementService,
    private vehiculeService: VehiculeService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.signalementForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      urgence: ['', Validators.required],
      vehiculeId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadVehicules();
  }

  loadVehicules(): void {
    this.loadingVehicules = true;
    this.vehiculeService.getAllVehicules().subscribe({
      next: (vehicules) => {
        this.vehicules = vehicules;
        this.loadingVehicules = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des véhicules:', error);
        this.snackBar.open('Erreur lors du chargement des véhicules', 'Fermer', { 
          duration: 3000 
        });
        this.loadingVehicules = false;
      }
    });
  }

  onSubmit(): void {
    if (this.signalementForm.valid) {
      this.loading = true;
      
      const formValue = this.signalementForm.value;
      
      
      
      const tokenPayload = this.authService.getTokenPayload();
      const userId = tokenPayload?.id;
      
      // Debug: Afficher les informations de l'utilisateur
      console.log('Debug - Token Payload:', tokenPayload);
      console.log('Debug - User ID:', userId);
      
      if (!userId) {
        this.snackBar.open('Erreur: Impossible de récupérer l\'ID utilisateur', 'Fermer', { 
          duration: 3000 
        });
        this.loading = false;
        return;
      }
    
      const signalementData: SignalementDTO = {
        titre: formValue.titre,
        description: formValue.description,
        dateCreation: new Date(),
        statut: StatutSignalement.EN_COURS, // Par défaut, le statut est EN_COURS
        urgence: formValue.urgence,
        vehiculeId: formValue.vehiculeId,
        utilisateurId: userId
      };
      
      this.signalementService.createSignalement(signalementData).subscribe({
        next: (result) => {
          this.snackBar.open('Signalement créé avec succès', 'Fermer', { 
            duration: 3000 
          });
          this.loading = false;
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Erreur lors de la création du signalement:', error);
          this.snackBar.open('Erreur lors de la création du signalement', 'Fermer', { 
            duration: 3000 
          });
          this.loading = false;
        }
      });
    }
  }
}
