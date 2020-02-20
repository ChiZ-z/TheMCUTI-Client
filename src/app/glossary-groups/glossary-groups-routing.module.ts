import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlossaryGroupsComponent } from './glossary-groups.component';

const routes: Routes = [
    {
        path: '',
        component: GlossaryGroupsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GlossaryGroupsRoutingModule { }