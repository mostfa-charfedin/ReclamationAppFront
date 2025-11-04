import { NgModule } from '@angular/core';


import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminStatsComponent } from './admin-stats/admin-stats.component';

import { CommonModule } from '@angular/common';

import { AppModule } from '../app.module';
import { UserManagementComponent } from './user-management/user-management.component';


@NgModule({
  declarations: [
    AdminComponent,
    AdminDashboardComponent,
    AdminStatsComponent,
    UserManagementComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
   
  ]

})
export class AdminModule { }
