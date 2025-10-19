import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';
import { ReclamationService } from '../../Services/reclamathion.service';
import { UserService } from '../../Services/user.service';


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class  AdminDashboardComponent implements OnInit {
   reclamations: any[] = [];
  techniciens: any[] = [];
  selectedReclamation: any = null;
  assignForm: FormGroup;
  isModalOpen: boolean = false;

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
    this.reclamationService.getAllReclamations().subscribe(
      (data: any[]) => {
        this.reclamations = data;
      },
      error => {
        console.error('Erreur lors du chargement des réclamations:', error);
      }
    );
  }

  loadTechniciens() {
    this.userService.getTechniciens().subscribe(
      (data: any[]) => {
        this.techniciens = data;
      },
      error => {
        console.error('Erreur lors du chargement des techniciens:', error);
      }
    );
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

  getStats() {
    return {
      nouvelles: this.reclamations.filter(r => r.statut === 'NOUVELLE').length,
      assignees: this.reclamations.filter(r => r.statut === 'ASSIGNEE').length,
      resolues: this.reclamations.filter(r => r.statut === 'RESOLUE').length
    };
  }

  openAssignModal(reclamation: any) {
    this.selectedReclamation = reclamation;
    const currentTechnicienIds = reclamation.techniciens
      ? reclamation.techniciens.map((tech: any) => tech.id)
      : [];

    this.assignForm.patchValue({
      selectedTechniciens: currentTechnicienIds
    });

    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedReclamation = null;
    this.assignForm.patchValue({ selectedTechniciens: [] });
    document.body.style.overflow = 'auto';
  }

  onTechnicienSelectionChange(technicienId: number, event: any) {
    const selectedTechniciens = [...this.assignForm.value.selectedTechniciens];

    if (event.target.checked) {
      if (!selectedTechniciens.includes(technicienId)) {
        selectedTechniciens.push(technicienId);
      }
    } else {
      const index = selectedTechniciens.indexOf(technicienId);
      if (index > -1) {
        selectedTechniciens.splice(index, 1);
      }
    }

    this.assignForm.patchValue({
      selectedTechniciens: selectedTechniciens
    });
  }

  removeTechnicien(technicienId: number) {
    const selectedTechniciens = this.assignForm.value.selectedTechniciens.filter((id: number) => id !== technicienId);
    this.assignForm.patchValue({
      selectedTechniciens: selectedTechniciens
    });
  }

  assignTechniciens() {
    if (this.selectedReclamation && this.assignForm.valid) {
      const technicienIds = this.assignForm.value.selectedTechniciens;

      this.reclamationService.assignTechniciens(this.selectedReclamation.id, technicienIds).subscribe(
        (response: any) => {
          this.loadReclamations();
          this.closeModal();
        },
        error => {
          console.error('Erreur lors de l\'assignation:', error);
        }
      );
    }
  }

  getTechnicienName(technicienId: number): string {
    const technicien = this.techniciens.find(tech => tech.id === technicienId);
    return technicien ? technicien.nom : 'Inconnu';
  }
}
