import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageParams } from '../core/models/page-params.model';
import { UtilService, ContributorService, ProjectService, ProjectContributor, TokenService, EnumHelper, Constants, User, Project, DataService } from '../core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd';
import { Config } from 'protractor';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'tmc-project-contributors',
  templateUrl: './project-contributors.component.html',
  styleUrls: ['./project-contributors.component.css']
})
export class ProjectContributorsComponent implements OnInit, OnDestroy {

  //Contributor variables
  private contributorsList: ProjectContributor[];
  private currentProjectId: number = -1;
  private freeUsersList: User[];
  private currentUserRole: Constants;
  private enum: EnumHelper;

  //Pageable and alerts variables
  private currentPageSize: number = 0;
  private currentPage: number = 1;
  private isNoContributors: boolean = false;
  private isNothingFound: boolean = false;

  //Filter variavles
  private isRequestProcessing: boolean = false;
  private sortValue: Constants = Constants.USERNAME;
  private sortViewValue: string = 'sort.username';
  private contrPageParams: PageParams;
  private searchValue: string = '';
  private filterRoleView: string = 'show.all';
  private filterRole: Constants = null;

  //Forms
  private addContributorForm: FormGroup;
  private notifyForm: FormGroup;

  //Visible and loading variables
  private isAddModalVisible: boolean = false;
  private isNotifyAllVisible: boolean = false;
  private isNotifySelectedVisible: boolean = false;
  private isMessageSending: boolean = false;

  //Live search variables
  private searchVar = new Subject<string>();
  private liveSearchObservable$ = this.searchVar.asObservable();

  private unsubscribe: Subject<void> = new Subject();

  //Sticky config
  private config: Config[] = [];
  private deleteConfig = {
    iconName: 'trash-white',
    tooltipCode: 'label.delete.selected',
    popup: true,
    popupOk: 'delete.button',
    popupCancel: 'cancel',
    actionName: 'deleteSelected',
    iconColor: '',
    iconSize: 'medium'
  }
  private commonConfig = {
    iconName: 'notification-white',
    tooltipCode: 'label.notify.selected',
    popup: false,
    popupOk: '',
    popupCancel: '',
    actionName: 'notifySelected',
    iconColor: '',
    iconSize: 'pre-medium'
  }

  constructor(
    private utilService: UtilService,
    private activatedRoute: ActivatedRoute,
    private notification: NzNotificationService,
    private contributorService: ContributorService,
    private tokenService: TokenService,
    private projectService: ProjectService,
    private router: Router,
    private dataService: DataService
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    if (this.tokenService.validateToken()) {
      this.utilService.checkItemsPerPage('ipc');
      this.currentPageSize = +localStorage.getItem('ipc');
      this.dataService.doRefilterContributors$.pipe(takeUntil(this.unsubscribe))
        .subscribe((data: any) => {
          this.chooseFilter(-1);
        });
      this.currentProjectId = +this.activatedRoute.parent.parent.parent.snapshot.paramMap.get('id');
      this.initFilterSubscription();      
      this.activatedRoute.queryParams.subscribe((queryParam: any) => {
        queryParam['page'] ? this.currentPage = +queryParam['page'] : this.currentPage = 1;
        queryParam['search'] ? this.searchValue = queryParam['search'] : this.searchValue = '';
        this.filterProjectContributors();
      });
      this.initForms();
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  ngOnDestroy() {
    this.currentProjectId = -1;
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  filterProjectContributors() {
    this.searchVar.next(this.searchValue);
    this.router.navigateByUrl('/projects/' + this.currentProjectId + '/contributors?page=' + this.currentPage + this.getSearch());
  }

  initFilterSubscription() {
    this.liveSearchObservable$.pipe(
      debounceTime(150),
      takeUntil(this.unsubscribe),
      switchMap((value: any) => {
        this.dropBeforeFilter();
        return this.projectService.filterProjectContributors(this.currentProjectId, this.searchValue, this.filterRole, this.sortValue, this.currentPage - 1, this.currentPageSize);
      })).subscribe((data: Project) => {
        this.contributorsList = data.contributors;
        this.currentPage = data.pageParams.currentPage + 1;
        this.contrPageParams = data.pageParams;
        this.currentUserRole = data.role;
        this.createConfig();
        this.noContributorsOrNothingFound(data);
        this.emitActionToReloadProgress();
        this.isRequestProcessing = false;
      }, error => {
        this.isRequestProcessing = false;
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.contributors'));
        }
      });
  }

  dropBeforeFilter() {
    this.isRequestProcessing = true;
    this.contributorsList = [];
    this.isNoContributors = false;
    this.isNothingFound = false;
  }

  noContributorsOrNothingFound(data: Project) {
    if (data.contributors.length == 0 && (this.searchValue != '' || this.filterRole)) {
      this.isNothingFound = true;
      this.isNoContributors = false;
    } else if (data.contributors.length == 0 && this.searchValue == '') {
      this.isNothingFound = false;
      this.isNoContributors = true;
    }
    else {
      this.isNothingFound = false;
      this.isNoContributors = false;
    }
  }

  createConfig() {
    this.config = [];
    this.config.push(this.commonConfig);
    if (this.currentUserRole == Constants.AUTHOR) {
      this.config.push(this.deleteConfig);
    }
  }

  emitActionToReloadProgress() {
    this.dataService.reloadProjectInfo('true');
  }

  setSortValueAndView(value: Constants, view: string) {
    this.sortValue = value;
    this.sortViewValue = view;
    this.filterProjectContributors();
  }

  pageIndexChange(event: number) {
    this.currentPage = event;
    this.router.navigateByUrl('/projects/' + this.currentProjectId + '/contributors?page=' + this.currentPage + this.getSearch());
  }

  pageSizeChange(event: number) {
    this.currentPageSize = event;
    localStorage.setItem('ipc', '' + event);
    this.filterProjectContributors();
  }

  countSelectedContributors() {
    let count = 0;
    this.contributorsList.forEach(a => {
      if (a.selected) {
        count++;
      }
    });
    return count;
  }

  selectNone() {
    this.contributorsList.forEach(a => {
      a.selected = false;
    });
  }

  selectAll() {
    this.contributorsList.forEach(a => {
      a.selected = true;
    });
  }

  initForms() {
    this.addContributorForm = new FormGroup({
      'username': new FormControl(null, Validators.required),
      'role': new FormControl(null, Validators.required)
    });
    this.addContributorForm.get('username').valueChanges.subscribe((data: any) => {
      let username: string = this.addContributorForm.get('username').value;
      username = username ? username.trim() : '';
      if (username && username.length > 1) {
        this.projectService.getFreeContributors(this.currentProjectId, username).subscribe((data: User[]) => {
          this.freeUsersList = data;
        });
      }
      else {
        this.freeUsersList = [];
      }
    });
    this.initNotifyAllForm();
  }

  showAddContributorModal() {
    this.freeUsersList = [];
    this.addContributorForm.reset();
    this.isAddModalVisible = true;
  }

  handleAddModalCancel() {
    this.isAddModalVisible = false;
  }

  handleAddModalOk() {
    this.trimContributor();
    for (const i in this.addContributorForm.controls) {
      this.addContributorForm.controls[i].markAsDirty();
      this.addContributorForm.controls[i].updateValueAndValidity();
    }
    if (this.addContributorForm.valid) {
      const username: string = this.addContributorForm.get('username').value;
      const role: Constants = this.addContributorForm.get('role').value;
      this.contributorService.addContributorToProject(this.currentProjectId, username, role).subscribe((data: any) => {
        this.chooseFilter(1);
        this.isAddModalVisible = false;
      }, error => {
        this.tokenService.checkErrorWithout404(error.status);
        if (this.tokenService.validateToken()) {
          if (error.status == 400) {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.contributor.exists'));
          } else if (error.status == 423) {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.add.author'));
          } else if (error.status == 404) {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.user.not.found'));
          } else {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.add.contributor'));
          }
        }
      });
    }
  }

  trimContributor() {
    let username: string = this.addContributorForm.get('username').value;
    const role: Constants = this.addContributorForm.get('role').value;
    this.addContributorForm.setValue({
      'username': username ? username.trim() : '',
      'role': role
    });
  }

  trimNotification() {
    let msg: string = this.notifyForm.get('message').value;
    this.notifyForm.setValue({
      'message': msg && msg.trim() ? msg : ''
    });
  }

  chooseFilter(diff: number) {
    const pg = Math.ceil((this.contrPageParams.size + diff) / this.currentPageSize);
    if (pg <= this.currentPage) {
      this.filterProjectContributors();
    } else {
      this.router.navigateByUrl('/projects/' + this.currentProjectId + '/contributors?page=' + pg);
    }
  }


  chooseAction(event: string) {
    switch (event) {
      case 'selectNone': {
        this.selectNone(); break;
      }
      case 'selectAll': {
        this.selectAll(); break;
      }
      case 'notifySelected': {
        this.showSelectedNotificationModal(); break;
      }
      case 'deleteSelected': {
        this.deleteSelected(); break;
      }
    }
  }

  deleteSelected() {
    this.contributorService.deleteSelectedContributorsFromProject(this.contributorsList)
      .subscribe((data: any) => {
        let count: number = 0;
        this.contributorsList.forEach(a => {
          if (a.selected) {
            count++;
          }
        });
        this.chooseFilter(count);
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.delete.selected.contributors'));
        }
      });
  }

  showAllNotificationModal() {
    this.notifyForm.reset();
    this.isNotifyAllVisible = true;
  }

  initNotifyAllForm() {
    this.notifyForm = new FormGroup({
      'message': new FormControl(null,
        Validators.required)
    });
  }

  handleNotifyAllModalOk() {
    this.trimNotification();
    for (const i in this.notifyForm.controls) {
      this.notifyForm.controls[i].markAsDirty();
      this.notifyForm.controls[i].updateValueAndValidity();
    }
    if (this.notifyForm.valid) {
      const message: string = this.notifyForm.get('message').value;
      this.isMessageSending = true;
      this.contributorService.notifyAll(this.currentProjectId, message).subscribe((data: any) => {
        this.isNotifyAllVisible = false;
        this.isMessageSending = false;
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('info.notification.sent'), '');
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.notify.contributors'));
        }
      });
    }
  }

  handleNotifyAllModalCancel() {
    this.isNotifyAllVisible = false;
  }

  showSelectedNotificationModal() {
    this.notifyForm.reset();
    this.isNotifySelectedVisible = true;
  }

  handleNotifySelectedModalOk() {
    this.trimNotification();
    for (const i in this.notifyForm.controls) {
      this.notifyForm.controls[i].markAsDirty();
      this.notifyForm.controls[i].updateValueAndValidity();
    }
    if (this.notifyForm.valid) {
      const message: string = this.notifyForm.get('message').value;
      this.isMessageSending = true;
      this.contributorService.notifySelected(this.currentProjectId, this.contributorsList, message).subscribe((data: any) => {
        this.isNotifySelectedVisible = false;
        this.isMessageSending = false;
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('info.notification.sent'), '');
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.notify.contributors'));
        }
      });
    }
  }

  handleNotifySelectedModalCancel() {
    this.isNotifySelectedVisible = false;
  }

  getSearch() {
    return this.searchValue != '' ? '&search=' + this.searchValue : '';
  }

  setFilterRole(role: Constants, view: string){
    this.filterRoleView = view;
    this.filterRole = role;
    this.filterProjectContributors();
  }
}
