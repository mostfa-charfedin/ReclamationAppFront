import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TechnicienComponent } from './technicien.component';
import { TechnicienDashboardComponent } from './technicien-dashboard/technicien-dashboard.component';
import { TechnicienReclamationBoardComponent } from './technicien-reclamation-board/technicien-reclamation-board.component';


const routes: Routes = [
  {path: '', component: TechnicienComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full'  },
      { path: 'dashboard', component: TechnicienDashboardComponent },
      { path: 'reclamation-board', component: TechnicienReclamationBoardComponent },
      { path: '**', redirectTo: '' }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TechnicienRoutingModule { }
