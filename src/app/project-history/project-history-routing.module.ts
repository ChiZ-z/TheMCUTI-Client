import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectHistoryComponent } from './project-history.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectHistoryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectHistoryRoutingModule { }