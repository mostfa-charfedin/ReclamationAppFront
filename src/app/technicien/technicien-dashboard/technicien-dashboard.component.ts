import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../Services/auth.service';
import { ReclamationService } from '../../Services/reclamathion.service';

@Component({
  selector: 'app-technicien-dashboard',
  templateUrl: './technicien-dashboard.component.html',
  styleUrls: ['./technicien-dashboard.component.scss']
})
export class TechnicienDashboardComponent implements OnInit {
  reclamations: any[] = [];
  filteredReclamations: any[] = [];
  selectedReclamation: any = null;
  currentTechnicien: any;
  filterStatut: string = 'TOUS';
  isDetailsModalOpen: boolean = false;
  newComment: string = '';
  isLoading: boolean = false;

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
    this.loadCurrentTechnicien();
    this.loadReclamations();
  }

  loadCurrentTechnicien() {
    this.currentTechnicien = this.authService.getCurrentUser();
    if (!this.currentTechnicien) {
      console.error('Aucun technicien connecté');
    }
  }

  loadReclamations() {
    if (!this.currentTechnicien || !this.currentTechnicien.id) {
      console.error('ID du technicien non disponible');
      return;
    }

    this.isLoading = true;

    this.reclamationService.getReclamationsByTechnicien(this.currentTechnicien.id).subscribe({
      next: (data: any[]) => {
        this.reclamations = data || [];
        this.applyFilters();
        this.isLoading = false;
        console.log('Réclamations chargées:', this.reclamations);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réclamations:', error);
        this.isLoading = false;
        this.reclamations = [];
        this.filteredReclamations = [];
      }
    });
  }

  applyFilters() {
    if (this.filterStatut === 'TOUS') {
      this.filteredReclamations = [...this.reclamations];
    } else {
      this.filteredReclamations = this.reclamations.filter(
        reclamation => reclamation.statut === this.filterStatut
      );
    }
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

  getStatusDisplay(statut: string): string {
    switch (statut) {
      case 'ASSIGNEE':
        return 'Assignée';
      case 'EN_COURS':
        return 'En cours';
      case 'RESOLUE':
        return 'Résolue';
      case 'TOUS':
        return 'Toutes';
      default:
        return statut;
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
    console.log('Mise à jour du statut:', reclamation.statut, 'pour la réclamation:', reclamation.id);

    this.reclamationService.updateReclamationStatus(reclamation.id, reclamation.statut).subscribe({
      next: (response: any) => {
        console.log('Statut mis à jour avec succès:', response);

        // Mettre à jour la réclamation localement avec la réponse du serveur
        const index = this.reclamations.findIndex(r => r.id === reclamation.id);
        if (index !== -1) {
          this.reclamations[index] = { ...this.reclamations[index], ...response };
        }

        this.applyFilters();

        // Ajouter des commentaires automatiques
        if (reclamation.statut === 'EN_COURS') {
          this.addAutoComment(reclamation, 'Traitement démarré par le technicien');
        } else if (reclamation.statut === 'RESOLUE') {
          this.addAutoComment(reclamation, 'Réclamation résolue avec succès');
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
        // Recharger les données en cas d'erreur
        this.loadReclamations();
      }
    });
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
    // Recharger la réclamation pour avoir les données à jour
    this.reclamationService.getReclamationById(reclamation.id).subscribe({
      next: (data: any) => {
        this.selectedReclamation = data;
        this.isDetailsModalOpen = true;
        document.body.style.overflow = 'hidden';
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails:', error);
        // En cas d'erreur, utiliser les données locales
        this.selectedReclamation = reclamation;
        this.isDetailsModalOpen = true;
        document.body.style.overflow = 'hidden';
      }
    });
  }

  closeDetailsModal() {
    this.isDetailsModalOpen = false;
    this.selectedReclamation = null;
    this.newComment = '';
    document.body.style.overflow = 'auto';

    // Recharger les réclamations pour avoir les données à jour
    this.loadReclamations();
  }

  addComment() {
    if (!this.selectedReclamation || !this.newComment.trim()) {
      return;
    }

    const commentaireData = {
      commentaire: this.newComment.trim(),
      technicienId: this.currentTechnicien.id
    };

    this.reclamationService.addComment(this.selectedReclamation.id, commentaireData).subscribe({
      next: (response: any) => {
        console.log('Commentaire ajouté avec succès:', response);

        // Ajouter le commentaire localement pour un affichage immédiat
        const nouveauCommentaire = {
          id: response.id || Date.now().toString(),
          commentaire: this.newComment.trim(),
          technicien: {
            id: this.currentTechnicien.id,
            prenom: this.currentTechnicien.prenom,
            nom: this.currentTechnicien.nom
          },
          date: new Date()
        };

        if (!this.selectedReclamation.commentaires) {
          this.selectedReclamation.commentaires = [];
        }

        this.selectedReclamation.commentaires.push(nouveauCommentaire);
        this.newComment = '';
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        alert('Erreur lors de l\'enregistrement du commentaire. Veuillez réessayer.');
      }
    });
  }

  addAutoComment(reclamation: any, message: string) {
    const commentaireData = {
      commentaire: message,
      technicienId: this.currentTechnicien.id
    };

    this.reclamationService.addComment(reclamation.id, commentaireData).subscribe({
      next: (response: any) => {
        console.log('Commentaire automatique ajouté:', response);

        // Ajouter le commentaire localement
        if (!reclamation.commentaires) {
          reclamation.commentaires = [];
        }

        reclamation.commentaires.push({
          id: response.id || Date.now().toString(),
          commentaire: message,
          technicien: {
            id: this.currentTechnicien.id,
            prenom: this.currentTechnicien.prenom,
            nom: this.currentTechnicien.nom
          },
          date: new Date()
        });
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du commentaire automatique:', error);
      }
    });
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
