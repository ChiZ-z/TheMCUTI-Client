import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS} from '@angular/common/http';

import {
  AuthService,
  ChartService,
  ContributorService,
  DataService,
  GlossaryService,
  HistoryService,
  ProjectLangService,
  ProjectService,
  ProjectTermService,
  SearchService,
  StatisticsService,
  TokenService,
  UserService,
} from './services';
import {HttpTokenInterceptor} from './interceptors';
import {TranslateService} from '@ngx-translate/core';
import {I18nService} from './services/i18n.service';
import {UtilService} from './services/util.service';
import {ClipboardModule} from 'ngx-clipboard';
import {IntegrationService} from "./services/integration.service";


@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    AuthService,
    ContributorService,
    ProjectLangService,
    ProjectTermService,
    ProjectService,
    SearchService,
    StatisticsService,
    TokenService,
    UserService,
    TranslateService,
    I18nService,
    UtilService,
    ChartService,
    DataService,
    HistoryService,
    GlossaryService,
    IntegrationService,
    ClipboardModule,
    {provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true}
  ],
  declarations: []
})
export class CoreModule {
}
