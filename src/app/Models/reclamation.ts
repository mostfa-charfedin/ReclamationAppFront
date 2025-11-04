import { Commentaire } from "./commentaire";
import { User } from "./user";


export interface Reclamation {
  id: string;
  titre: string;
  description: string;
  dateCreation: Date;
  dateDebutTraitement?: Date;
  dateResolution?: Date;
  statut: string;
  priorite: string;
  user: User;
  techniciens: User[];
  commentaires?: Commentaire[]; // Liste des commentaires
}
