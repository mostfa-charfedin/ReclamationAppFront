import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../Services/auth.service';
import { ReclamationService } from '../Services/reclamathion.service';

@Component({
  selector: 'app-user-reclamation',
  templateUrl: './user-reclamation.component.html',
  styleUrl: './user-reclamation.component.scss'
})
export class UserReclamationComponent  implements OnInit {
  reclamationForm: FormGroup;
  isSubmitting: boolean = false;
  showSuccessModal: boolean = false;
  lastSubmissionId: number = 0;

  constructor(
    private fb: FormBuilder,
    private reclamationService: ReclamationService,
    private authService: AuthService
  ) {
    this.reclamationForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  ngOnInit() {
    // Générer un ID de soumission pour l'affichage
    this.lastSubmissionId = Math.floor(1000 + Math.random() * 9000);
  }

  onSubmit() {
    if (this.reclamationForm.valid) {
      this.isSubmitting = true;

      const reclamation = {
        ...this.reclamationForm.value,
        userId: this.authService.getCurrentUser()?.id,
        dateCreation: new Date(),
        statut: 'NOUVELLE'
      };

      this.reclamationService.createReclamation(reclamation).subscribe(
        (response: any) => {
          this.isSubmitting = false;
          this.showSuccessModal = true;
          this.reclamationForm.reset();
          document.body.style.overflow = 'hidden';
        },
        error => {
          this.isSubmitting = false;
          console.error('Erreur lors de la soumission:', error);
          alert('Une erreur est survenue lors de la soumission de votre réclamation.');
        }
      );
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormGroupTouched();
    }
  }

  resetForm() {
    if (confirm('Êtes-vous sûr de vouloir effacer tous les champs ?')) {
      this.reclamationForm.reset();
    }
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    document.body.style.overflow = 'auto';
  }

  markFormGroupTouched() {
    Object.keys(this.reclamationForm.controls).forEach(key => {
      const control = this.reclamationForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters pour un accès facile aux contrôles du formulaire
  get titre() { return this.reclamationForm.get('titre'); }
  get description() { return this.reclamationForm.get('description'); }
}
