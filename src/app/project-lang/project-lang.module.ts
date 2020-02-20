import { NgModule } from '@angular/core';

import { ProjectLangComponent } from './project-lang.component';
import { SharedModule } from '../shared/shared.module';
import { ProjectLangRoutingModule } from './project-lang-routing.module';
import { TranslationCardComponent } from './translation-card/translation-card.component';

@NgModule({
  imports: [
    SharedModule,
    ProjectLangRoutingModule
  ],
  declarations: [ProjectLangComponent, TranslationCardComponent]
})
export class ProjectLangModule { }
