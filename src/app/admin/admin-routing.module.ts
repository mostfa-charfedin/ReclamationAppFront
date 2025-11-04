import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminStatsComponent } from './admin-stats/admin-stats.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { AdminGuard } from '../guards/admin.guard';

const routes: Routes = [
  { path: '', component: AdminComponent, canActivate: [AdminGuard],
  children:[
  { path: '', redirectTo: 'stats', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'stats', component: AdminStatsComponent },
  { path: 'users', component: UserManagementComponent },
  { path: '**', redirectTo: '' }]
 }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
