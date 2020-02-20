import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history.component';
import { HistoryRoutingModule } from './history-routing.module';
import { UserHistoryCardComponent } from './user-history-card/user-history-card.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    HistoryRoutingModule
  ],
  declarations: [HistoryComponent, UserHistoryCardComponent]
})
export class HistoryModule { }
