import { NgModule } from '@angular/core';

import { ProjectLangsComponent } from './project-langs.component';
import { ProjectLangsRoutingModule } from './project-langs-routing.module';
import { SharedModule } from '../shared/shared.module';
import { LangCardComponent } from './lang-card/lang-card.component';

@NgModule({
  imports: [
    SharedModule,
    ProjectLangsRoutingModule
  ],
  declarations: [ProjectLangsComponent, LangCardComponent]
})
export class ProjectLangsModule { }
