import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ReparationDTO, ReparationDisplay, TypeReparation, StatutReparation } from '../../models/reparation';
import { ReparationService } from '../../services/reparation.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reparations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reparations.component.html',
  styleUrl: './reparations.component.css'
})
export class ReparationsComponent implements OnInit {
  reparations: ReparationDisplay[] = [];
  filteredReparations: ReparationDisplay[] = [];
  loading = false;
  error: string | null = null;

  // Filtres
  selectedStatut: StatutReparation | '' = '';
  selectedType: TypeReparation | '' = '';
  searchTerm = '';
  dateDebut = '';
  dateFin = '';

  // Enums pour les templates
  TypeReparation = TypeReparation;
  StatutReparation = StatutReparation;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  constructor(
    private reparationService: ReparationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReparations();
  }

  loadReparations(): void {
    this.loading = true;
    this.error = null;

    this.reparationService.getAllReparations().subscribe({
      next: (data: ReparationDisplay[]) => {
        this.reparations = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err:HttpErrorResponse) => {
        this.error = 'Erreur lors du chargement des réparations';
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.reparations];

    // Filtre par statut
    if (this.selectedStatut) {
      filtered = filtered.filter(r => r.statut === this.selectedStatut);
    }

    // Filtre par type
    if (this.selectedType) {
      filtered = filtered.filter(r => r.typeReparation === this.selectedType);
    }

    // Filtre par terme de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.description.toLowerCase().includes(term) ||
        r.nomGarage?.toLowerCase().includes(term) ||
        r.numeroFacture?.toLowerCase().includes(term)
      );
    }

    // Filtre par période
    if (this.dateDebut) {
      filtered = filtered.filter(r => new Date(r.dateDebutReparation) >= new Date(this.dateDebut));
    }
    if (this.dateFin) {
      filtered = filtered.filter(r => new Date(r.dateDebutReparation) <= new Date(this.dateFin));
    }

    this.filteredReparations = filtered;
    this.totalPages = Math.ceil(this.filteredReparations.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedReparations(): ReparationDisplay[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredReparations.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  resetFilters(): void {
    this.selectedStatut = '';
    this.selectedType = '';
    this.searchTerm = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.applyFilters();
  }

  getTypeReparationLabel(type: TypeReparation): string {
    const labels: { [key in TypeReparation]: string } = {
      [TypeReparation.VISITE_TECHNIQUE]: 'Visite Technique',
      [TypeReparation.MAINTENANCE_PREVENTIVE]: 'Maintenance Préventive',
      [TypeReparation.REPARATION_MOTEUR]: 'Réparation Moteur',
      [TypeReparation.REPARATION_FREINS]: 'Réparation Freins',
      [TypeReparation.REPARATION_TRANSMISSION]: 'Réparation Transmission',
      [TypeReparation.REPARATION_SUSPENSION]: 'Réparation Suspension',
      [TypeReparation.REPARATION_ELECTRIQUE]: 'Réparation Électrique',
      [TypeReparation.REPARATION_CARROSSERIE]: 'Réparation Carrosserie',
      [TypeReparation.CHANGEMENT_PNEUS]: 'Changement Pneus',
      [TypeReparation.REPARATION_AUTRE]: 'Autre Réparation'
    };
    return labels[type] || type;
  }

  getStatutReparationLabel(statut: StatutReparation): string {
    const labels: { [key in StatutReparation]: string } = {
      [StatutReparation.EN_COURS]: 'En Cours',
      [StatutReparation.TERMINEE]: 'Terminée'
    };
    return labels[statut] || statut;
  }

  getStatutBadgeClass(statut: StatutReparation): string {
    const classes: { [key in StatutReparation]: string } = {
      [StatutReparation.EN_COURS]: 'badge-warning',
      [StatutReparation.TERMINEE]: 'badge-success'
    };
    return classes[statut] || 'badge-secondary';
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  //onDeleteReparation(id: number): void {
  //  if (confirm('Êtes-vous sûr de vouloir supprimer cette réparation ?')) {
  //    this.reparationService.deleteReparation(id).subscribe({
  //      next: () => {
  //        this.loadReparations();
  //      },
  //      error: (err:HttpErrorResponse) => {
  //        this.error = 'Erreur lors de la suppression';
  //        console.error('Erreur:', err);
  //      }
  //    });
  //  }
  //}

  onCreateReparation(): void {
    this.router.navigate(['/admin/reparations/new']);
  }

  onEditReparation(id: number): void {
    this.router.navigate(['/admin/reparations', id, 'edit']);
  }

  onTerminerReparation(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir terminer cette réparation ?')) {
      this.reparationService.terminerReparation(id).subscribe({
        next: () => {
          this.loadReparations(); // Recharger la liste pour refléter le changement de statut
        },
        error: (err: HttpErrorResponse) => {
          this.error = 'Erreur lors de la finalisation de la réparation';
          console.error('Erreur:', err);
        }
      });
    }
  }

  onRefresh(): void {
    this.loadReparations();
  }
}
