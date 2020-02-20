import { NgModule } from '@angular/core';
import { GlossarySettingsComponent } from './glossary-settings.component';
import { SharedModule } from '../shared/shared.module';
import { GlossarySettingsRoutingModule } from './glossary-settings-routing.module';

@NgModule({
  imports: [
    SharedModule,
    GlossarySettingsRoutingModule
  ],
  declarations: [GlossarySettingsComponent]
})
export class GlossarySettingsModule { }
