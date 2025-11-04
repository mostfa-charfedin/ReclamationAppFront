export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
   role: 'USER' | 'TECHNICIEN' | 'ADMIN'
  active: boolean;
}
