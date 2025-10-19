import { Component, OnInit } from '@angular/core';
import { ReclamationService } from '../../Services/reclamathion.service';


@Component({
  selector: 'app-admin-stats',
  templateUrl: './admin-stats.component.html',
  styleUrl: './admin-stats.component.scss'
})
export class AdminStatsComponent  implements OnInit {
  stats: any = {};
  chartData: any;

  constructor(private reclamationService: ReclamationService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.reclamationService.getStats().subscribe(
      (data: any) => {
        this.stats = {
          ...data,
          total: (data.nouvelles || 0) + (data.assignees || 0) + (data.enCours || 0) + (data.resolues || 0),
          ceMois: data.ceMois || 0,
          tempsMoyenTraitement: data.tempsMoyenTraitement || '2.5',
          satisfaction: data.satisfaction || 4.2
        };
        this.prepareChartData();
      },
      error => {
        console.error('Erreur lors du chargement des stats:', error);
      }
    );
  }

  prepareChartData() {
    this.chartData = {
      labels: ['Nouvelles', 'Assignées', 'En cours', 'Résolues'],
      datasets: [
        {
          data: [
            this.stats.nouvelles || 0,
            this.stats.assignees || 0,
            this.stats.enCours || 0,
            this.stats.resolues || 0
          ],
          backgroundColor: [
            '#EF4444', // Rouge pour nouvelles
            '#F59E0B', // Jaune pour assignées
            '#3B82F6', // Bleu pour en cours
            '#10B981'  // Vert pour résolues
          ]
        }
      ]
    };
  }
}
