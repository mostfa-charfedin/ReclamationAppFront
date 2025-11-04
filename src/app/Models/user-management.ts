export interface UserManagement {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'USER' | 'TECHNICIEN' | 'ADMIN';
  active: boolean;
  dateCreation: string;
  lastLogin?: string;
}

export interface UpdateUserRequest {
  nom: string;
  prenom: string;
  email?: string;
  role: 'USER' | 'TECHNICIEN' | 'ADMIN';
  active?: boolean;
}

export interface CreateUserRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: 'USER' | 'TECHNICIEN' | 'ADMIN';
}
