import { Utilisateur } from "./utilisateur";
import { Vehicule } from "./vehicule";

export interface Consommation {
  id?: number;
  dateConsommation: string; // LocalDate en Java -> string ISO en TypeScript
  typeConsommation: TypeConsommation;
  quantite: number; // BigDecimal en Java -> number en TypeScript
  prixUnitaire: number; // BigDecimal en Java -> number en TypeScript
  montantTotal: number; // BigDecimal en Java -> number en TypeScript
  kilometrageActuel?: number; // Integer nullable
  nomFournisseur?: string; // String nullable
  numeroFacture?: string; // String nullable
  observations?: string; // TEXT nullable
  vehicule: Vehicule; // Relation ManyToOne
  utilisateur?: Utilisateur; // Relation ManyToOne (optionnelle pour création)
}

export enum TypeConsommation {
  CARBURANT = 'CARBURANT',
  HUILE_MOTEUR = 'HUILE_MOTEUR',
  HUILE_BOITE = 'HUILE_BOITE',
  LIQUIDE_FREIN = 'LIQUIDE_FREIN',
  LIQUIDE_REFROIDISSEMENT = 'LIQUIDE_REFROIDISSEMENT',
  LUBRIFIANT_AUTRE = 'LUBRIFIANT_AUTRE'
}

