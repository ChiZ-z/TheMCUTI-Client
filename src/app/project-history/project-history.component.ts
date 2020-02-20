import { Component, OnInit, OnDestroy } from '@angular/core';
import { HistoryService, UtilService, TokenService, DataService, Constants, History, ResultHistory, User, EnumHelper, ContributorService, ProjectService, Timings } from '../core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { PageParams } from '../core/models/page-params.model';
import { DateChangerPipe } from '../shared/pipes';

@Component({
  selector: 'app-project-history',
  templateUrl: './project-history.component.html',
  styleUrls: ['./project-history.component.css']
})
export class ProjectHistoryComponent implements OnInit, OnDestroy {

  //History support variables
  private historyList: History[];
  private contributorsList: User[];
  private singleActionList: Constants[];
  private allActionsList: Constants[];
  private tempAllActionsList: Constants[];
  private actionsListToFilter: Constants[];
  private dateType: Constants = Constants.WEEK;
  private dates: Date[];
  private periodView: string = 'seven.days';
  private userView: string = 'label.all.users';
  private actionsView: string = 'show.all.actions'

  private currentProjectId: number = -1;
  private contributorId: number = -1;
  private enum: EnumHelper;

  //Page variables
  private currentPage: number = 1;
  private currentPageSize: number = 10;
  private pageParams: PageParams;

  //Visibility variables
  private showDatePicker: boolean = false;
  private isRequestProcessing: boolean = false;
  private disableSelection: string = 'disable';

  private creationDate: Date;

  constructor(
    private historyService: HistoryService,
    private utilService: UtilService,
    private activatedRoute: ActivatedRoute,
    private notification: NzNotificationService,
    private tokenService: TokenService,
    private router: Router,
    private contributorService: ContributorService,
    private dateChanger: DateChangerPipe,
    private dataService: DataService,
    private projectService: ProjectService
  ) {
    this.singleActionList = [Constants.ALL];
    this.allActionsList = [
      Constants.EDIT,
      Constants.TRANSLATE,
      Constants.AUTO_TRANSLATE,
      Constants.ADD_PROJECT,
      Constants.DELETE_PROJECT,
      Constants.ADD_PROJECT_LANG,
      Constants.DELETE_PROJECT_LANG,
      Constants.ADD_TERM,
      Constants.EDIT_TERM,
      Constants.DELETE_TERM,
      Constants.ADD_CONTRIBUTOR,
      Constants.DELETE_CONTRIBUTOR,
      Constants.FLUSH_PROJECT_LANG,
      Constants.FLUSH_PROJECT,
      Constants.IMPORT_TERMS,
      Constants.IMPORT_TRANSLATIONS
    ];
    this.actionsListToFilter = this.singleActionList;
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    if (this.tokenService.validateToken()) {
      this.tempAllActionsList = Object.assign([], this.allActionsList);
      this.currentProjectId = +this.activatedRoute.parent.parent.parent.snapshot.paramMap.get('id');
      this.utilService.checkItemsPerPage('iph');
      this.currentPageSize = +localStorage.getItem('iph');
      this.dates = [];
      if (localStorage.getItem('pharr') && this.validateConstArray()) {
        let arr: string[] = atob(localStorage.getItem('pharr')).split(',');
        this.allActionsList = [];
        arr.forEach((a: Constants) => {
          this.allActionsList.push(a);
        });
      }
      this.activatedRoute.queryParams.subscribe((queryParam: any) => {
        queryParam['page'] ? this.currentPage = +queryParam['page'] : this.currentPage = 1;
        this.getHistory();
      });
      this.emitActionToReloadProgress();
      this.getAllProjectUsers();
      this.getCreationDate();
      this.historyList = [];
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  ngOnDestroy() {
    this.currentProjectId = -1;
  }

  
  emitActionToReloadProgress() {
    this.dataService.reloadProjectInfo('true');
  }

  getCreationDate() {
    this.projectService.getCreationDate(this.currentProjectId).subscribe((data: string) => {
      this.creationDate = new Date(data);
    }, error => {
      this.tokenService.checkErrorAll(error.status);
    });
  }

  prepareFilters(dateType: Constants, view: string) {
    this.dateType = dateType;
    this.periodView = view;
    this.showDatePicker = false;
    this.dates = [];
    this.getHistory()
  }

  getHistory() {
    this.historyList = [];
    this.isRequestProcessing = true;
    this.setDatesByPeriod();
    const start: Date = this.dateChanger.transform(this.dates[0]);
    const end: Date = this.dateChanger.transform(this.dates[1]);
    this.historyService.getProjectHistory(this.actionsListToFilter, start, end, this.currentProjectId,
      this.contributorId, this.currentPage - 1, this.currentPageSize)
      .subscribe((data: ResultHistory) => {
        this.historyList = data.historyList;
        this.isRequestProcessing = false;
        this.pageParams = data.pageParams;
        this.currentPage = data.pageParams.currentPage + 1;
      }, error => {
        this.isRequestProcessing = false;
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.history'));
        }
      });
  }

  setDatesByPeriod() {
    switch (this.dateType) {
      case Constants.WEEK: {
        const start: Date = new Date(new Date().getTime() - (6 * Timings.DAY_TIME));
        this.dates = [start, new Date()];
        break;
      }
      case Constants.MONTH: {
        const start: Date = new Date(new Date().getTime() - (29 * Timings.DAY_TIME));
        this.dates = [start, new Date()];
        break;
      }
      case Constants.ALL: {
        this.dates = [this.creationDate, new Date()];
        break;
      }
    }
  }

  chooseArbitraryPeriod() {
    this.periodView = 'label.arbitrary.period';
    this.dates = [];
    this.dateType = Constants.PERIOD;
  }

  handMadePeriod() {
    this.dateType = Constants.PERIOD;
    this.periodView = 'label.arbitrary.period';
    this.getHistory();
  }

  getAllProjectUsers() {
    this.contributorService.getAllProjectUsers(this.currentProjectId).subscribe((data: User[]) => {
      this.contributorsList = data;
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.project.participants'));
      }
    });
  }

  disabledEndDate = (endValue: Date): boolean => {
    if (!endValue) {
      return false;
    }
    return endValue.getTime() >= new Date().getTime() || (this.creationDate ? endValue.getTime() <= this.creationDate.getTime() : false);
  };

  changeActionsList(array: Constants[], refilter: boolean) {
    this.actionsListToFilter = array;
    if (refilter) {
      this.getHistory();
    }
  }

  changeActionState(action: Constants) {
    if (this.allActionsList.indexOf(action) != -1) {
      this.allActionsList.splice(this.allActionsList.indexOf(action), 1);
    } else {
      this.allActionsList.push(action);
    }

    localStorage.setItem('pharr', btoa(this.allActionsList.toString()));
    this.getHistory();
  }

  checkSelected(action: Constants): boolean {
    return this.allActionsList.indexOf(action) != -1;
  }

  setUserId(id: number, user: User) {
    this.contributorId = id;
    this.userView = id == -1 ? 'label.all.users' : this.getcontributorFullName(user);
    this.getHistory();
  }

  pageIndexChange(event: number) {
    this.currentPage = event;
    this.router.navigateByUrl('/projects/' + this.currentProjectId + '/history?page=' + this.currentPage);
  }

  pageSizeChange(event: number) {
    this.currentPageSize = event;
    localStorage.setItem('iph', '' + event);
    this.getHistory();
  }

  getAuthorIndification(id: number) {
    return +this.tokenService.getUserId() == id ? '(' + this.utilService.getTranslation('label.you') + ')' : '';
  }

  getcontributorFullName(user: User) {
    let fullName: string = user.firstName + ' ' + user.lastName;
    if (fullName.length > 29 - user.username.length - 3) {
      return fullName.slice(0, 29 - user.username.length - 3) + '... (' + user.username + ')';
    }
    return fullName + ' (' + user.username + ')';
  }

  validateConstArray() {
    try {
      let arr: string[] = atob(localStorage.getItem('pharr')).split(',');
      arr.forEach(a => {
        if (Object.values(Constants).indexOf(a) == -1) {
          localStorage.removeItem('pharr');
          return false;
        }
      });
      return true;
    } catch (error) {
      localStorage.removeItem('pharr');
      return false;
    }
  }
}
