import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ProjectStatisticsComponent } from './project-statistics.component';
import { ProjectStatisticsRoutingModule } from './project-statistics-routing.mocule';

@NgModule({
  imports: [
    SharedModule,
    ProjectStatisticsRoutingModule
  ],
  declarations: [ProjectStatisticsComponent]
})
export class ProjectStatisticsModule { }
