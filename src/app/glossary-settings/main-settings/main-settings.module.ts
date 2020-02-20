import { NgModule } from '@angular/core';
import { MainSettingsComponent } from './main-settings.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MainSettingsRoutingModule } from './main-settings-routing.module';

@NgModule({
  imports: [
    SharedModule,
    MainSettingsRoutingModule
  ],
  declarations: [MainSettingsComponent]
})
export class MainSettingsModule { }
