import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlossarySettingsComponent } from './glossary-settings.component';

const childRoutes: Routes = [
    {
        path: 'main',
        loadChildren: './main-settings/main-settings.module#MainSettingsModule'
    },
    { path: '', redirectTo: 'main', pathMatch: 'full' },
    {
        path: 'moderators',
        loadChildren: './moderators-settings/moderators-settings.module#ModeratorsSettingsModule'
    },
    {
        path: 'assignment',
        loadChildren: './assignment-settings/assignment-settings.module#AssignmentSettingsModule'
    }
];

const routes: Routes = [
    {
        path: '',
        component: GlossarySettingsComponent,
        children: childRoutes
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GlossarySettingsRoutingModule { }