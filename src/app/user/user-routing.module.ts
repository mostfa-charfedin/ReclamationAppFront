import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { UserReclamationComponent } from './user-reclamation/user-reclamation.component';
import { UserReclamationBoardComponent } from './user-reclamation-board/user-reclamation-board.component';


const routes: Routes = [
   { path: '', component: UserComponent,
      children:[
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        { path: 'dashboard', component: UserReclamationComponent },
        { path: 'reclamation-board', component: UserReclamationBoardComponent },
        { path: '**', redirectTo: '' }

  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
