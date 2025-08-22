import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { SignalementService } from '../../services/signalement.service';
import { AuthService } from '../../services/auth-service/auth-service';
import { Signalement, StatutSignalement } from '../../models/signalement';
import { SignalementDialogComponent } from '../../components/signalement-dialog/signalement-dialog.component';

@Component({
  selector: 'app-signalement',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './signalement.html',
  styleUrl: './signalement.css'
})
export class SignalementComponent implements OnInit {
  signalements: Signalement[] = [];
  filteredSignalements: Signalement[] = [];
  loading = true;
  error: string | null = null;
  selectedFilter: string = 'ALL';
  vehiculeId: number | null = null;

  // Enums pour le template
  //TypeSignalement = TypeSignalement;
  StatutSignalement = StatutSignalement;

  constructor(
    private signalementService: SignalementService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSignalements();
    //this.route.params.subscribe(params => {
    //  this.vehiculeId = params['id'] ? +params['id'] : null;
    //  this.loadSignalements();
    //});
  }

  loadSignalements(): void {
    console.log('Loading signalements...');
    this.loading = true;
    this.error = null;
    
    const userId = this.authService.getCurrentUserId();
    const isAdmin = this.authService.isAdmin();
    
    console.log('User ID:', userId, 'Is Admin:', isAdmin);
    
    if (!userId && !isAdmin) {
      this.error = "Impossible de récupérer l'ID de l'utilisateur";
      this.loading = false;
      return;
    }

    // (this.vehiculeId) {
    //// Charger les signalements pour un véhicule spécifique
    //this.signalementService.getSignalementsByVehicule(this.vehiculeId).subscribe({
    //  next: (data) => {
    //    this.signalements = data;
    //    this.filteredSignalements = data;
    //    this.loading = false;
    //  },
    //  error: (error) => {
    //    console.error('Erreur lors du chargement des signalements:', error);
    //    this.error = 'Erreur lors du chargement des signalements';
    //    this.loading = false;
    //  }
    //});
     if (isAdmin) {
      // Admin peut voir tous les signalements
      console.log('Loading all signalements for admin...');
      this.signalementService.getAllSignalements().subscribe({
        next: (data) => {
          console.log('Received signalements:', data.length);
          this.signalements = [...data]; // Force une nouvelle référence
          this.filteredSignalements = [...data]; // Force une nouvelle référence
          this.loading = false;
          this.cdr.detectChanges(); // Force la détection des changements
        },
        error: (error) => {
          console.error('Erreur lors du chargement des signalements:', error);
          this.error = 'Erreur lors du chargement des signalements';
          this.loading = false;
        }
      });
    } else {
      // Utilisateur normal ne voit que ses signalements
      console.log('Loading signalements for user:', userId);
      this.signalementService.getSignalementsByUser(userId!).subscribe({
        next: (data) => {
          console.log('Received user signalements:', data.length);
          this.signalements = [...data]; // Force une nouvelle référence
          this.filteredSignalements = [...data]; // Force une nouvelle référence
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des signalements:', error);
          this.error = 'Erreur lors du chargement des signalements';
          this.loading = false;
        }
      });
    }
  }

  filterSignalements(statut: string): void {
    this.selectedFilter = statut;
    if (statut === 'ALL') {
      this.filteredSignalements = this.signalements;
    } else {
      this.filteredSignalements = this.signalements.filter(s => s.statut === statut);
    }
  }

 // getTypeColor(type: TypeSignalement): string {
 //   switch (type) {
 //     case TypeSignalement.PANNE:
 //       return 'warn';
 //     case TypeSignalement.ACCIDENT:
 //       return '';
 //     case TypeSignalement.ENTRETIEN:
 //       return 'primary';
 //     case TypeSignalement.AUTRE:
 //       return 'accent';
 //     default:
 //       return '';
 //   }
 // }

  getStatutIcon(statut: StatutSignalement): string {
    switch (statut) {
      
      case StatutSignalement.EN_COURS:
        return 'hourglass_empty';
      case StatutSignalement.RESOLU:
        return 'check_circle';
      default:
        return 'help';
    }
  }

  //getTypeIcon(type: TypeSignalement): string {
  //  switch (type) {
  //    case TypeSignalement.PANNE:
  //      return 'build';
  //    case TypeSignalement.ACCIDENT:
  //      return 'warning';
  //    case TypeSignalement.ENTRETIEN:
  //      return 'settings'
//
  //    case TypeSignalement.AUTRE:
  //      return 'info';
  //    default:
  //      return 'help';
  //  }
  //}

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  resoudreSignalement(id: number): void {
    this.router.navigate(['/admin/reparations', id]);
  }

  rejeterSignalement(signalement: Signalement): void {
    if (this.isAdmin()) {
      this.signalementService.rejeterSignalement(signalement.id!).subscribe({
        next: () => {
          this.snackBar.open('Signalement rejeté', 'Fermer', { duration: 3000 });
          this.loadSignalements();
        },
        error: (error) => {
          console.error('Erreur lors du rejet du signalement:', error);
          this.snackBar.open('Erreur lors du rejet du signalement', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  creerNouveauSignalement(): void {
    const dialogRef = this.dialog.open(SignalementDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(_ => {
        
          this.loadSignalements();
      
    });
  }

  getSignalementsCount(statut: string): number {
    if (statut === 'ALL') {
      return this.signalements.length;
    }
    return this.signalements.filter(s => s.statut === statut).length;
  }
}
