import { NgModule } from '@angular/core';
import { GlossariesComponent } from './glossaries.component';
import { SharedModule } from '../shared/shared.module';
import { GlossariesRoutingModule } from './glossaries-routing.module';
import { GlossaryCardComponent } from './glossary-card/glossary-card.component';

@NgModule({
  imports: [
    SharedModule,
    GlossariesRoutingModule
  ],
  declarations: [GlossariesComponent, GlossaryCardComponent]
})
export class GlossariesModule { }
