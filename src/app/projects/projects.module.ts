import { NgModule } from '@angular/core';

import { ProjectsComponent } from './projects.component';
import { ProjectCardComponent } from './project-card/project-card.component';
import { SharedModule } from '../shared/shared.module';
import { ProjectsRoutingModule } from './projects-routing.module';
import { TokenService } from '../core';
import { Router } from '@angular/router';

@NgModule({
  imports: [
    SharedModule,
    ProjectsRoutingModule
  ],
  declarations: [ProjectsComponent, ProjectCardComponent]
})
export class ProjectsModule { }
