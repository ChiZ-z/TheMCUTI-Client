import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectLangComponent } from './project-lang.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectLangComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectLangRoutingModule { }