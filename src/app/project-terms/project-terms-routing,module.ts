import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectTermsComponent } from './project-terms.component';

const routes: Routes = [
    {
        path: '',
        component: ProjectTermsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectTermsRoutingModule { }