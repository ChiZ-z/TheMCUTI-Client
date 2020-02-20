import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Glossary, TokenService, UtilService, GlossaryService, DataService, Constants, EnumHelper, Group, Lang, ProjectService, GlossaryInfo } from '../core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'tmc-glossary',
  templateUrl: './glossary.component.html',
  styleUrls: ['./glossary.component.css']
})
export class GlossaryComponent implements OnInit, OnDestroy {

  private currentGlossaryId: number = -1;
  private glossaryInfo: GlossaryInfo;
  private currentTabIndex: number = 0;
  private currentUserRole: Constants;
  private enum: EnumHelper;

  private loadChildRoutes: boolean = false;
  private code: string = '';

  private unsubscribe: Subject<void> = new Subject();
  private isUnsubscribeModalVisible: boolean = false;

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private dataService: DataService,
    private glossaryService: GlossaryService,
    private utilService: UtilService,
    private notification: NzNotificationService,
    private activatedRoute: ActivatedRoute
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    if (this.tokenService.validateToken()) {
      this.activatedRoute.queryParams.subscribe((queryParam: any) => {
        if (queryParam['activate']) {
          this.loadChildRoutes = false;
          this.activate(queryParam['activate']);
        } else {
          this.loadChildRoutes = true;
        }
      });
      this.activatedRoute.params.pipe(takeUntil(this.unsubscribe))
        .subscribe((data: any) => this.currentGlossaryId = data['id']);
      this.dataService.doReloadGlossaryInfo$.pipe(takeUntil(this.unsubscribe))
        .subscribe((data: any) => {
          this.getInfo();
        });
      if (this.loadChildRoutes) {
        this.getInfo();
      }
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getInfo() {
    this.glossaryService.getGlossaryInfo(this.currentGlossaryId).subscribe((data: GlossaryInfo) => {
      this.glossaryInfo = data;
      this.currentUserRole = data.followerRole;
      this.checkTabIndex();
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.glossary.info'));
      }
    });
  }

  getCountTitle(type: string, value: number) {
    return 'label.' + type + '.count.' + this.utilService.getCountTitleSufix(value ? value : 0);
  }

  activateRouterLink(link: string, isPageAdding: boolean) {
    this.router.navigateByUrl('/glossaries/' + this.currentGlossaryId + '/' + link + (isPageAdding ? '?page=1' : ''));
  }

  checkTabIndex() {
    if (this.router.url.includes('/groups')) {
      this.currentTabIndex = 0;
    } else if (this.router.url.includes('/followers')) {
      this.currentTabIndex = 1;
    } else if (this.router.url.includes('/settings')) {
      this.currentTabIndex = 2;
    }
  }

  activate(code: string) {
    this.glossaryService.activateModerator(code).subscribe(() => {
      this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('label.moderator.has.been.activated'), '');
      this.getInfo();
      this.loadChildRoutes = true;
    }, error => {
      this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.activate.moderator'));
      this.getInfo();
      this.loadChildRoutes = true;
    });
  }

  showUnsubscribeModal() {
    this.isUnsubscribeModalVisible = true;
  }

  closeUnsubscribeModal() {
    this.isUnsubscribeModalVisible = false;
  }

  unsubscribeAction() {
    this.isUnsubscribeModalVisible = false;
    this.glossaryService.unsubsribe(this.currentGlossaryId).subscribe((data: Glossary) => {
      this.currentUserRole = data.followerRole;
      this.glossaryInfo.followersCount = data.followersCount;
      if (this.glossaryInfo.glossaryType == Constants.PUBLIC) {
        this.router.navigateByUrl('/glossaries/' + this.currentGlossaryId + '/groups?page=1');
      } else {
        this.router.navigateByUrl('/glossaries');
      }
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.unsubscribe'));
      }
    });
  }

  subscribe() {
    this.glossaryService.subsribe(this.currentGlossaryId).subscribe((data: Glossary) => {
      this.currentUserRole = data.followerRole;
      this.glossaryInfo.followersCount = data.followersCount;
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.subscribe'));
      }
    });
  }

}
