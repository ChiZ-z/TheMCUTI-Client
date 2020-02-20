import { NgModule } from '@angular/core';

import { StatisticsComponent } from './statistics.component';
import { SharedModule } from '../../shared/shared.module';
import { StatsRoutingModule } from './stats-routing.module';

@NgModule({
  imports: [
    SharedModule,
    StatsRoutingModule
  ],
  declarations: [StatisticsComponent]
})
export class StatisticsModule { }
