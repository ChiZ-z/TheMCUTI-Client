import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlossaryComponent } from './glossary.component';

const childRoutes: Routes = [
    {
        path: 'groups',
        loadChildren: '../glossary-groups/glossary-groups.module#GlossaryGroupsModule'
    },
    { path: '', redirectTo: 'groups', pathMatch: 'full' }    ,
    {
        path: 'settings',
        loadChildren: '../glossary-settings/glossary-settings.module#GlossarySettingsModule'
    },
    {
        path: 'followers',
        loadChildren: '../glossary-followers/glossary-followers.module#GlossaryFollowersModule'
    }
];

const routes: Routes = [
    {
        path: '',
        component: GlossaryComponent,
        children: childRoutes
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GlossaryRoutingModule { }