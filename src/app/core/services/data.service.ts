import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class DataService {

  private emitReloadUser = new Subject<any>();
  private emitProjectBarReload = new Subject<any>();
  private emitProjectLangsRefilter = new Subject<any>();
  private emitProjectTermsRefilter = new Subject<any>();
  private emitContributorsRefilter = new Subject<any>();
  private emitLangProgress = new Subject<any>();
  private emitReloadInfo = new Subject<any>();
  private emitReloadProfile = new Subject<any>();
  private emitRemakeChart = new Subject<any>();
  private emitReloadGlossariesInfo = new Subject<any>();
  private emitReloadGlossaryInfo = new Subject<any>();
  private emitReloadGlossaryGroups = new Subject<any>();
  private emitReloadSettings = new Subject<any>();

  constructor() { }

  reloadUser$ = this.emitReloadUser.asObservable();

  reloadUserForHeader(change: any) {
    this.emitReloadUser.next(change);
  }

  doReloadProjectInfo$ = this.emitProjectBarReload.asObservable();

  reloadProjectInfo(change: any) {
    this.emitProjectBarReload.next(change);
  }

  doRefilterProjectLangs$ = this.emitProjectLangsRefilter.asObservable();

  refilterProjectLangs(change: any) {
    this.emitProjectLangsRefilter.next(change);
  }

  doRefilterProjectTerms$ = this.emitProjectTermsRefilter.asObservable();

  refilterProjectTerms(change: any) {
    this.emitProjectTermsRefilter.next(change);
  }

  doRefilterContributors$ = this.emitContributorsRefilter.asObservable();

  refilterContributors(change: any) {
    this.emitContributorsRefilter.next(change);
  }

  doReloadLangProgress$ = this.emitLangProgress.asObservable();

  reloadLangProgress(change: any) {
    this.emitLangProgress.next(change);
  }

  doReloadProfile$ = this.emitReloadProfile.asObservable();

  reloadProfile(change: any) {
    this.emitReloadProfile.next(change);
  }

  doReloadInfo$ = this.emitReloadInfo.asObservable();

  reloadInfo(change: any) {
    this.emitReloadInfo.next(change);
  }

  doRemakeChart$ = this.emitRemakeChart.asObservable();

  remakeChart(change: any) {
    this.emitRemakeChart.next(change);
  }

  doReloadGlossariesInfo$ = this.emitReloadGlossariesInfo.asObservable();

  reloadGlossariesInfo(change: any) {
    this.emitReloadGlossariesInfo.next(change);
  }

  doReloadGlossaryInfo$ = this.emitReloadGlossaryInfo.asObservable();

  reloadGlossaryInfo(change: any) {
    this.emitReloadGlossaryInfo.next(change);
  }

  doReloadGlossaryGroups$ = this.emitReloadGlossaryGroups.asObservable();

  reloadGlossaryGroups(change: any) {
    this.emitReloadGlossaryGroups.next(change);
  }

  doReloadSettings$ = this.emitReloadSettings.asObservable();

  reloadSettings(change: any) {
    this.emitReloadSettings.next(change);
  }
}
