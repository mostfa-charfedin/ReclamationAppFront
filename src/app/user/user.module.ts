import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { UserReclamationBoardComponent } from './user-reclamation-board/user-reclamation-board.component';
import { UserReclamationComponent } from './user-reclamation/user-reclamation.component';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [
    UserComponent,
    UserReclamationComponent,
    UserReclamationBoardComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,


  ],


})
export class UserModule { }
