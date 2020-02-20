import { Component, OnInit, OnDestroy } from '@angular/core';
import { TokenService, UserService, UtilService, User, ChartItem, Constants, EnumHelper, DataService, Project, ProjectService, Timings } from 'src/app/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { ChartService } from 'src/app/core/services/chart.service';
import { Chart } from 'angular-highcharts';
import { DatePipe } from '@angular/common';
import { DateChangerPipe } from 'src/app/shared/pipes';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'tmc-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit, OnDestroy {

  //User variables
  private username: string = '';
  private user: User;

  private projectsList: Project[];

  //Chart inatanse and additional variables
  private chartItem: ChartItem;
  private showValue: Constants = Constants.SUMMARY;
  private dateType: Constants = Constants.WEEK;
  private showView: string = 'summary.stats';
  private dateView: string = 'seven.days'
  private projectView: string = 'label.all.projects';
  private startDate: Date;
  private endDate: Date;
  private chart;
  private date: Date[];
  private registrationDate: Date;

  private projectId: number = -1;

  private unsubscribe: Subject<void> = new Subject();

  //Support variable  
  private enum: EnumHelper;
  private showDatePicker: boolean = false;

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private router: Router,
    private notification: NzNotificationService,
    private route: ActivatedRoute,
    private utilService: UtilService,
    private dateChanger: DateChangerPipe,
    private chartService: ChartService,
    private dataService: DataService,
    private projectService: ProjectService
  ) {
    this.enum = new EnumHelper();
    this.projectsList = [];
    this.date = [];
  }

  ngOnInit() {
    if (this.tokenService.validateToken()) {
      this.username = this.route.parent.parent.parent.snapshot.paramMap.get('username');
      if (this.username != '' && this.username) {
        this.getUserByUsername();
        if (this.username === this.tokenService.getUserName()) {
          this.getStats();
        }
      } else {
        this.getUser();
        this.getStats();
        this.getAllUserProjects();
      }
      this.getRegistrationDate();
    } else {
      this.router.navigateByUrl('/login');
    }
    this.dataService.doRemakeChart$.pipe(takeUntil(this.unsubscribe)).subscribe((data: any) => {
      this.chooseType();
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getUser() {
    this.user = new User();
    this.userService.getUser().subscribe((data: User) => {
      this.user = data;
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.user'));
      }
    });
  }

  getUserByUsername() {
    this.user = new User();
    this.userService.getUserByUsername(this.username).subscribe((data: User) => {
      this.user = data;
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.user'));
      }
    });
  }

  getRegistrationDate() {
    this.userService.getRegistrationDate().subscribe((data: string) => {
      this.registrationDate = new Date(data);
    }, error => {
      this.tokenService.checkErrorAll(error.status);
    });
  }

  emitReloadProfile() {
    this.dataService.reloadProfile('true');
  }

  getProjectsCountTitle() {
    return 'label.projects.count.' + this.utilService.getCountTitleSufix(this.user.resultStat.projectsCount);
  }

  isCurrentUserProfile(): boolean {
    return +this.tokenService.getUserId() == this.user.id;
  }

  disabledEndDate = (endValue: Date): boolean => {
    if (!endValue) {
      return false;
    }
    return endValue.getTime() >= new Date().getTime() || (this.registrationDate ? endValue.getTime() <= this.registrationDate.getTime() : false);
  };

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

  chooseView(value: Constants, view: string) {
    this.showView = view;
    this.showValue = value;
    this.getStats();
  }

  setProjectId(id: number, project: Project) {
    this.projectId = id;
    this.projectView = id == -1 ? 'label.all.projects' : this.getProjectFullName(project);
    this.getStats();
  }

  getProjectFullName(project: Project) {
    return project.projectName.length > 35 ? project.projectName.slice(0, 35) : project.projectName;
  }

  chooseType() {
    this.emitReloadProfile();
    if (this.showValue === Constants.SUMMARY) this.createSummaryChart();
    if (this.showValue === Constants.ALL) this.createAllChart();
    if (this.showValue === Constants.EDIT) this.createEditedChart();
    if (this.showValue === Constants.TRANSLATE) this.createTranslatedChart();
    if (this.showValue === Constants.AUTO_TRANSLATE) this.createAutoTranslatedChart();
    if (this.showValue === Constants.EDIT_BY_IMPORT) this.createEditedByImportStats();
    if (this.showValue === Constants.TRANSLATE_BY_IMPORT) this.createTranslatedByImportChart();
  }

  prepareFilters(dateType: Constants, view: string) {
    this.dateType = dateType;
    this.dateView = view;
    this.showDatePicker = false;
    this.date = [];
    this.getStats()
  }

  getStats() {
    this.setDatesByPeriod();
    const start: Date = this.dateChanger.transform(this.date[0]);
    const end: Date = this.dateChanger.transform(this.date[1]);
    this.chartService.getStats(this.projectId, +this.tokenService.getUserId(), start, end, this.showValue).subscribe((data: ChartItem) => {
      this.chartItem = data;
      this.chooseType();
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.chart'));
      }
    });
  }

  setDatesByPeriod() {
    switch (this.dateType) {
      case Constants.WEEK: {
        const start: Date = new Date(new Date().getTime() - (6 * Timings.DAY_TIME));
        this.date = [start, new Date()];
        break;
      }
      case Constants.MONTH: {
        const start: Date = new Date(new Date().getTime() - (29 * Timings.DAY_TIME));
        this.date = [start, new Date()];
        break;
      }
      case Constants.FULL_STATS: {
        this.date = [this.registrationDate, new Date()];
        break;
    }
    }
  }

  chooseArbitraryPeriod() {
    this.dateView = 'label.arbitrary.period';
    this.date = [];
    this.dateType = Constants.PERIOD;
  }

  handMadePeriod() {
    this.dateType = Constants.PERIOD;
    this.dateView = 'label.arbitrary.period';
    this.getStats();
  }

  createAllChart() {
    this.chart = new Chart({
      chart: {
        type: 'line'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: this.chartItem.nodes,
        labels: {
          style: {
            color: 'rgb(170, 159, 169);'
          }
        }
      },
      yAxis: [{
        title: {
          text: ''
        },
        labels: {
          style: {
            color: 'rgb(170, 159, 169);'
          }
        }
      }],
      credits: {
        enabled: false
      },
      series: [{
        showInLegend: true,
        visible: true,
        name: this.utilService.getTranslation('translated'),
        data: this.chartItem.translatedStats,
        type: undefined
      },
      {
        showInLegend: true,
        visible: true,
        name: this.utilService.getTranslation('auto.translated'),
        data: this.chartItem.autoTranslatedStats,
        type: undefined
      },
      {
        showInLegend: true,
        visible: true,
        name: this.utilService.getTranslation('edited'),
        data: this.chartItem.editedStats,
        type: undefined
      },
      {
        showInLegend: true,
        visible: true,
        name: this.utilService.getTranslation('edited.by.import'),
        data: this.chartItem.editedByImportStats,
        type: undefined
      },
      {
        showInLegend: true,
        visible: true,
        name: this.utilService.getTranslation('translated.by.import'),
        data: this.chartItem.translatedByImportStats,
        type: undefined
      }]
    });
  }

  createTranslatedChart() {
    this.chart = new Chart({
      chart: {
        type: 'line'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: this.chartItem.nodes,
        labels: {
          style: {
            color: 'rgb(170, 159, 169);'
          }
        }
      },
      yAxis: [{
        title: {
          text: ''
        },
        labels: {
          style: {
            color: 'rgb(170, 159, 169);'
          }
        }
      }],
      credits: {
        enabled: false
      },
      series: [{
        showInLegend: false,
        visible: true,
        name: this.utilService.getTranslation('translated'),
        data: this.chartItem.translatedStats,
        type: undefined
      }]
    });
  }

  createAutoTranslatedChart() {
    this.chart = new Chart({
      chart: {
        type: 'line'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: this.chartItem.nodes,
        labels: {
          style: {
            color: 'rgb(170, 159, 169);'
          }
        }
      },
      yAxis: [{
        title: {
          text: ''
        },
        labels: {
          style: {
            color: 'rgb(170, 159, 169);'
          }
        }
      }],
      credits: {
        enabled: false
      },
      series: [{
        showInLegend: false,
        visible: true,
        name: this.utilService.getTranslation('auto.translated'),
        data: this.chartItem.autoTranslatedStats,
        type: undefined
      }]
    });
  }

  createEditedChart() {
    this.chart = new Chart({
      chart: {
        type: 'line'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: this.chartItem.nodes,
        labels: {
          style: {
            color: 'rgb(170, 159, 169);'
          }
        }
      },
      yAxis: [{
        title: {
          text: ''
        },
        labels: {
          style: {
            color: 'rgb(170, 159, 169);'
          }
        }
      }],
      credits: {
        enabled: false
      },
      series: [{
        showInLegend: false,
        visible: true,
        name: this.utilService.getTranslation('edited'),
        data: this.chartItem.editedStats,
        type: undefined
      }]
    });
  }

  createTranslatedByImportChart() {
    this.chart = new Chart({
      chart: {
        type: 'line'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: this.chartItem.nodes,
        labels: {
          style: {
            color: 'rgb(170, 159, 169);'
          }
        }
      },
      yAxis: [{
        title: {
          text: ''
        },
        labels: {
          style: {
            color: 'rgb(170, 159, 169);'
          }
        }
      }],
      credits: {
        enabled: false
      },
      series: [{
        showInLegend: false,
        visible: true,
        name: this.utilService.getTranslation('translated.by.import'),
        data: this.chartItem.translatedByImportStats,
        type: undefined
      }]
    });
  }

  createEditedByImportStats() {
    this.chart = new Chart({
      chart: {
        type: 'line'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: this.chartItem.nodes,
        labels: {
          style: {
            color: 'rgb(170, 159, 169);'
          }
        }
      },
      yAxis: [{
        title: {
          text: ''
        },
        labels: {
          style: {
            color: 'rgb(170, 159, 169);'
          }
        }
      }],
      credits: {
        enabled: false
      },
      series: [{
        showInLegend: false,
        visible: true,
        name: this.utilService.getTranslation('edited.by.import'),
        data: this.chartItem.editedByImportStats,
        type: undefined
      }]
    });
  }

  createSummaryChart() {
    this.chart = new Chart({
      chart: {
        type: 'line'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: this.chartItem.nodes,
        labels: {
          style: {
            color: 'rgb(170, 159, 169);'
          }
        }
      },
      yAxis: [{
        title: {
          text: ''
        },
        labels: {
          style: {
            color: 'rgb(170, 159, 169);'
          }
        }
      }],
      credits: {
        enabled: false
      },
      series: [{
        showInLegend: false,
        visible: true,
        name: this.utilService.getTranslation('summary.stats'),
        data: this.chartItem.summaryStats,
        type: undefined
      }]
    });
  }

}
