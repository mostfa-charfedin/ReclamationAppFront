import { Component, OnInit } from '@angular/core';
import { ReclamationService } from '../../Services/reclamathion.service';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-technicien-dashboard',
  templateUrl: './technicien-dashboard.component.html',
  styleUrl: './technicien-dashboard.component.scss'
})
export class TechnicienDashboardComponent implements OnInit {
  reclamations: any[] = [];
  filteredReclamations: any[] = [];
  selectedReclamation: any = null;
  currentTechnicien: any;
  filterStatut: string = 'TOUS';
  isDetailsModalOpen: boolean = false;
  newComment: string = '';

  statusOptions = [
    { value: 'ASSIGNEE', label: 'Assignée' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'RESOLUE', label: 'Résolue' }
  ];

  constructor(
    private reclamationService: ReclamationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentTechnicien = this.authService.getCurrentUser();
    this.loadReclamations();
  }

  loadReclamations() {
    if (this.currentTechnicien) {
      console.log('ID du technicien actuel:', this.currentTechnicien.id);
      this.reclamationService.getReclamationsByTechnicien(this.currentTechnicien.id).subscribe(
        (data: any[]) => {
          this.reclamations = data;
          this.applyFilters();
          console.log('Réclamations du technicien:', data);
        },
        error => {
          console.error('Erreur lors du chargement des réclamations:', error);
        }
      );
    }
  }

  applyFilters() {
    this.filteredReclamations = this.reclamations.filter(reclamation => {
      if (this.filterStatut === 'TOUS') return true;
      return reclamation.statut === this.filterStatut;
    });
  }

  onFilterChange(event: any) {
    this.filterStatut = event.target.value;
    this.applyFilters();
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'ASSIGNEE':
        return 'bg-red-500 text-white';
      case 'EN_COURS':
        return 'bg-yellow-500 text-white';
      case 'RESOLUE':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  }

  getStatusButtonClass(statut: string): string {
    switch (statut) {
      case 'ASSIGNEE':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'EN_COURS':
        return 'bg-yellow-500 text-white hover:bg-yellow-600';
      case 'RESOLUE':
        return 'bg-green-500 text-white hover:bg-green-600';
      default:
        return 'bg-gray-400 text-white';
    }
  }

  updateStatus(reclamation: any) {
    this.reclamationService.updateReclamationStatus(reclamation.id, reclamation.statut).subscribe(
      (response: any) => {
        this.applyFilters();
      },
      error => {
        console.error('Erreur lors de la mise à jour:', error);
        this.loadReclamations(); // Recharger en cas d'erreur
      }
    );
  }

  updateStatusFromModal(statut: string) {
    if (this.selectedReclamation) {
      this.selectedReclamation.statut = statut;
      this.updateStatus(this.selectedReclamation);
    }
  }

  markAsInProgress(reclamation: any) {
    reclamation.statut = 'EN_COURS';
    this.updateStatus(reclamation);
  }

  markAsResolved(reclamation: any) {
    reclamation.statut = 'RESOLUE';
    this.updateStatus(reclamation);
  }

  openDetailsModal(reclamation: any) {
    this.selectedReclamation = reclamation;
    this.isDetailsModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeDetailsModal() {
    this.isDetailsModalOpen = false;
    this.selectedReclamation = null;
    this.newComment = '';
    document.body.style.overflow = 'auto';
  }

  addComment() {
    if (this.selectedReclamation && this.newComment.trim()) {
      // Implémentez l'ajout de commentaire
      console.log('Nouveau commentaire:', this.newComment);
      this.newComment = '';
    }
  }

  getStats() {
    return {
      total: this.reclamations.length,
      assignees: this.reclamations.filter(r => r.statut === 'ASSIGNEE').length,
      enCours: this.reclamations.filter(r => r.statut === 'EN_COURS').length,
      resolues: this.reclamations.filter(r => r.statut === 'RESOLUE').length
    };
  }
}
