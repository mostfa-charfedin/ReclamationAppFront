import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CreateUserRequest, UserManagement, UpdateUserRequest } from '../../Models/user-management';
import { UserManagementService } from '../../Services/user-management.service';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  // Données
  users: UserManagement[] = [];
  filteredUsers: UserManagement[] = [];
  selectedUser: UserManagement | null = null;

  // États
  isEditing = false;
  isLoading = false;
  searchTerm = '';
  roleFilter = 'ALL';

  // Statistiques
  activeUsersCount = 0;
  inactiveUsersCount = 0;
  totalUsersCount = 0;

  // Messages
  errorMessage = '';
  successMessage = '';

  // Formulaire
  userForm: FormGroup;

  // Gestion de la destruction et recherche
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private userService: UserManagementService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.userForm = this.createUserForm();
  }

  ngOnInit(): void {
    // Vérifier les permissions
    if (!this.authService.isAdmin()) {
      this.errorMessage = 'Accès non autorisé. Seuls les administrateurs peuvent gérer les utilisateurs.';
      console.error('Tentative d\'accès non autorisé à la gestion des utilisateurs');
      return;
    }

    // Configuration du debounce pour la recherche (300ms)
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.filterUsers();
    });

    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Crée le formulaire avec validation
   */
  createUserForm(): FormGroup {
    return this.fb.group({
      nom: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      prenom: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]],
      password: ['', [
        Validators.required, // ✅ Requis seulement pour la création
        Validators.minLength(6),
        Validators.maxLength(100)
      ]],
      role: ['USER', Validators.required]
    });
  }

  /**
   * Charge la liste des utilisateurs
   */
  loadUsers(): void {
    this.isLoading = true;
    this.clearMessages();

    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.filterUsers();
          this.isLoading = false;
        },
        error: (error) => {
          this.handleError(error, 'le chargement des utilisateurs');
          this.isLoading = false;
        }
      });
  }

  /**
   * Filtre les utilisateurs selon les critères
   */
  filterUsers(): void {
    const searchLower = this.searchTerm.toLowerCase().trim();

    this.filteredUsers = this.users.filter(user => {
      // Recherche dans nom, prénom et email
      const matchesSearch = searchLower === '' ||
        (user.nom?.toLowerCase().includes(searchLower) ||
         user.prenom?.toLowerCase().includes(searchLower) ||
         user.email?.toLowerCase().includes(searchLower));

      // Filtre par rôle
      const matchesRole = this.roleFilter === 'ALL' || user.role === this.roleFilter;

      return matchesSearch && matchesRole;
    });

    this.updateUserStats();
  }

  /**
   * Met à jour les statistiques
   */
  private updateUserStats(): void {
    this.totalUsersCount = this.filteredUsers.length;
    this.activeUsersCount = this.filteredUsers.filter(u => u.active).length;
    this.inactiveUsersCount = this.filteredUsers.filter(u => !u.active).length;
  }

  /**
   * Gère le changement de recherche avec debounce
   */
  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  /**
   * Gère le changement de filtre de rôle
   */
  onRoleFilterChange(): void {
    this.filterUsers();
  }

  /**
   * Crée un nouvel utilisateur
   */
  createUser(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const userData: CreateUserRequest = this.userForm.value;

    this.userService.createUser(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newUser) => {
          this.users.push(newUser);
          this.filterUsers();
          this.userForm.reset({ role: 'USER' });
          this.isLoading = false;
          this.successMessage = `Utilisateur ${newUser.prenom} ${newUser.nom} créé avec succès`;
        },
        error: (error) => {
          this.handleError(error, 'la création de l\'utilisateur');
          this.isLoading = false;
        }
      });
  }

  /**
   * Prépare l'édition d'un utilisateur
   */
  editUser(user: UserManagement): void {
    this.selectedUser = user;
    this.isEditing = true;
    this.clearMessages();

    // ✅ Pas de champ password en mode édition
    this.userForm.patchValue({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role
    });

    // ✅ Désactiver la validation du password en mode édition
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  /**
   * Met à jour un utilisateur
   */
  updateUser(): void {
    if (this.userForm.invalid || !this.selectedUser) {
      this.markFormGroupTouched();
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const formValue = this.userForm.value;
    const updateData: UpdateUserRequest = {
      nom: formValue.nom,
      prenom: formValue.prenom,
      
      role: formValue.role
    };

    if (formValue.email !== this.selectedUser.email) {
      updateData.email = formValue.email;
    }

    this.userService.updateUser(this.selectedUser.id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
          this.filterUsers();
          this.cancelEdit();
          this.isLoading = false;
          this.successMessage = `Utilisateur ${updatedUser.prenom} ${updatedUser.nom} mis à jour avec succès`;
        },
        error: (error) => {
          this.handleError(error, 'la mise à jour de l\'utilisateur');
          this.isLoading = false;
        }
      });
  }

  /**
   * Annule l'édition
   */
  cancelEdit(): void {
    this.selectedUser = null;
    this.isEditing = false;
    this.userForm.reset({ role: 'USER' });
    this.clearMessages();

    // ✅ Réactiver la validation du password pour la création
    this.userForm.get('password')?.setValidators([
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(100)
    ]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  /**
   * Active ou désactive un utilisateur
   */
  toggleUserStatus(user: UserManagement): void {
    const action = user.active ? 'désactiver' : 'activer';

    if (!confirm(`Êtes-vous sûr de vouloir ${action} l'utilisateur ${user.prenom} ${user.nom} ?`)) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const action$ = user.active ?
      this.userService.deactivateUser(user.id) :
      this.userService.activateUser(user.id);

    action$.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
          this.filterUsers();
          this.isLoading = false;
          this.successMessage = `Utilisateur ${action} avec succès`;
        },
        error: (error) => {
          this.handleError(error, `le changement de statut de l'utilisateur`);
          this.isLoading = false;
        }
      });
  }

  /**
   * Supprime un utilisateur
   */
  deleteUser(user: UserManagement): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur ${user.prenom} ${user.nom} ? Cette action est irréversible.`)) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.userService.deleteUser(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.filterUsers();
          this.isLoading = false;
          this.successMessage = `Utilisateur supprimé avec succès`;
        },
        error: (error) => {
          this.handleError(error, 'la suppression de l\'utilisateur');
          this.isLoading = false;
        }
      });
  }

  /**
   * Gère les erreurs
   */
  private handleError(error: any, action: string): void {
    console.error(`Erreur lors de ${action}:`, error);

    if (error.status === 403) {
      this.errorMessage = 'Accès interdit. Vous n\'avez pas les permissions nécessaires.';
    } else if (error.status === 401) {
      this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      this.router.navigate(['/login']);
    } else if (error.error?.message) {
      this.errorMessage = error.error.message;
    } else {
      this.errorMessage = `Une erreur est survenue lors de ${action}. Veuillez réessayer.`;
    }
  }

  /**
   * Efface les messages
   */
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Marque tous les champs comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Classes pour les badges de rôle
   */
  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'TECHNICIEN':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'USER':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }

  /**
   * Nom d'affichage pour les rôles
   */
  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'TECHNICIEN':
        return 'Technicien';
      case 'USER':
        return 'Utilisateur';
      default:
        return role;
    }
  }

  /**
   * Classes pour les badges de statut
   */
  getStatusBadgeClass(active: boolean): string {
    return active ?
      'bg-green-100 text-green-800 border border-green-200' :
      'bg-red-100 text-red-800 border border-red-200';
  }

  /**
   * Génère les initiales pour l'avatar
   */
  getInitials(prenom: string, nom: string): string {
    const firstInitial = prenom ? prenom.charAt(0).toUpperCase() : '';
    const lastInitial = nom ? nom.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  /**
   * Getter pour les contrôles du formulaire
   */
  get formControls() {
    return this.userForm.controls;
  }

  /**
   * Vérifie si un champ a une erreur
   */
  hasError(controlName: string, errorType: string): boolean {
    const control = this.userForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.roleFilter = 'ALL';
    this.filterUsers();
  }
}
