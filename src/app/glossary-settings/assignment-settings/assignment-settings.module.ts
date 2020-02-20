import { NgModule } from '@angular/core';
import { AssignmentSettingsComponent } from './assignment-settings.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AssignmentSettingsRoutingModule } from './assignment-settings-routing.module';

@NgModule({
  imports: [
    SharedModule,
    AssignmentSettingsRoutingModule
  ],
  declarations: [AssignmentSettingsComponent]
})
export class AssignmentSettingsModule { }
