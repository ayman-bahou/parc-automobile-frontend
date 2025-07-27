// Énumérations correspondant à celles du backend Java
export enum TypeCarburant {
  ESSENCE = 'ESSENCE',
  DIESEL = 'DIESEL',
  ELECTRIQUE = 'ELECTRIQUE',
  HYBRIDE = 'HYBRIDE',
  GPL = 'GPL'
}

export enum StatutVehicule {
  DISPONIBLE = 'DISPONIBLE',
  EN_MISSION = 'EN_MISSION',
  EN_REPARATION = 'EN_REPARATION',
  EN_MAINTENANCE = 'EN_MAINTENANCE'
}

// Interface Vehicule correspondant exactement à l'entité Java
export interface Vehicule {
  id?: number; // Optionnel pour la création
  immatriculation: string;
  marque: string;
  modele: string;
  annee?: number;
  typeCarburant?: TypeCarburant;
  consommationMoyenne?: number; // L/100km
  capaciteReservoir?: number; // en litres
  kilometrageActuel?: number;
  dateMiseEnService?: string; // Format ISO date string
  dateDerniereVisiteTechnique?: string; // Format ISO date string
  dateProchainerVisiteTechnique?: string; // Format ISO date string
  statut: StatutVehicule;
  // Relations - optionnelles car peuvent ne pas être chargées
  missions?: Mission[];
  consommations?: Consommation[];
  reparations?: Reparation[];
  maintenances?: MaintenanceProgrammee[];
}

// Interfaces pour les relations (basées sur vos entités Java)
export interface Mission {
  id?: number;
  // Ajoutez les autres propriétés selon votre entité Mission
}

export interface Consommation {
  id?: number;
  // Ajoutez les autres propriétés selon votre entité Consommation
}

export interface Reparation {
  id?: number;
  // Ajoutez les autres propriétés selon votre entité Reparation
}

export interface MaintenanceProgrammee {
  id?: number;
  // Ajoutez les autres propriétés selon votre entité MaintenanceProgrammee
}

// Interface pour les statistiques des véhicules
export interface VehiculeStats {
  totalVehicules: number;
  vehiculesDisponibles: number;
  vehiculesEnMission: number;
  vehiculesEnReparation: number;
  vehiculesEnMaintenance: number;
}

// Type pour l'affichage simplifié dans les listes (avec utilisateur)
//export interface VehiculeDisplay extends Vehicule {
//  utilisateur?: {
//    id: number;
//    nom: string;
//    prenom: string;
//  };
//}

// Type pour la création d'un véhicule (sans les relations)
export interface VehiculeCreateRequest {
  immatriculation: string;
  marque: string;
  modele: string;
  annee?: number;
  typeCarburant?: TypeCarburant;
  consommationMoyenne?: number;
  capaciteReservoir?: number;
  kilometrageActuel?: number;
  dateMiseEnService?: string;
  dateDerniereVisiteTechnique?: string;
  dateProchainerVisiteTechnique?: string;
  statut?: StatutVehicule;
}
