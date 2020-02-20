import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { UtilService, ProjectLangService, ProjectService, Lang, ProjectLang, Project, EnumHelper, Constants, TokenService, DataService } from '../core';
import { Subscription, Subject } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { I18nService } from '../core/services/i18n.service';
import { PageParams } from '../core/models/page-params.model';
import { NzNotificationService } from 'ng-zorro-antd';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-project-langs',
  templateUrl: './project-langs.component.html',
  styleUrls: ['./project-langs.component.css']
})
export class ProjectLangsComponent implements OnInit, OnDestroy {

  //Forms and modals variables
  private addProjectLangForm: FormGroup;
  private isAddProjectLangVisible: boolean;

  //Pageable and info variables
  private currentProjectId: number = -1;
  private currentPageSize: number = 0;
  private currentPage: number = 1;
  private isNothingFound: boolean = false;
  private langPageParams: PageParams;

  private langList: Lang[];

  //Filter variables
  private searchValue: string = '';
  private isRequestProcessing: boolean = false;
  private sortValue: Constants = Constants.LANGUAGENAME;
  private sortViewValue: string = 'sort.lang.name';

  //Additional variables
  private currentUserRole: Constants;
  private enum: EnumHelper;
  private routeSubscription: Subscription;
  private projectLangList: ProjectLang[];

  //Live search variables
  private searchVar = new Subject<string>();
  private liveSearchObservable$ = this.searchVar.asObservable();

  private unsubscribe: Subject<void> = new Subject();

  constructor(
    private utilService: UtilService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private langService: ProjectLangService,
    private tokenService: TokenService,
    private notification: NzNotificationService,
    private projectService: ProjectService,
    private i18nService: I18nService,
    private dataService: DataService
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    this.isAddProjectLangVisible = false;
    if (this.tokenService.validateToken()) {
      this.utilService.checkItemsPerPage('ipl');
      this.currentPageSize = +localStorage.getItem('ipl');
      this.dataService.doRefilterProjectLangs$.pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.filterLangList();
      });
      this.currentProjectId = +this.activatedRoute.parent.parent.parent.snapshot.paramMap.get('id');
      this.initFilterSubscription();
      this.initProjectLangForm();      
      this.activatedRoute.queryParams.subscribe((queryParam: any) => {
        queryParam['page'] ? this.currentPage = +queryParam['page'] : this.currentPage = 1;
        queryParam['search'] ? this.searchValue = queryParam['search'] : this.searchValue = '';
        this.filterLangList();
      });
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  ngOnDestroy() {
    this.currentProjectId = -1;
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  emitActionToReloadProgress() {
    this.dataService.reloadProjectInfo('true');
  }

  filterLangList() {
    this.searchVar.next(this.searchValue);
    this.emitActionToReloadProgress();
    this.router.navigateByUrl('/projects/' + this.currentProjectId + '/langs?page=' + this.currentPage + this.getSearch());
  }

  initFilterSubscription() {
    this.liveSearchObservable$.pipe(
      debounceTime(150),
      takeUntil(this.unsubscribe),
      switchMap((value: any) => {
        this.dropBeforeFilter();
        return this.projectService.filterProjectLangs(this.currentProjectId, this.searchValue, this.sortValue, this.currentPage - 1, this.currentPageSize);
      })).subscribe((data: Project) => {
        this.projectLangList = data.projectLangs;
        this.langPageParams = data.pageParams;
        this.currentPage = data.pageParams.currentPage + 1;
        this.currentUserRole = data.role;
        this.isRequestProcessing = false;
        this.nothingFound(data);
      }, error => {
        this.isRequestProcessing = false;
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken() && error.status != 404 && error.status != 403) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.langs'));
        }
      });
  }

  dropBeforeFilter() {
    this.isRequestProcessing = true;
    this.projectLangList = [];
    this.isNothingFound = false;
  }

  nothingFound(data: Project) {
    if (data.projectLangs.length == 0 && this.searchValue != '') {
      this.isNothingFound = true;
    } else {
      this.isNothingFound = false;
    }
  }

  setSortValueAndView(value: Constants, view: string) {
    this.sortValue = value;
    this.sortViewValue = view;
    this.filterLangList();
  }

  pageIndexChange(event: number) {
    this.currentPage = event;
    this.router.navigateByUrl('/projects/' + this.currentProjectId + '/langs?page=' + this.currentPage + this.getSearch());
  }

  pageSizeChange(event: number) {
    this.currentPageSize = event;
    localStorage.setItem('ipl', '' + event);
    this.filterLangList();
  }

  initProjectLangForm() {
    this.addProjectLangForm = new FormGroup({
      'langId': new FormControl(null, [Validators.required])
    });
  }

  showAddProjectLangModal() {
    this.addProjectLangForm.reset();
    this.projectService.getFreeLangs(this.currentProjectId).subscribe((data: Lang[]) => {
      this.langList = data;
      this.utilService.sortLangList(this.langList);
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.langs'));
      }
    });
    this.isAddProjectLangVisible = true;
  }

  handleAddProjectLangModalCancel() {
    this.isAddProjectLangVisible = false;
  }

  handleAddProjectLangModalOk() {
    for (const i in this.addProjectLangForm.controls) {
      this.addProjectLangForm.controls[i].markAsDirty();
      this.addProjectLangForm.controls[i].updateValueAndValidity();
    }
    if (this.addProjectLangForm.valid) {
      this.isRequestProcessing = true;
      this.projectService.addProjectLang(this.currentProjectId, this.addProjectLangForm.get('langId').value)
        .subscribe((data: any) => {
          const count: number = this.langPageParams.size;
          this.currentPage = Math.ceil((count + 1) / this.currentPageSize);
          this.addProjectLangForm.reset();
          this.filterLangList();
          this.isRequestProcessing = false;
        }, error => {
          this.tokenService.checkErrorAll(error.status);
          if (this.tokenService.validateToken()) {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.add.lang'));
          }
          this.isRequestProcessing = false;
        });
      this.isAddProjectLangVisible = false;
    }
  }

  getSearch() {
    return this.searchValue != '' ? '&search=' + this.searchValue : '';
  }
}
