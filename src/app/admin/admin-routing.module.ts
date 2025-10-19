import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminStatsComponent } from './admin-stats/admin-stats.component';

const routes: Routes = [
  { path: '', component: AdminComponent,
  children:[
  { path: '', redirectTo: 'stats', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'stats', component: AdminStatsComponent },
  { path: '**', redirectTo: '' }]
 }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
