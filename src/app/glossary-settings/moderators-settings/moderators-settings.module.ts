import { NgModule } from '@angular/core';
import { ModeratorsSettingsComponent } from './moderators-settings.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ModeratorsSettingsRoutingModule } from './moderators-settings-routing.module';
import { ModeratorCardComponent } from './moderator-card/moderator-card.component';

@NgModule({
  imports: [
    SharedModule,
    ModeratorsSettingsRoutingModule
  ],
  declarations: [ModeratorsSettingsComponent, ModeratorCardComponent]
})
export class ModeratorsSettingsModule { }
