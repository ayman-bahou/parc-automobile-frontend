import { Vehicule } from './vehicule';
import { Utilisateur } from './utilisateur';

// Énumérations correspondant à celles du backend Java
export enum TypeReparation {
  VISITE_TECHNIQUE = 'VISITE_TECHNIQUE',
  MAINTENANCE_PREVENTIVE = 'MAINTENANCE_PREVENTIVE',
  REPARATION_MOTEUR = 'REPARATION_MOTEUR',
  REPARATION_FREINS = 'REPARATION_FREINS',
  REPARATION_TRANSMISSION = 'REPARATION_TRANSMISSION',
  REPARATION_SUSPENSION = 'REPARATION_SUSPENSION',
  REPARATION_ELECTRIQUE = 'REPARATION_ELECTRIQUE',
  REPARATION_CARROSSERIE = 'REPARATION_CARROSSERIE',
  CHANGEMENT_PNEUS = 'CHANGEMENT_PNEUS',
  REPARATION_AUTRE = 'REPARATION_AUTRE'
}

export enum StatutReparation {
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE'
}

// Interface Reparation correspondant exactement à l'entité Java
export interface Reparation {
  id?: number; // Optionnel pour la création
  typeReparation: TypeReparation;
  description: string;
  coutPieces?: number;
  coutMainOeuvre?: number;
  coutTotal: number;
  kilometrageReparation?: number;
  nomGarage?: string;
  numeroFacture?: string;
  statut?: StatutReparation;
  dateDebutReparation: string; // Format ISO date string
  dateFinReparation?: string; // Format ISO date string
  observations?: string;
  // Relations - objets complets
  vehicule: Vehicule;
  utilisateur: Utilisateur;
}

// Interface ReparationDTO correspondant au DTO Java
export interface ReparationDTO {
  id?: number; // Optionnel pour la création
  typeReparation: TypeReparation;
  description: string;
  coutPieces?: number;
  coutMainOeuvre?: number;
  coutTotal: number;
  kilometrageReparation?: number;
  nomGarage?: string;
  numeroFacture?: string;
  statut?: StatutReparation;
  dateDebutReparation: string; // Format ISO date string
  dateFinReparation?: string; // Format ISO date string
  observations?: string;
  // Relations - seulement les IDs
  vehiculeId: number;
  utilisateurId: number;
}



// Interface pour l'affichage des réparations avec les informations du véhicule et utilisateur
export interface ReparationDisplay {
  id?: number; // Optionnel pour la création
  typeReparation: TypeReparation;
  description: string;
  coutPieces?: number;
  coutMainOeuvre?: number;
  coutTotal: number;
  kilometrageReparation?: number;
  nomGarage?: string;
  numeroFacture?: string;
  statut?: StatutReparation;
  dateDebutReparation: string; // Format ISO date string
  dateFinReparation?: string; // Format ISO date string
  observations?: string;

  vehicule: {
    id: number;
    immatriculation: string;
    marque: string;
    modele: string;
  };
  utilisateur: {
    id: number;
    nom: string;
    prenom: string;
  };
}
