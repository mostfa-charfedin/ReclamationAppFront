import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AuthService } from '../../Services/auth.service';
import { ReclamationService } from '../../Services/reclamathion.service';

@Component({
  selector: 'app-technicien-reclamation-board',
  templateUrl: './technicien-reclamation-board.component.html',
  styleUrls: ['./technicien-reclamation-board.component.scss']
})
export class TechnicienReclamationBoardComponent implements OnInit {
  reclamations: any[] = [];
  currentTechnicien: any;
  selectedReclamation: any = null;
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
        this.isLoading = false;
        console.log('Réclamations chargées:', this.reclamations);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réclamations:', error);
        this.isLoading = false;
        this.reclamations = [];
      }
    });
  }

  trackByReclamationId(index: number, reclamation: any): string {
    return reclamation.id || index;
  }

  getReclamationsByStatus(status: string): any[] {
    return this.reclamations.filter(rec => rec.statut === status);
  }

  getTotalReclamations(): number {
    return this.reclamations.length;
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      // Déplacement dans la même colonne - pas de changement de statut
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Déplacement entre colonnes - changement de statut
      const reclamation = event.previousContainer.data[event.previousIndex];
      const oldStatus = reclamation.statut;
      const newStatus = this.getStatusFromContainerId(event.container.id);

      console.log(`Drag & Drop: ${oldStatus} -> ${newStatus} pour réclamation #${reclamation.id}`);

      // Appliquer le transfert visuellement d'abord
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      // Mettre à jour le statut via l'API
      this.updateStatusWithComment(reclamation, oldStatus, newStatus);
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

  updateStatusWithComment(reclamation: any, oldStatus: string, newStatus: string) {
    // Mettre à jour le statut localement
    reclamation.statut = newStatus;

    // Mettre à jour les dates selon le nouveau statut
    if (newStatus === 'EN_COURS' && oldStatus !== 'EN_COURS') {
      reclamation.dateDebutTraitement = new Date();
    } else if (newStatus === 'RESOLUE' && oldStatus !== 'RESOLUE') {
      reclamation.dateResolution = new Date();
    }

    // Mettre à jour le statut via l'API
    this.reclamationService.updateReclamationStatus(reclamation.id, newStatus).subscribe({
      next: (response: any) => {
        console.log(`Statut mis à jour avec succès: ${oldStatus} -> ${newStatus}`);

        // Mettre à jour la réclamation avec la réponse du serveur
        const index = this.reclamations.findIndex(r => r.id === reclamation.id);
        if (index !== -1) {
          this.reclamations[index] = { ...this.reclamations[index], ...response };
        }

        // Ajouter un commentaire automatique selon le changement de statut
        this.addAutoCommentForStatusChange(reclamation, oldStatus, newStatus);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);

        // En cas d'erreur, recharger les données pour synchroniser
        this.loadReclamations();
      }
    });
  }

  updateStatus(reclamation: any, newStatus: string) {
    const oldStatus = reclamation.statut;
    this.updateStatusWithComment(reclamation, oldStatus, newStatus);
  }

  addAutoCommentForStatusChange(reclamation: any, oldStatus: string, newStatus: string) {
    let message = '';

    // Générer le message selon la transition de statut
    if (oldStatus === 'ASSIGNEE' && newStatus === 'EN_COURS') {
      message = 'Traitement démarré par le technicien (Drag & Drop)';
    } else if (oldStatus === 'EN_COURS' && newStatus === 'RESOLUE') {
      message = 'Réclamation résolue avec succès (Drag & Drop)';
    } else if (oldStatus === 'RESOLUE' && newStatus === 'EN_COURS') {
      message = 'Réclamation réouverte pour traitement supplémentaire (Drag & Drop)';
    } else if (oldStatus === 'EN_COURS' && newStatus === 'ASSIGNEE') {
      message = 'Réclamation replanifiée - traitement reporté (Drag & Drop)';
    } else if (oldStatus === 'RESOLUE' && newStatus === 'ASSIGNEE') {
      message = 'Réclamation remise en attente (Drag & Drop)';
    } else if (oldStatus === 'ASSIGNEE' && newStatus === 'RESOLUE') {
      message = 'Réclamation résolue directement (Drag & Drop)';
    } else {
      message = `Statut modifié: ${this.getStatusLabel(oldStatus)} → ${this.getStatusLabel(newStatus)} (Drag & Drop)`;
    }

    this.addCommentToReclamation(reclamation, message);
  }

  addAutoComment(reclamation: any, message: string) {
    this.addCommentToReclamation(reclamation, message);
  }

  addCommentToReclamation(reclamation: any, message: string) {
    const commentaireData = {
      commentaire: message,
      technicienId: this.currentTechnicien.id
    };

    this.reclamationService.addComment(reclamation.id, commentaireData).subscribe({
      next: (response: any) => {
        console.log('Commentaire automatique ajouté:', response);

        // Ajouter le commentaire localement pour affichage immédiat
        const nouveauCommentaire = {
          id: response.id || Date.now().toString(),
          commentaire: message,
          technicien: {
            id: this.currentTechnicien.id,
            prenom: this.currentTechnicien.prenom,
            nom: this.currentTechnicien.nom
          },
          date: new Date()
        };

        if (!reclamation.commentaires) {
          reclamation.commentaires = [];
        }

        reclamation.commentaires.push(nouveauCommentaire);
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du commentaire automatique:', error);
      }
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ASSIGNEE': return 'Assignée';
      case 'EN_COURS': return 'En cours';
      case 'RESOLUE': return 'Résolue';
      default: return status;
    }
  }

  updateStatusFromModal(statut: string) {
    if (this.selectedReclamation) {
      const oldStatus = this.selectedReclamation.statut;
      this.selectedReclamation.statut = statut;

      // Mettre à jour via l'API avec commentaire
      this.updateStatusWithComment(this.selectedReclamation, oldStatus, statut);

      this.closeDetailsModal();
    }
  }

  openDetailsModal(reclamation: any) {
    // Recharger les détails complets depuis le serveur
    this.reclamationService.getReclamationById(reclamation.id).subscribe({
      next: (data: any) => {
        this.selectedReclamation = data;
        this.isDetailsModalOpen = true;
        document.body.style.overflow = 'hidden';
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails:', error);
        // En cas d'erreur, utiliser les données locales
        this.selectedReclamation = { ...reclamation };
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

    // Recharger les réclamations pour synchroniser les données
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

        // Ajouter le commentaire localement pour affichage immédiat
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

        // Mettre à jour également dans la liste principale
        const mainReclamation = this.reclamations.find(r => r.id === this.selectedReclamation.id);
        if (mainReclamation) {
          if (!mainReclamation.commentaires) {
            mainReclamation.commentaires = [];
          }
          mainReclamation.commentaires.push(nouveauCommentaire);
        }

        this.newComment = '';
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        alert('Erreur lors de l\'enregistrement du commentaire. Veuillez réessayer.');
      }
    });
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
}
