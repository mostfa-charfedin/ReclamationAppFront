import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { TechnicienRoutingModule } from './technicien-routing.module';
import { TechnicienComponent } from './technicien.component';
import { TechnicienDashboardComponent } from './technicien-dashboard/technicien-dashboard.component';
import { TechnicienReclamationBoardComponent } from './technicien-reclamation-board/technicien-reclamation-board.component';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [
    TechnicienComponent,
    TechnicienDashboardComponent,
    TechnicienReclamationBoardComponent,
  ],
  imports: [
    CommonModule,
    TechnicienRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
  ],

})
export class TechnicienModule { }
