import { NgModule } from '@angular/core';
import { ProjectHistoryComponent } from './project-history.component';
import { ProjectHistoryRoutingModule } from './project-history-routing.module';
import { ProjectHistoryCardComponent } from './project-history-card/project-history-card.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    ProjectHistoryRoutingModule
  ],
  declarations: [ProjectHistoryComponent, ProjectHistoryCardComponent]
})
export class ProjectHistoryModule { }
