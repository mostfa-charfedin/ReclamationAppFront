import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserReclamationBoardComponent } from './user-reclamation-board/user-reclamation-board.component';
import { UserReclamationComponent } from './user-reclamation/user-reclamation.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'user/dashboard', component: UserReclamationComponent },
  { path: 'user/reclamations-board', component: UserReclamationBoardComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: '**', redirectTo: 'stats' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
