import { Component, OnInit } from '@angular/core';
import { ReclamationService } from '../../Services/reclamathion.service';

@Component({
  selector: 'app-admin-stats',
  templateUrl: './admin-stats.component.html',
  styleUrls: ['./admin-stats.component.scss']
})
export class AdminStatsComponent implements OnInit {
  stats: any = {
    total: 0,
    nouvelles: 0,
    assignees: 0,
    enCours: 0,
    resolues: 0,
    ceMois: 0,
    tempsMoyenTraitement: 0
  };

  chartData: any = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private reclamationService: ReclamationService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    this.errorMessage = '';

    // Utiliser getStatsFromReclamations() qui calcule les stats côté client
    this.reclamationService.getStatsFromReclamations().subscribe({
      next: (data: any) => {
        console.log('Statistiques reçues:', data);

        // Mapper les données reçues
        this.stats = {
          total: data.total || 0,
          nouvelles: data.nouvelles || 0,
          assignees: data.assignees || 0,
          enCours: data.enCours || 0,
          resolues: data.resolues || 0,
          ceMois: data.ceMois || 0,
          tempsMoyenTraitement: data.tempsMoyenTraitement || 0
        };

        this.prepareChartData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.errorMessage = 'Erreur lors du chargement des statistiques';
        this.isLoading = false;

        // Réinitialiser les stats à zéro en cas d'erreur
        this.stats = {
          total: 0,
          nouvelles: 0,
          assignees: 0,
          enCours: 0,
          resolues: 0,
          ceMois: 0,
          tempsMoyenTraitement: 0
        };

        this.prepareChartData();
      }
    });
  }

  prepareChartData() {
    this.chartData = {
      labels: ['Nouvelles', 'Assignées', 'En cours', 'Résolues'],
      datasets: [
        {
          data: [
            this.stats.nouvelles,
            this.stats.assignees,
            this.stats.enCours,
            this.stats.resolues
          ],
          backgroundColor: [
            '#EF4444', // Rouge pour nouvelles
            '#F59E0B', // Orange pour assignées
            '#3B82F6', // Bleu pour en cours
            '#10B981'  // Vert pour résolues
          ]
        }
      ]
    };
  }

  getPercentage(value: number): number {
    if (!value) return 0;
    if (!this.stats.total || this.stats.total === 0) return 0;
    return Math.round((value / this.stats.total) * 100);
  }

  getTauxResolution(): number {
    if (!this.stats.total || this.stats.total === 0) return 0;
    return Math.round((this.stats.resolues / this.stats.total) * 100);
  }
}
