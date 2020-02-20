import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { UtilService, ProjectLangService, ProjectService, Term, ProjectTermService, ProjectLang, Config, EnumHelper, TokenService, Constants, Project, DataService } from '../core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '../core/services/i18n.service';
import { PageParams } from '../core/models/page-params.model';
import { Subscription, Subject } from 'rxjs';
import { count, debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'tmc-project-terms',
  templateUrl: './project-terms.component.html',
  styleUrls: ['./project-terms.component.css']
})
export class ProjectTermsComponent implements OnInit, OnDestroy {

  private currentProjectId: number = -1;
  private currentPageSize: number = 0;
  private currentUserRole: Constants;
  private currentPage: number = 1;
  private fileNameView: string = '';

  //Forms and modals variables
  private addTermForm: FormGroup;
  private importForm: FormGroup;
  private checkboxWithValue: boolean = false;
  private checkboxReplace: boolean = false;
  private importLangId: number;
  private isAddTermVisible: boolean = false;
  private isImportVisible: boolean = false;

  //Filter, sort and view variables
  private isNothingFound: boolean = false;
  private isNoTerms: boolean = false;
  private isRequestProcessing: boolean = false;
  private searchValue: string = '';
  private sortValue: Constants = Constants.CREATIONDATE;
  private sortViewValue: string = 'sort.creation.date';
  private routeSubscription: Subscription;
  private projectTermsList: Term[];
  private termsPageParams: PageParams;
  private langsCount: number;
  private projectLangs: ProjectLang[];
  private enum: EnumHelper;

  //Live search variables
  private searchVar = new Subject<string>();
  private liveSearchObservable$ = this.searchVar.asObservable();

  private unsubscribe: Subject<void> = new Subject();

  private config: Config[] = [
    {
      iconName: 'trash-white',
      tooltipCode: 'label.delete.selected',
      popup: true,
      popupOk: 'delete.button',
      popupCancel: 'cancel',
      actionName: 'deleteSelected',
      iconColor: '',
      iconSize: 'small'
    }
  ]

  @ViewChild('fileInput') fileInput;

  constructor(
    private utilService: UtilService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private projectService: ProjectService,
    private notification: NzNotificationService,
    private tokenService: TokenService,
    private termService: ProjectTermService,
    private i18nService: I18nService,
    private dataService: DataService
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    if (this.tokenService.validateToken()) {
      this.utilService.checkItemsPerPage('ipt');
      this.currentPageSize = +localStorage.getItem('ipt');
      this.dataService.doRefilterProjectTerms$.pipe(takeUntil(this.unsubscribe)).
        subscribe((data: any) => {
          this.filterTermsList();
        });
      this.currentProjectId = +this.activatedRoute.parent.parent.parent.snapshot.paramMap.get('id');
      this.initFilterSubscription();
      this.initForms();
      this.activatedRoute.queryParams.subscribe((queryParam: any) => {
        queryParam['page'] ? this.currentPage = +queryParam['page'] : this.currentPage = 1;
        queryParam['search'] ? this.searchValue = queryParam['search'] : this.searchValue = '';
        this.filterTermsList();
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

  filterTermsList() {
    this.searchVar.next(this.searchValue);
    this.emitActionToReloadProgress();
    this.router.navigateByUrl('/projects/' + this.currentProjectId + '/terms?page=' + this.currentPage + this.getSearch());
  }

  initFilterSubscription() {
    this.liveSearchObservable$.pipe(
      debounceTime(150),
      takeUntil(this.unsubscribe),
      switchMap((value: any) => {
        this.dropBeforeFilter();
        return this.projectService.filterProjectTerms(this.currentProjectId, this.searchValue, this.sortValue, this.currentPage - 1, this.currentPageSize);
      })).subscribe((data: Project) => {
        this.projectTermsList = data.terms;
        this.termsPageParams = data.pageParams;
        this.currentUserRole = data.role;
        this.langsCount = data.projectLangs.length;
        this.isRequestProcessing = false;
        this.currentPage = data.pageParams.currentPage + 1;
        this.projectLangs = data.projectLangs;
        this.nothingFoundOrNoTerms(data);
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.terms'));
        }
        this.isRequestProcessing = false;
      });
  }

  nothingFoundOrNoTerms(data: Project) {
    if (data.terms.length == 0 && this.searchValue != '') {
      this.isNothingFound = true;
      this.isNoTerms = false;
    } else if (data.terms.length == 0 && this.searchValue == '') {
      this.isNothingFound = false;
      this.isNoTerms = true;
    } else {
      this.isNothingFound = false;
      this.isNoTerms = false;
    }
  }

  dropBeforeFilter() {
    this.isRequestProcessing = true;
    this.projectTermsList = [];
    this.isNothingFound = false;
    this.isNoTerms = false;
  }

  emitActionToReloadProgress() {
    this.dataService.reloadProjectInfo('true');
  }

  setSortValueAndView(value: Constants, view: string) {
    this.sortValue = value;
    this.sortViewValue = view;
    this.filterTermsList();
  }

  pageIndexChange(event: number) {
    this.currentPage = event;
    this.router.navigateByUrl('/projects/' + this.currentProjectId + '/terms?page=' + this.currentPage + this.getSearch());
  }

  pageSizeChange(event: number) {
    this.currentPageSize = event;
    localStorage.setItem('ipt', '' + event);
    this.filterTermsList();
  }

  getTranslation(value: string): string {
    return this.i18nService.getTranslation(value);
  }

  countSelectedTerms() {
    let counter: number = 0;
    if (!this.projectTermsList) {
      return 0;
    }
    this.projectTermsList.forEach(a => {
      if (a.selected) {
        counter++;
      }
    });
    return counter;
  }

  initForms() {
    this.addTermForm = new FormGroup({
      'termValue': new FormControl(null, [
        Validators.required,
        Validators.pattern('[a-zA-Zа-яА-Я.\\s\\d]{1,1000}')
      ])
    });
  }

  showAddTermForm() {
    this.addTermForm.reset();
    this.isAddTermVisible = true;
  }

  handleAddTermFormCancel() {
    this.isAddTermVisible = false;
  }

  handleAddTermFormOk() {
    this.trimTermValue();
    for (const i in this.addTermForm.controls) {
      this.addTermForm.controls[i].markAsDirty();
      this.addTermForm.controls[i].updateValueAndValidity();
    }
    if (this.addTermForm.valid) {
      const value: string = this.addTermForm.get('termValue').value;
      const pg: number = Math.ceil((this.termsPageParams.size + 1) / this.currentPageSize);
      this.projectService.addTerm(this.currentProjectId, value, pg - 1).subscribe((data: any) => {
        this.chooseFilter(1);
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          if (error.status == 423) {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.term.exists'));
          } else if (error.status == 424) {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.term.value.too.long'));
          } else {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.add.term'));
          }
        }
      });
      this.isAddTermVisible = false;
    }
  }

  trimTermValue() {
    let term: string = this.addTermForm.get('termValue').value;
    this.addTermForm.setValue({
      'termValue': term ? term.trim() : ''
    });
  }

  chooseFilter(diff: number) {
    const pg: number = Math.ceil((this.termsPageParams.size + diff) / this.currentPageSize);
    this.initForms();
    if (pg >= this.currentPage) {
      this.filterTermsList();
    } else if (pg == 0) {
      this.router.navigateByUrl('/projects/' + this.currentProjectId + '/terms');
    } else {
      this.router.navigateByUrl('/projects/' + this.currentProjectId + '/terms?page=' + pg);
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
      case 'deleteSelected': {
        this.deleteSelected(); break;
      }
    }
  }

  deleteSelected() {
    const selectedCount: number = this.countSelectedTerms();
    if (selectedCount != 0) {
      this.termService.deleteSelected(this.currentProjectId, this.projectTermsList).subscribe((data: any) => {
        this.chooseFilter(-selectedCount);
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE),
            this.utilService.getTranslation('error.cannot.delete.selected.terms'));
        }
      });
    }
  }

  selectNone() {
    this.projectTermsList.forEach(a => {
      a.selected = false;
    });
  }

  selectAll() {
    this.projectTermsList.forEach(a => {
      a.selected = true;
    });
  }

  showImportModal() {
    this.importLangId = null;
    this.isImportVisible = true;
  }

  handleImportFormCancel() {
    this.isImportVisible = false;
  }

  handleImportFormOk() {
    if (!this.importLangId && this.checkboxWithValue == true) {
      this.notification.create(Constants.WARNING, this.utilService.getTranslation(Constants.WARNING_TITLE), this.utilService.getTranslation('choose.lang'));
    } else {
      const fileBrowser = this.fileInput.nativeElement;
      if (fileBrowser.files && fileBrowser.files[0]) {
        const formData: FormData = new FormData();
        formData.append('file', fileBrowser.files[0], fileBrowser.files[0].filename);
        this.isRequestProcessing = true;
        this.isImportVisible = false;
        this.projectService.addAllTermsFromFile(this.currentProjectId, this.checkboxWithValue, this.checkboxReplace, this.importLangId, formData)
          .subscribe((data: any) => {
            this.isRequestProcessing = false;
            this.checkboxReplace = false;
            this.checkboxWithValue = false;
            this.filterTermsList();
          }, error => {
            this.isRequestProcessing = false;
            this.tokenService.checkErrorAll(error.status);
            if (this.tokenService.validateToken()) {
              this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('import.failed'));
            }
          });
      }
      else {
        this.notification.create(Constants.WARNING, this.utilService.getTranslation(Constants.WARNING_TITLE), this.utilService.getTranslation('choose.file'));
      }
    }
  }

  fileEvent(file: HTMLInputElement) {
    this.fileNameView = file.value;
  }

  getSearch() {
    return this.searchValue != '' ? '&search=' + this.searchValue : '';
  }
}
