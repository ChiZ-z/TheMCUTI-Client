import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectContributorsComponent } from './project-contributors.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectContributorsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContributorsRoutingModule { }