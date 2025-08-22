import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { FormReparationComponent } from './form-reparation.component';
import { ReparationService } from '../../services/reparation.service';
import { VehiculeService } from '../../services/vehicule.service';
import { AuthService } from '../../services/auth-service/auth-service';
import { TypeReparation, StatutReparation } from '../../models/reparation';
import { Vehicule, StatutVehicule, TypeCarburant } from '../../models/vehicule';

describe('FormReparationComponent', () => {
  let component: FormReparationComponent;
  let fixture: ComponentFixture<FormReparationComponent>;
  let reparationService: jasmine.SpyObj<ReparationService>;
  let vehiculeService: jasmine.SpyObj<VehiculeService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockVehicules: Vehicule[] = [
    {
      id: 1,
      immatriculation: 'AB-123-CD',
      marque: 'Toyota',
      modele: 'Corolla',
      statut: StatutVehicule.DISPONIBLE,
      annee: 2020,
      typeCarburant: TypeCarburant.ESSENCE
    }
  ];

  const mockUserId = 1;

  beforeEach(async () => {
    const reparationServiceSpy = jasmine.createSpyObj('ReparationService', [
      'createReparation',
      'updateDebutReparation',
      'getReparationById'
    ]);
    const vehiculeServiceSpy = jasmine.createSpyObj('VehiculeService', ['getAllVehicules']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);

    await TestBed.configureTestingModule({
      imports: [
        FormReparationComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ReparationService, useValue: reparationServiceSpy },
        { provide: VehiculeService, useValue: vehiculeServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: null })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormReparationComponent);
    component = fixture.componentInstance;
    reparationService = TestBed.inject(ReparationService) as jasmine.SpyObj<ReparationService>;
    vehiculeService = TestBed.inject(VehiculeService) as jasmine.SpyObj<VehiculeService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    vehiculeService.getAllVehicules.and.returnValue(of(mockVehicules));
    authService.getCurrentUserId.and.returnValue(mockUserId);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.reparationForm).toBeDefined();
    expect(component.reparationForm.get('statut')?.value).toBe(StatutReparation.EN_COURS);
    expect(component.reparationForm.get('coutPieces')?.value).toBe(0);
    expect(component.reparationForm.get('coutMainOeuvre')?.value).toBe(0);
  });

  it('should load vehicules on init', () => {
    component.ngOnInit();
    expect(vehiculeService.getAllVehicules).toHaveBeenCalled();
    expect(component.vehicules.length).toBe(1);
    expect(component.vehicules[0].immatriculation).toBe('AB-123-CD');
  });

  it('should load current user id on init', () => {
    component.ngOnInit();
    expect(authService.getCurrentUserId).toHaveBeenCalled();
    expect(component.currentUserId).toBe(mockUserId);
  });

  it('should calculate total cost correctly', () => {
    component.reparationForm.patchValue({
      coutPieces: 100,
      coutMainOeuvre: 50
    });
    expect(component.coutTotal).toBe(150);
  });

  it('should validate required fields', () => {
    component.reparationForm.patchValue({
      dateDebutReparation: '',
      typeReparation: '',
      description: '',
      vehiculeId: ''
    });
    
    expect(component.reparationForm.invalid).toBeTruthy();
    expect(component.dateDebutReparation?.invalid).toBeTruthy();
    expect(component.typeReparation?.invalid).toBeTruthy();
    expect(component.description?.invalid).toBeTruthy();
    expect(component.vehiculeId?.invalid).toBeTruthy();
  });

  it('should validate description minimum length', () => {
    component.reparationForm.patchValue({
      description: 'Test'
    });
    
    expect(component.description?.invalid).toBeTruthy();
    expect(component.description?.errors?.['minlength']).toBeTruthy();
  });

  it('should validate positive costs', () => {
    component.reparationForm.patchValue({
      coutPieces: -10,
      coutMainOeuvre: -5
    });
    
    expect(component.coutPieces?.invalid).toBeTruthy();
    expect(component.coutMainOeuvre?.invalid).toBeTruthy();
  });

  it('should get type reparation options', () => {
    const options = component.getTypeReparationOptions();
    expect(options.length).toBe(10);
    expect(options[0].value).toBe(TypeReparation.VISITE_TECHNIQUE);
    expect(options[0].label).toBe('Visite Technique');
  });

  it('should get statut reparation options', () => {
    const options = component.getStatutReparationOptions();
    expect(options.length).toBe(2);
    expect(options[0].value).toBe(StatutReparation.EN_COURS);
    expect(options[0].label).toBe('En Cours');
  });

  it('should format currency correctly', () => {
    const result = component.formatCurrency(150.50);
    expect(result).toContain('150,50');
    expect(result).toContain('€');
  });

  it('should create reparation when form is valid', () => {
    const mockReparation = {
      dateDebutReparation: '2025-01-15',
      typeReparation: TypeReparation.VISITE_TECHNIQUE,
      description: 'Test description for reparation',
      coutPieces: 100,
      coutMainOeuvre: 50,
      coutTotal: 150,
      vehiculeId: 1,
      utilisateurId: mockUserId,
      statut: StatutReparation.EN_COURS
    };

    component.reparationForm.patchValue({
      dateDebutReparation: '2025-01-15',
      typeReparation: TypeReparation.VISITE_TECHNIQUE,
      description: 'Test description for reparation',
      coutPieces: 100,
      coutMainOeuvre: 50,
      vehiculeId: 1
    });

    reparationService.createReparation.and.returnValue(of(mockReparation));
    
    component.onSubmit();
    
    expect(reparationService.createReparation).toHaveBeenCalled();
  });

  it('should not submit when form is invalid', () => {
    component.reparationForm.patchValue({
      dateDebutReparation: '',
      description: ''
    });
    
    component.onSubmit();
    
    expect(reparationService.createReparation).not.toHaveBeenCalled();
    expect(reparationService.updateReparation).not.toHaveBeenCalled();
  });
});
