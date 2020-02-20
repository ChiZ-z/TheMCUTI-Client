import { Component, OnInit } from '@angular/core';
import { User, Constants, EnumHelper, HistoryService, UtilService, TokenService, DataService, ResultHistory, History, ProjectService, Project, UserService, Timings } from 'src/app/core';
import { PageParams } from 'src/app/core/models/page-params.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { DateChangerPipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  //History support variables
  private historyList: History[];
  private projectsList: Project[];
  private singleActionList: Constants[];
  private allActionsList: Constants[];
  private tempAllActionsList: Constants[];
  private actionsListToFilter: Constants[];
  private dateType: Constants = Constants.WEEK;
  private dates: Date[];
  private periodView: string = 'seven.days';
  private projectView: string = 'label.all.projects';
  private actionsView: string = 'show.all.actions'

  private projectId: number = -1;
  private enum: EnumHelper;

  //Page variables
  private currentPage: number = 1;
  private currentPageSize: number = 10;
  private pageParams: PageParams;

  //Visibility variables
  private showDatePicker: boolean = false;
  private isRequestProcessing: boolean = false;
  private disableSelection: string = 'disable';
  
  private registrationDate: Date;

  constructor(
    private historyService: HistoryService,
    private utilService: UtilService,
    private activatedRoute: ActivatedRoute,
    private notification: NzNotificationService,
    private tokenService: TokenService,
    private router: Router,
    private projectService: ProjectService,
    private dateChanger: DateChangerPipe,
    private dataService: DataService,
    private userService: UserService
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
      this.utilService.checkItemsPerPage('iuh');
      this.currentPageSize = +localStorage.getItem('iuh');
      this.dates = [];
      if (localStorage.getItem('uharr') && this.validateConstArray()) {
        let arr: string[] = atob(localStorage.getItem('uharr')).split(',');
        this.allActionsList = [];
        arr.forEach((a: Constants) => {
          this.allActionsList.push(a);
        });
      }
      this.activatedRoute.queryParams.subscribe((queryParam: any) => {
        queryParam['page'] ? this.currentPage = +queryParam['page'] : this.currentPage = 1;
        this.getHistory();
      });
      this.getAllUserProjects();
      this.getRegistrationDate();
      this.historyList = [];
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  ngOnDestroy() {
    this.projectId = -1;
  }

  getRegistrationDate() {
    this.userService.getRegistrationDate().subscribe((data: string) => {
      this.registrationDate = new Date(data);
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
    this.historyService.getUserHistory(this.actionsListToFilter, start, end, this.projectId, this.currentPage - 1, this.currentPageSize)
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
        this.dates = [this.registrationDate, new Date()];
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


  getAllUserProjects() {
    this.projectService.getAllUserProjects().subscribe((data: Project[]) => {
      this.projectsList = data;
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.user.projects'));
      }
    });
  }

  disabledEndDate = (endValue: Date): boolean => {
    if (!endValue) {
      return false;
    }
    return endValue.getTime() >= new Date().getTime() || (this.registrationDate ? endValue.getTime() <= this.registrationDate.getTime() : false);
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
    this.getHistory();
  }

  checkSelected(action: Constants): boolean {
    return this.allActionsList.indexOf(action) != -1;
  }

  setProjectId(id: number, project: Project) {
    this.projectId = id;
    this.projectView = id == -1 ? 'label.all.projects' : this.getProjectFullName(project);
    this.getHistory();
  }

  pageIndexChange(event: number) {
    this.currentPage = event;
    this.router.navigateByUrl('/profile/history?page=' + this.currentPage);
  }

  pageSizeChange(event: number) {
    this.currentPageSize = event;
    localStorage.setItem('iuh', '' + event);
    this.getHistory();
  }

  getAuthorIndification(id: number) {
    return +this.tokenService.getUserId() == id ? '(' + this.utilService.getTranslation('label.you') + ')' : '';
  }

  getProjectFullName(project: Project) {
    return project.projectName.length > 35 ? project.projectName.slice(0, 35) : project.projectName;
  }

  validateConstArray() {
    try {
      let arr: string[] = atob(localStorage.getItem('uharr')).split(',');
      arr.forEach(a => {
        if (Object.values(Constants).indexOf(a) == -1) {
          localStorage.removeItem('uharr');
          return false;
        }
      });
      return true;
    } catch (error) {
      localStorage.removeItem('uharr');
      return false;
    }
  }

}
