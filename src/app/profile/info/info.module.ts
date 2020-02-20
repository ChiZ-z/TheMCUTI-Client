import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { InfoComponent } from './info.component';
import { InfoRoutingModule } from './info-routing.module';
import { UserLangCardComponent } from './user-lang-card/user-lang-card.component';
import { JobCardComponent } from './job-card/job-card.component';
import { ContactCardComponent } from './contact-card/contact-card.component';

@NgModule({
  imports: [
    SharedModule,
    InfoRoutingModule
  ],
  declarations: [InfoComponent, UserLangCardComponent, JobCardComponent, ContactCardComponent]
})
export class InfoModule { }
