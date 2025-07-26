import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAjoutVehicule } from './form-ajout-vehicule';

describe('FormAjoutVehicule', () => {
  let component: FormAjoutVehicule;
  let fixture: ComponentFixture<FormAjoutVehicule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormAjoutVehicule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormAjoutVehicule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
