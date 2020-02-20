import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlossaryFollowersComponent } from './glossary-followers.component';

const routes: Routes = [
    {
        path: '',
        component: GlossaryFollowersComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GlossaryFollowersRoutingModule { }