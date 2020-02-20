import { Component, OnInit, OnDestroy } from '@angular/core';
import { UtilService, TokenService, DataService, Constants, User, EnumHelper, ContributorService, ResultStat, ProjectService, ChartItem, ChartService, Timings } from '../core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { PageParams } from '../core/models/page-params.model';
import { DateChangerPipe } from '../shared/pipes';
import { Chart } from 'angular-highcharts';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'tmc-project-statistics',
    templateUrl: './project-statistics.component.html',
    styleUrls: ['./project-statistics.component.css']
})
export class ProjectStatisticsComponent implements OnInit, OnDestroy {

    private currentProjectId: number = -1;
    private projectStats: ResultStat;
    private contributorsList: User[];

    private chartItem: ChartItem;

    private showValue: Constants = Constants.SUMMARY;
    private dateType: Constants = Constants.WEEK;
    private showView: string = 'summary.stats';
    private periodView: string = 'seven.days';
    private userView: string = 'label.all.users';

    private contributorId: number = -1;
    private enum: EnumHelper;

    private unsubscribe: Subject<void> = new Subject();

    private startDate: Date;
    private endDate: Date;
    private chart: any;
    private date: Date[];
    private creationDate: Date;

    constructor(
        private projectService: ProjectService,
        private tokenService: TokenService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private contributorService: ContributorService,
        private notification: NzNotificationService,
        private dateChanger: DateChangerPipe,
        private utilService: UtilService,
        private chartService: ChartService,
        private dataService: DataService
    ) {
        this.enum = new EnumHelper();
        this.date = [];
    }

    ngOnInit() {
        if (this.tokenService.validateToken()) {
            this.currentProjectId = +this.activatedRoute.parent.parent.parent.snapshot.paramMap.get('id');
            this.getAllProjectUsers();
            this.getStats();
            this.getCreationDate();
            this.emitActionToReloadProgress();
            this.dataService.doRemakeChart$.pipe(takeUntil(this.unsubscribe)).subscribe((data: any) => {
                this.chooseType();
            });
        } else {
            this.router.navigateByUrl('/login');
        }
    }

    emitActionToReloadProgress() {
        this.dataService.reloadProjectInfo('true');
    }

    ngOnDestroy() {
        // this.currentProjectId = -1;
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    getCreationDate() {
        this.projectService.getCreationDate(this.currentProjectId).subscribe((data: string) => {
            this.creationDate = new Date(data);
        }, error => {
            this.tokenService.checkErrorAll(error.status);
        });
    }

    getProjectStats() {
        this.projectService.getProjectStats(this.currentProjectId).subscribe((data: ResultStat) => {
            this.projectStats = data;
        }, error => {
            this.tokenService.checkErrorAll(error.status);
            if (this.tokenService.validateToken()) {
                this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.project.stats'));
            }
        });
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

    getAuthorIndification(id: number) {
        return +this.tokenService.getUserId() == id ? '(' + this.utilService.getTranslation('label.you') + ')' : '';
    }

    chooseView(value: Constants, view: string) {
        this.showView = view;
        this.showValue = value;
        this.getStats();
    }

    setUserId(id: number, user: User) {
        this.contributorId = id;
        this.userView = id == -1 ? 'label.all.users' : this.getcontributorFullName(user);
        this.getStats();
    }

    disabledEndDate = (endValue: Date): boolean => {
        if (!endValue) {
            return false;
        }
        return endValue.getTime() >= new Date().getTime() || (this.creationDate ? endValue.getTime() <= this.creationDate.getTime() : false);
    };

    getcontributorFullName(user: User) {
        let fullName: string = user.firstName + ' ' + user.lastName;
        if (fullName.length > 29 - user.username.length - 3) {
            return fullName.slice(0, 29 - user.username.length - 3) + '... (' + user.username + ')';
        }
        return fullName + ' (' + user.username + ')';
    }

    chooseType() {
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
        this.periodView = view;
        this.getStats()
    }

    getStats() {
        this.getProjectStats();
        this.setDatesByPeriod();
        const start: Date = this.dateChanger.transform(this.date[0]);
        const end: Date = this.dateChanger.transform(this.date[1]);
        this.chartService.getStats(this.currentProjectId, this.contributorId, start, end, this.showValue).subscribe((data: ChartItem) => {
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
                this.date = [this.creationDate, new Date()];
                break;
            }
        }
    }

    chooseArbitraryPeriod() {
        this.periodView = 'label.arbitrary.period';
        this.date = [];
        this.dateType = Constants.PERIOD;
    }

    handMadePeriod() {
        this.dateType = Constants.PERIOD;
        this.periodView = 'label.arbitrary.period';
        this.getStats();
    }

    createAllChart() {
        this.chart = new Chart({
            chart: {
                renderTo: "largeincomingOrders", type: 'line'
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
                renderTo: "largeincomingOrders", type: 'line'
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
                renderTo: "largeincomingOrders", type: 'line'
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
                renderTo: "largeincomingOrders", type: 'line'
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
                renderTo: "largeincomingOrders", type: 'line'
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
                renderTo: "largeincomingOrders", type: 'line'
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
                renderTo: "largeincomingOrders", type: 'line'
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