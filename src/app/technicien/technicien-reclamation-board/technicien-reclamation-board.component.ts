import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AuthService } from '../../Services/auth.service';
import { ReclamationService } from '../../Services/reclamathion.service';

@Component({
  selector: 'app-technicien-reclamation-board',
  templateUrl: './technicien-reclamation-board.component.html',
  styleUrl: './technicien-reclamation-board.component.scss'
})
export class TechnicienReclamationBoardComponent implements OnInit {
  reclamations: any[] = [];
  currentTechnicien: any;
  selectedReclamation: any = null;
  isDetailsModalOpen: boolean = false;
  newComment: string = '';

  constructor(
    private reclamationService: ReclamationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentTechnicien = this.authService.getCurrentUser();
    this.loadReclamations();
  }

  trackByReclamationId(index: number, reclamation: any): number {
    return reclamation.id;
  }

  loadReclamations() {
    if (this.currentTechnicien) {
      this.reclamationService.getReclamationsByTechnicien(this.currentTechnicien.id).subscribe(
        (data: any[]) => {
          this.reclamations = data;
        },
        error => {
          console.error('Erreur lors du chargement des réclamations:', error);
        }
      );
    }
  }

  getReclamationsByStatus(status: string): any[] {
    return this.reclamations.filter(rec => rec.statut === status);
  }

  getTotalReclamations(): number {
    return this.reclamations.length;
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      // Déplacement dans la même colonne
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Déplacement entre colonnes - changement de statut
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      const reclamation = event.container.data[event.currentIndex];
      const newStatus = this.getStatusFromContainerId(event.container.id);

      this.updateStatus(reclamation, newStatus);
    }
  }

  getStatusFromContainerId(containerId: string): string {
    switch (containerId) {
      case 'todo': return 'ASSIGNEE';
      case 'inprogress': return 'EN_COURS';
      case 'done': return 'RESOLUE';
      default: return 'ASSIGNEE';
    }
  }

  updateStatus(reclamation: any, newStatus: string) {
    const oldStatus = reclamation.statut;
    reclamation.statut = newStatus;

    // Mettre à jour les dates si nécessaire
    if (newStatus === 'EN_COURS' && oldStatus !== 'EN_COURS') {
      reclamation.dateDebutTraitement = new Date();
    } else if (newStatus === 'RESOLUE' && oldStatus !== 'RESOLUE') {
      reclamation.dateResolution = new Date();
    }

    this.reclamationService.updateReclamationStatus(reclamation.id, newStatus).subscribe(
      (response: any) => {
        console.log(`Statut mis à jour: ${oldStatus} -> ${newStatus}`);
      },
      error => {
        console.error('Erreur lors de la mise à jour:', error);
        // Revert the change on error
        reclamation.statut = oldStatus;
      }
    );
  }

  // AJOUTER CES MÉTHODES POUR LE MODAL
  openDetailsModal(reclamation: any) {
    this.selectedReclamation = reclamation;
    this.isDetailsModalOpen = true;
    document.body.style.overflow = 'hidden'; // Empêcher le scroll de la page
  }

  closeDetailsModal() {
    this.isDetailsModalOpen = false;
    this.selectedReclamation = null;
    this.newComment = '';
    document.body.style.overflow = 'auto'; // Rétablir le scroll
  }

addComment(): void {
  if (this.selectedReclamation && this.newComment.trim()) {
    const comment = {
      technicienId: this.currentTechnicien.id,
      commentaire: this.newComment.trim(), // nettoyer les espaces
    };

    this.reclamationService.addComment(this.selectedReclamation.id, comment).subscribe({
      next: (updatedReclamation) => {
        console.log('Réclamation mise à jour :', updatedReclamation);

        // ✅ Met à jour localement la liste des commentaires (pour mise à jour instantanée)
        if (!this.selectedReclamation.commentaires) {
          this.selectedReclamation.commentaires = [];
        }

        this.selectedReclamation.commentaires.push({
          ...comment,
          technicienNom: this.currentTechnicien.nom,
          date: new Date()
        });

        // Réinitialiser le champ du commentaire
        this.newComment = '';
      },
      error: (err) => {
        console.error('Erreur lors de l’ajout du commentaire :', err);
      }
    });
  }
}

  // Méthode utilitaire pour formater la date
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
