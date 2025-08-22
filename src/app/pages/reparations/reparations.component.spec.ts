import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ReparationsComponent } from './reparations.component';
import { ReparationService } from '../../services/reparation.service';
import { TypeReparation, StatutReparation } from '../../models/reparation';

describe('ReparationsComponent', () => {
  let component: ReparationsComponent;
  let fixture: ComponentFixture<ReparationsComponent>;
  let reparationService: jasmine.SpyObj<ReparationService>;

  const mockReparations = [
    {
      id: 1,
      dateReparation: '2025-01-15',
      typeReparation: TypeReparation.VISITE_TECHNIQUE,
      description: 'Visite technique annuelle',
      coutTotal: 150.00,
      statut: StatutReparation.TERMINEE,
      vehicule: {
        id: 1,
        immatriculation: 'AB-123-CD',
        marque: 'Toyota',
        modele: 'Corolla'
      },
      utilisateur: {
        id: 1,
        nom: 'Dupont',
        prenom: 'Jean'
      }
    }
  ];

  beforeEach(async () => {
    const reparationServiceSpy = jasmine.createSpyObj('ReparationService', [
      'getAllReparations',
      'deleteReparation'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ReparationsComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule
      ],
      providers: [
        { provide: ReparationService, useValue: reparationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReparationsComponent);
    component = fixture.componentInstance;
    reparationService = TestBed.inject(ReparationService) as jasmine.SpyObj<ReparationService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load reparations on init', () => {
    reparationService.getAllReparations.and.returnValue(of(mockReparations));
    
    component.ngOnInit();
    
    expect(reparationService.getAllReparations).toHaveBeenCalled();
    expect(component.reparations).toEqual(mockReparations);
    expect(component.loading).toBeFalse();
  });

  it('should filter reparations by status', () => {
    component.reparations = mockReparations;
    component.selectedStatut = StatutReparation.TERMINEE;
    
    component.applyFilters();
    
    expect(component.filteredReparations.length).toBe(1);
    expect(component.filteredReparations[0].statut).toBe(StatutReparation.TERMINEE);
  });

  it('should filter reparations by search term', () => {
    component.reparations = mockReparations;
    component.searchTerm = 'visite';
    
    component.applyFilters();
    
    expect(component.filteredReparations.length).toBe(1);
    expect(component.filteredReparations[0].description.toLowerCase()).toContain('visite');
  });

  it('should reset filters', () => {
    component.selectedStatut = StatutReparation.EN_COURS;
    component.selectedType = TypeReparation.VISITE_TECHNIQUE;
    component.searchTerm = 'test';
    
    component.resetFilters();
    
    expect(component.selectedStatut).toBe('');
    expect(component.selectedType).toBe('');
    expect(component.searchTerm).toBe('');
  });

  it('should format currency correctly', () => {
    const result = component.formatCurrency(150.50);
    expect(result).toContain('150,50');
    expect(result).toContain('€');
  });

  it('should format date correctly', () => {
    const result = component.formatDate('2025-01-15');
    expect(result).toBe('15/01/2025');
  });

  it('should get correct type label', () => {
    const result = component.getTypeReparationLabel(TypeReparation.VISITE_TECHNIQUE);
    expect(result).toBe('Visite Technique');
  });

  it('should get correct status label', () => {
    const result = component.getStatutReparationLabel(StatutReparation.EN_COURS);
    expect(result).toBe('En Cours');
  });

  it('should get correct badge class', () => {
    const result = component.getStatutBadgeClass(StatutReparation.TERMINEE);
    expect(result).toBe('badge-success');
  });

  it('should calculate pagination correctly', () => {
    component.filteredReparations = Array(25).fill(mockReparations[0]);
    component.itemsPerPage = 10;
    component.applyFilters();
    
    expect(component.totalPages).toBe(3);
  });

  it('should navigate to correct page', () => {
    component.totalPages = 5;
    component.goToPage(3);
    
    expect(component.currentPage).toBe(3);
  });

  it('should not navigate to invalid page', () => {
    component.totalPages = 5;
    component.currentPage = 2;
    component.goToPage(10);
    
    expect(component.currentPage).toBe(2);
  });
});
