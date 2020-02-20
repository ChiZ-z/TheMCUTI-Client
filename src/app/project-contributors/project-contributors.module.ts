import { NgModule } from '@angular/core';

import { ProjectContributorsComponent } from './project-contributors.component';
import { SharedModule } from '../shared/shared.module';
import { ContributorsRoutingModule } from './contributors-routing.module';
import { ContributorCardComponent } from './contributor-card/contributor-card.component';

@NgModule({
  imports: [
    SharedModule,
    ContributorsRoutingModule
  ],
  declarations: [ProjectContributorsComponent, ContributorCardComponent]
})
export class ProjectContributorsModule { }
