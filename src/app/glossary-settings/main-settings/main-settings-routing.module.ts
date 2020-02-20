import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainSettingsComponent } from './main-settings.component';

const routes: Routes = [
    {
        path: '',
        component: MainSettingsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MainSettingsRoutingModule { }