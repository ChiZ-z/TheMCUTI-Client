import { NgModule } from '@angular/core';

import { ProjectComponent } from './project.component';
import { SharedModule } from '../shared/shared.module';
import { ProjectRoutingModule } from './project-routing.module';

@NgModule({
  imports: [
    SharedModule,
    ProjectRoutingModule
  ],
  declarations: [ProjectComponent]
})
export class ProjectModule { }
