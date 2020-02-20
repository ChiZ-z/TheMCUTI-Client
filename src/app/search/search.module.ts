import { NgModule } from '@angular/core';

import { SearchComponent } from './search.component';
import { SharedModule } from '../shared/shared.module';
import { SearchRoutingModule } from './search-routing.module';
import { SearchCardComponent } from './search-card/search-card.component';

@NgModule({
  imports: [
    SharedModule,
    SearchRoutingModule
  ],
  declarations: [SearchComponent,SearchCardComponent]
})
export class SearchModule { }
