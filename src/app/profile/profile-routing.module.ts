import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';

const profileRoutes: Routes = [
  {
    path: 'info',
    loadChildren: './info/info.module#InfoModule'
  },
  {
    path: 'statistics',
    loadChildren: './statistics/statistics.module#StatisticsModule'
  },
  {
    path: 'history',
    loadChildren: './history/history.module#HistoryModule'
  },
  { path: '', redirectTo: 'info', pathMatch: 'full' },
];

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    children: profileRoutes
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }