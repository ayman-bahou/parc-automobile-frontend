import { Utilisateur } from "./utilisateur";
import { StatutMission, Vehicule } from "./vehicule";

export interface Mission {
  id?: number;
  objet: string;
  description?: string;
  lieuDepart: string;
  lieuDestination: string;
  dateDebut: Date;
  dateFin?: Date;
  kilometrageDepart?: number;
  statut: StatutMission;
  observations?: string;
  vehicule: Vehicule;
  conducteur: Utilisateur;
}