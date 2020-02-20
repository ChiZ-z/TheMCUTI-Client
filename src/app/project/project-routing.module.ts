import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectComponent } from './project.component';

const projectRouted: Routes = [
  {
    path: 'langs',
    loadChildren: '../project-langs/project-langs.module#ProjectLangsModule'
  },
  {
    path: 'terms',
    loadChildren: '../project-terms/project-terms.module#ProjectTermsModule'
  },
  {
    path: 'contributors',
    loadChildren: '../project-contributors/project-contributors.module#ProjectContributorsModule'
  },
  {
    path: 'statistics',
    loadChildren: '../project-statistics/project-statistics.module#ProjectStatisticsModule'
  }, 
  {
    path: 'history',
    loadChildren: '../project-history/project-history.module#ProjectHistoryModule'
  },
  { path: '', redirectTo: 'langs', pathMatch: 'full' }
];

const routes: Routes = [
  {
    path: '',
    component: ProjectComponent,
    children: projectRouted
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule { }