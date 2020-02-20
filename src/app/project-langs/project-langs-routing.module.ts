import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectLangsComponent } from './project-langs.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectLangsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectLangsRoutingModule { }