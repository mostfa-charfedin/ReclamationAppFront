import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Reclamation } from '../../Models/reclamation';
import { User } from '../../Models/user';
import { ReclamationService } from '../../Services/reclamathion.service';
import { UserService } from '../../Services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  reclamations: Reclamation[] = [];
  techniciens: User[] = [];
  filteredTechniciens: User[] = [];
  selectedReclamation: Reclamation | null = null;
  assignForm: FormGroup;
  isDetailModalOpen: boolean = false;
  isAssignModalOpen: boolean = false;
  technicienSearch: string = '';
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private reclamationService: ReclamationService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.assignForm = this.fb.group({
      selectedTechniciens: [[]]
    });
  }

  ngOnInit() {
    this.loadReclamations();
    this.loadTechniciens();
  }

  loadReclamations() {
    this.isLoading = true;

    this.reclamationService.getAllReclamations().subscribe({
      next: (data: Reclamation[]) => {
        this.reclamations = data || [];
        this.isLoading = false;
        console.log('Réclamations chargées:', this.reclamations);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réclamations:', error);
        this.errorMessage = 'Erreur lors du chargement des réclamations';
        this.isLoading = false;
        this.reclamations = [];
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  loadTechniciens() {
    this.userService.getTechniciens().subscribe({
      next: (data: User[]) => {
        this.techniciens = data || [];
        this.filteredTechniciens = data || [];
        console.log('Techniciens chargés:', this.techniciens);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des techniciens:', error);
        this.errorMessage = 'Erreur lors du chargement des techniciens';
        this.techniciens = [];
        this.filteredTechniciens = [];
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  filterTechniciens() {
    const searchTerm = this.technicienSearch.toLowerCase().trim();

    if (!searchTerm) {
      this.filteredTechniciens = [...this.techniciens];
    } else {
      this.filteredTechniciens = this.techniciens.filter(tech =>
        (tech.nom?.toLowerCase() || '').includes(searchTerm) ||
        (tech.prenom?.toLowerCase() || '').includes(searchTerm) ||
        (tech.email?.toLowerCase() || '').includes(searchTerm)
      );
    }
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'NOUVELLE':
        return 'bg-yellow-500 text-white';
      case 'ASSIGNEE':
        return 'bg-red-500 text-white';
      case 'EN_COURS':
        return 'bg-yellow-400 text-gray-800';
      case 'RESOLUE':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  }

  getStatusDisplay(statut: string): string {
    switch (statut) {
      case 'NOUVELLE':
        return 'Nouvelle';
      case 'ASSIGNEE':
        return 'Assignée';
      case 'EN_COURS':
        return 'En cours';
      case 'RESOLUE':
        return 'Résolue';
      default:
        return statut || 'Inconnu';
    }
  }

  getPriorityClass(priorite: string): string {
    switch (priorite) {
      case 'HAUTE':
        return 'bg-red-100 text-red-800';
      case 'MOYENNE':
        return 'bg-yellow-100 text-yellow-800';
      case 'BASSE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStats() {
    return {
      nouvelles: this.reclamations.filter(r => r.statut === 'NOUVELLE').length,
      assignees: this.reclamations.filter(r => r.statut === 'ASSIGNEE').length,
      resolues: this.reclamations.filter(r => r.statut === 'RESOLUE').length,
      total: this.reclamations.length
    };
  }

  openDetailModal(reclamation: Reclamation) {
    // Recharger les détails complets depuis le serveur
    this.reclamationService.getReclamationById(reclamation.id).subscribe({
      next: (data: any) => {
        this.selectedReclamation = data;
        this.isDetailModalOpen = true;
        document.body.style.overflow = 'hidden';
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails:', error);
        // En cas d'erreur, utiliser les données locales
        this.selectedReclamation = reclamation;
        this.isDetailModalOpen = true;
        document.body.style.overflow = 'hidden';
      }
    });
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedReclamation = null;
    document.body.style.overflow = 'auto';
  }

  openAssignModal(reclamation: Reclamation) {
    this.selectedReclamation = reclamation;

    // Récupérer les IDs des techniciens déjà assignés
    const currentTechnicienIds = reclamation.techniciens && reclamation.techniciens.length > 0
      ? reclamation.techniciens.map((tech: User) => tech.id)
      : [];

    this.assignForm.patchValue({
      selectedTechniciens: currentTechnicienIds
    });

    this.isAssignModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  openAssignModalFromDetail() {
    this.closeDetailModal();
    setTimeout(() => {
      if (this.selectedReclamation) {
        this.openAssignModal(this.selectedReclamation);
      }
    }, 300);
  }

  closeAssignModal() {
    this.isAssignModalOpen = false;
    this.selectedReclamation = null;
    this.assignForm.patchValue({ selectedTechniciens: [] });
    this.technicienSearch = '';
    this.filteredTechniciens = [...this.techniciens];
    document.body.style.overflow = 'auto';
  }

  onTechnicienSelectionChange(technicienId: string, event: any) {
    const selectedTechniciens = [...this.assignForm.value.selectedTechniciens];

    if (event.target.checked) {
      // Ajouter le technicien s'il n'est pas déjà sélectionné
      if (!selectedTechniciens.includes(technicienId)) {
        selectedTechniciens.push(technicienId);
      }
    } else {
      // Retirer le technicien de la sélection
      const index = selectedTechniciens.indexOf(technicienId);
      if (index > -1) {
        selectedTechniciens.splice(index, 1);
      }
    }

    this.assignForm.patchValue({
      selectedTechniciens: selectedTechniciens
    });
  }

  removeTechnicien(technicienId: string) {
    const selectedTechniciens = this.assignForm.value.selectedTechniciens.filter(
      (id: string) => id !== technicienId
    );

    this.assignForm.patchValue({
      selectedTechniciens: selectedTechniciens
    });
  }

  assignTechniciens() {
    if (!this.selectedReclamation || !this.assignForm.valid) {
      return;
    }

    const technicienIds = this.assignForm.value.selectedTechniciens;

    if (technicienIds.length === 0) {
      this.errorMessage = 'Veuillez sélectionner au moins un technicien';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.isLoading = true;

    this.reclamationService.assignTechniciens(this.selectedReclamation.id, technicienIds).subscribe({
      next: (response: any) => {
        console.log('Techniciens assignés avec succès:', response);
        this.successMessage = `${technicienIds.length} technicien(s) assigné(s) avec succès`;

        // Recharger les réclamations pour avoir les données à jour
        this.loadReclamations();

        this.closeAssignModal();
        this.isLoading = false;

        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Erreur lors de l\'assignation:', error);
        this.errorMessage = 'Erreur lors de l\'assignation des techniciens';
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  deleteReclamation(reclamation: Reclamation) {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer la réclamation "${reclamation.titre}" ?\n\nCette action est irréversible.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.isLoading = true;

    this.reclamationService.deleteReclamation(reclamation.id).subscribe({
      next: (response: any) => {
        console.log('Réclamation supprimée:', response);
        this.successMessage = 'Réclamation supprimée avec succès';

        // Retirer la réclamation de la liste locale
        this.reclamations = this.reclamations.filter(r => r.id !== reclamation.id);

        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.errorMessage = 'Erreur lors de la suppression de la réclamation';
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  getTechnicienName(technicienId: string): string {
    const technicien = this.techniciens.find(tech => tech.id === technicienId);

    if (!technicien) {
      return 'Inconnu';
    }

    const prenom = technicien.prenom || '';
    const nom = technicien.nom || '';

    return `${prenom} ${nom}`.trim() || 'Technicien';
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
