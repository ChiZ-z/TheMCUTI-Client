import { NgModule } from '@angular/core';
import { GlossaryGroupsComponent } from './glossary-groups.component';
import { SharedModule } from '../shared/shared.module';
import { GlossaryGroupsRoutingModule } from './glossary-groups-routing.module';
import { GroupCardComponent } from './group-card/group-card.component';

@NgModule({
  imports: [
    SharedModule,
    GlossaryGroupsRoutingModule
  ],
  declarations: [GlossaryGroupsComponent, GroupCardComponent]
})
export class GlossaryGroupsModule { }
