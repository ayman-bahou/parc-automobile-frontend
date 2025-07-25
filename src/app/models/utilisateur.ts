export interface Utilisateur {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    motDePasse: string;
    numeroTelephone : string;
    role: { libelle : string; };
}