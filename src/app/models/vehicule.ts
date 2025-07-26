export interface Vehicule {
  id: number;
  nom: string;
  modele: string;
  immatriculation: string;
  statut: 'DISPONIBLE' | 'EN_MISSION' | 'EN_REPARATION' | 'EN_MAINTENANCE';
  utilisateur?: {
    id: number;
    nom: string;
    prenom: string;
  };
  marque?: string;
  annee?: number;
  kilometrage?: number;
  carburant?: string;
  dateProchainerVisiteTechnique?: string;
  dateDerniereReparation?: string;
  dateDerniereMaintenance?: string;
}

export interface VehiculeStats {
  totalVehicules: number;
  vehiculesDisponibles: number;
  vehiculesEnMission: number;
  vehiculesEnReparation: number;
  vehiculesEnMaintenance: number;
}
