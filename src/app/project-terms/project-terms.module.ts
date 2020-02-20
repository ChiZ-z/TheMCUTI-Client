import { NgModule } from '@angular/core';

import { ProjectTermsComponent } from './project-terms.component';
import { SharedModule } from '../shared/shared.module';
import { ProjectTermsRoutingModule } from './project-terms-routing,module';
import { TermCardComponent } from './term-card/term-card.component';

@NgModule({
  imports: [
    SharedModule,
    ProjectTermsRoutingModule
  ],
  declarations: [ProjectTermsComponent, TermCardComponent]
})
export class ProjectTermsModule { }
