import { NgModule } from '@angular/core';
import { GlossaryComponent } from './glossary.component';
import { SharedModule } from '../shared/shared.module';
import { GlossaryRoutingModule } from './glossary-routing.module';

@NgModule({
  imports: [
    SharedModule,
    GlossaryRoutingModule
  ],
  declarations: [GlossaryComponent]
})
export class GlossaryModule { }
