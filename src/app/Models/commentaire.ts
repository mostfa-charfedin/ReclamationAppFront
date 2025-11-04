import { User } from "./user";

export interface Commentaire {
  id: string;
  commentaire: string;
  date: Date;
  technicien: User; // Référence à l'utilisateur technicien
}
