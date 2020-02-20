import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignmentSettingsComponent } from './assignment-settings.component';

const routes: Routes = [
    {
        path: '',
        component: AssignmentSettingsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AssignmentSettingsRoutingModule { }