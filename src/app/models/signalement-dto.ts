import { Urgence, StatutSignalement } from "./signalement";

export interface SignalementDTO {
  id?: number;
  titre: string;
  description: string;
  urgence: Urgence;
  statut: StatutSignalement;
  dateCreation: Date;
  dateResolution?: Date;
  vehiculeId: number;
  utilisateurId: number;
}