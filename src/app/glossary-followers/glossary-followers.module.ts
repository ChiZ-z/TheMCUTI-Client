import { NgModule } from '@angular/core';
import { GlossaryFollowersComponent } from './glossary-followers.component';
import { SharedModule } from '../shared/shared.module';
import { GlossaryFollowersRoutingModule } from './glossary-followers-routing.module';
import { FollowerCardComponent } from './follower-card/follower-card.component';

@NgModule({
  imports: [
    SharedModule,
    GlossaryFollowersRoutingModule
  ],
  declarations: [GlossaryFollowersComponent, FollowerCardComponent]
})
export class GlossaryFollowersModule { }
