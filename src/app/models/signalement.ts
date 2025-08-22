import { Utilisateur } from './utilisateur';
import { Vehicule } from './vehicule';

// Enum pour le statut du signalement
export enum StatutSignalement {
    EN_COURS = 'EN_COURS',
    RESOLU = 'RESOLU'
}

// Enum pour l'urgence (TypeUrgence en Java)
export enum Urgence {
  FAIBLE = 'FAIBLE',
  MOYENNE = 'MOYENNE',
  ELEVEE = 'ELEVEE'
}

// Interface pour le modèle Signalement
export interface Signalement {
  id?: number;
  titre: string;
  description: string;
  dateCreation: Date;
  dateResolution?: Date;
  statut: StatutSignalement;
  urgence: Urgence;
  utilisateur: Utilisateur;
  vehicule: Vehicule;
}

// Interface pour la création d'un signalement

