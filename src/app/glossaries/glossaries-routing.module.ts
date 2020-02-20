import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlossariesComponent } from './glossaries.component';

const routes: Routes = [
    {
        path: '',
        component: GlossariesComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GlossariesRoutingModule { }