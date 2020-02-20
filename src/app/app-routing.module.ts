import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ErrorComponent } from './error/error.component';
import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { Constants } from './core';

const routes: Routes = [
  {
    path: 'projects',
    loadChildren: './projects/projects.module#ProjectsModule'
  },
  {
    path: 'projects/:id',
    loadChildren: './project/project.module#ProjectModule'
  },
  {
    path: 'projects/:id/langs/:langId',
    loadChildren: './project-lang/project-lang.module#ProjectLangModule'
  },
  {
    path: 'profile',
    loadChildren: './profile/profile.module#ProfileModule'
  },
  {
    path: 'profile/:username',
    loadChildren: './profile/profile.module#ProfileModule'
  },
  {
    path: 'search',
    loadChildren: './search/search.module#SearchModule'
  },
  {
    path: 'glossaries',
    loadChildren: './glossaries/glossaries.module#GlossariesModule'
  },
  {
    path: 'glossaries/:id',
    loadChildren: './glossary/glossary.module#GlossaryModule'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'registration',
    component: RegistrationComponent
  },
  { path: '', redirectTo: 'projects', pathMatch: 'full' },
  {
    path: 'not-found',
    component: ErrorComponent,
    data: { error: 404 }
  },
  {
    path: 'forbidden',
    component: ErrorComponent,
    data: { error: 403 }
  },
  {
    path: '**',
    component: ErrorComponent,
    data: { error: 404 }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
