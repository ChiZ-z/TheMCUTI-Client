import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModeratorsSettingsComponent } from './moderators-settings.component';

const routes: Routes = [
    {
        path: '',
        component: ModeratorsSettingsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ModeratorsSettingsRoutingModule { }