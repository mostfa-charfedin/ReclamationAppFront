import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { AuthService } from '../Services/auth.service';
import { ReclamationService } from '../Services/reclamathion.service';

@Component({
  selector: 'app-user-reclamation-board',
  templateUrl: './user-reclamation-board.component.html',
  styleUrl: './user-reclamation-board.component.scss',
  standalone: true,
  imports: [CommonModule, DragDropModule],
})
export class UserReclamationBoardComponent implements OnInit {
  reclamations: any[] = [];

  constructor(
    private reclamationService: ReclamationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadReclamations();
  }

  loadReclamations() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.reclamationService.getReclamationsByUser(currentUser.id).subscribe(
        (data: any[]) => {
          this.reclamations = data;
          console.log(this.reclamations);
        },
        error => {
          console.error('Erreur lors du chargement des réclamations:', error);
        }
      );
    }
  }

getReclamationsByStatus(status: string | string[]): any[] {
  if (Array.isArray(status)) {
    return this.reclamations.filter(rec => status.includes(rec.statut));
  }
  return this.reclamations.filter(rec => rec.statut === status);
}


  getTotalReclamations(): number {
    return this.reclamations.length;
  }

  drop(event: CdkDragDrop<any[]>) {
    // Pour l'utilisateur, le drag & drop est en lecture seule

    if (event.previousContainer === event.container) {
      // Déplacement dans la même colonne
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Pour l'utilisateur, on empêche le changement de colonne
      // On pourrait aussi simplement ne pas permettre le drop entre colonnes
      // en utilisant [cdkDropListConnectedTo]="[]"
    }
  }
}
