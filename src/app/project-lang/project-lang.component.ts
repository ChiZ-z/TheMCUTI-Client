import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectLangService, UtilService, TermLang, TokenService, ProjectService, Config, ProjectLang, Constants, EnumHelper, DataService } from '../core';
import { Progress } from '../core/models/progress.model';
import { PageParams } from '../core/models/page-params.model';
import { saveAs } from 'file-saver';
import { NzNotificationService } from 'ng-zorro-antd';
import { config, Subject, Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'tmc-project-lang',
  templateUrl: './project-lang.component.html',
  styleUrls: ['./project-lang.component.css']
})
export class ProjectLangComponent implements OnInit, OnDestroy {

  private allowedReferenceLangs: ProjectLang[];
  private currentLangId: number = -1;
  private currentProjectId: number = -1;
  private barInfo: Progress;
  private currentUserRole: Constants;
  private currentPageSize: number = 0;
  private currentPage: number = 1;

  //Search, filter and view variables
  private searchValue: string = '';
  private searchParam: Constants = Constants.TRANSLATION;
  private sortValue: Constants = Constants.CREATIONDATE;
  private sortViewValue: string = 'sort.creation.date';
  private filterValue: Constants = Constants.DEFAULT;
  private filterViewValue: string = 'show.all';
  private fileNameView: string = '';
  private exportType: string = 'json';
  private termLangList: TermLang[];
  private langPageParam: PageParams;
  private isRequestProcessing: boolean = false;
  private isNothingFound: boolean = false;
  private isNoTranslations: boolean = false;

  //Modals variables
  private isReferenceModalVisible: boolean = false;
  private isSettingsModalVisible: boolean = false;
  private isImportModalVisible: boolean = false;
  private isImportBlock: boolean = true;
  private isFlushingVisible: boolean = false;
  private isDeletingVisible: boolean = false;
  private isAutoModalVisible: boolean = false;

  //Additional info
  private isImportTerms: boolean = false;
  private isReplace: boolean = false;
  private unicode: boolean = false;
  private referenceLangId: number;
  private referenceForm: FormGroup;
  private enum: EnumHelper;
  private fuzzyCount: number = 0;
  private changedCount: number = 0;
  private autoTranslatedCount: number = 0;

  //Live search variables
  private searchVar = new Subject<string>();
  private liveSearchObservable$ = this.searchVar.asObservable();

  private unsubscribe: Subject<void> = new Subject();

  private config: Config[] = [
    {
      iconName: 'auto',
      tooltipCode: 'auto.translate',
      popup: false,
      popupOk: '',
      popupCancel: '',
      actionName: 'autoTranslateSelected',
      iconColor: '',
      iconSize: 'small'
    }
  ]

  @ViewChild('fileInput') fileInput;

  constructor(
    private route: ActivatedRoute,
    private langService: ProjectLangService,
    private notification: NzNotificationService,
    private utilService: UtilService,
    private tokenService: TokenService,
    private projectService: ProjectService,
    private router: Router,
    private dataService: DataService
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    if (this.tokenService.validateToken()) {
      this.utilService.checkItemsPerPage('icpl');
      this.currentPageSize = +localStorage.getItem('icpl');
      this.dataService.doReloadLangProgress$.pipe(takeUntil(this.unsubscribe))
        .subscribe((data: any) => {
          this.getBarInfo();
        });
      this.route.params.subscribe((data: any) => this.currentLangId = +data['langId']);
      this.route.params.subscribe((data: any) => this.currentProjectId = +data['id']);
      this.initFilterSubscription();
      this.route.queryParams.subscribe((queryParam: any) => {
        queryParam['ref'] ? this.referenceLangId = +queryParam['ref'] : this.referenceLangId = null;
        queryParam['page'] ? this.currentPage = +queryParam['page'] : this.currentPage = 1;
        queryParam['search'] ? this.searchValue = queryParam['search'] : this.searchValue = '';
        this.filterTermLangList();
      });
      this.initForms();
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  ngOnDestroy() {
    this.currentLangId = -1;
    this.currentProjectId = -1;
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  initForms() {
    this.referenceForm = new FormGroup({
      'langId': new FormControl(null, Validators.required)
    });
  }

  getBarInfo() {
    if (this.currentLangId != -1) {
      this.langService.getProgress(this.currentLangId).subscribe((data: Progress) => {
        this.barInfo = data;
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.load.data'));
        }
      });
    }
  }

  getLangProgress() {
    return Math.ceil(this.barInfo.progress * 100);
  }

  getRefLangProgress(lang: ProjectLang) {
    if (lang.termsCount == 0) return 0;
    return Math.ceil(lang.translatedCount / lang.termsCount * 100);
  }

  getTermsCountTitle() {
    return 'label.terms.count.' + this.utilService.getCountTitleSufix(this.barInfo.termsCount);
  }

  filterTermLangList() {
    this.searchVar.next(this.searchValue);
    this.router.navigateByUrl('/projects/' + this.currentProjectId + '/langs/' + this.currentLangId + '?page=' +
      this.currentPage + this.getRef() + this.getSearch());
  }

  initFilterSubscription() {
    this.liveSearchObservable$.pipe(
      debounceTime(150),
      takeUntil(this.unsubscribe),
      switchMap((value: any) => {
        this.dropBeforeFilter();
        return this.langService.filterTermLangs(this.currentLangId, this.searchValue, this.searchParam, this.sortValue, this.filterValue,
          this.currentPage - 1, this.currentPageSize, this.referenceLangId);
      })).subscribe((data: ProjectLang) => {
        this.termLangList = data.termLangs;
        this.langPageParam = data.pageParams;
        this.currentUserRole = data.role;
        this.isRequestProcessing = false;
        this.fuzzyCount = data.countFuzzy;
        this.autoTranslatedCount = data.countAutotranslated;
        this.changedCount = data.countChangeDefault;
        this.currentPage = data.pageParams.currentPage + 1;
        this.noTranslationsOrNothingFound(data);
        this.getBarInfo();
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        this.isRequestProcessing = false;
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.translations'));
        }
      });
  }

  dropBeforeFilter() {
    this.isRequestProcessing = true;
    this.termLangList = [];
    this.isNoTranslations = false;
    this.isNothingFound = false;
  }

  noTranslationsOrNothingFound(data: ProjectLang) {
    if (data.termLangs.length == 0 && (this.searchValue != '' || this.filterValue != Constants.DEFAULT)) {
      this.isNothingFound = true;
      this.isNoTranslations = false;
    } else if (data.termLangs.length == 0 && this.searchValue == '' && this.filterValue == Constants.DEFAULT) {
      this.isNothingFound = false;
      this.isNoTranslations = true;
    } else {
      this.isNothingFound = false;
      this.isNoTranslations = false;
    }
  }

  setSortValueAndView(value: Constants, view: string) {
    this.sortValue = value;
    this.sortViewValue = view;
    this.filterTermLangList();
  }

  setFilterValueAndView(value: Constants, view: string) {
    this.filterValue = value;
    this.filterViewValue = view;
    this.filterTermLangList();
  }

  pageIndexChange(event: number) {
    this.currentPage = event;
    this.router.navigateByUrl('/projects/' + this.currentProjectId + '/langs/' + this.currentLangId + '?page=' +
      this.currentPage + this.getRef() + this.getSearch());
  }

  pageSizeChange(event: number) {
    this.currentPageSize = event;
    localStorage.setItem('icpl', '' + event);
    this.filterTermLangList();
  }

  showReferenceModal() {
    this.referenceForm.reset();
    if (this.currentLangId != -1) {
      this.langService.getAllowedReferenceLanguages(this.currentLangId).
        subscribe((data: ProjectLang[]) => {
          this.allowedReferenceLangs = data;
          this.utilService.sortProjectLangList(this.allowedReferenceLangs);
        }, error => {
          this.tokenService.checkErrorAll(error.status);
          this.isRequestProcessing = false;
          if (this.tokenService.validateToken()) {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.langs'));
          }
        });
    }
    this.isReferenceModalVisible = true;
  }

  handleReferenceModalCancel() {
    this.isReferenceModalVisible = false;
  }

  handleReferenceModalOk() {
    if (this.allowedReferenceLangs.length != 0) {
      for (const i in this.referenceForm.controls) {
        this.referenceForm.controls[i].markAsDirty();
        this.referenceForm.controls[i].updateValueAndValidity();
      }
    }
    if (this.referenceForm.valid && this.allowedReferenceLangs.length > 0) {
      this.isReferenceModalVisible = false;
      const id: number = this.referenceForm.get('langId').value;
      this.router.navigateByUrl('/projects/' + this.currentProjectId + '/langs/' + this.currentLangId + '?page=' +
        this.currentPage + '&ref=' + id);
    }
  }

  showSettingsModal() {
    this.isSettingsModalVisible = true;
  }

  handleSettingsModalCancel() {
    this.isSettingsModalVisible = false;
  }

  handleSettingsModalOk() {
    this.isSettingsModalVisible = false;
  }

  showImportModal() {
    this.isImportBlock = false;
    setTimeout(data => {
      this.isImportBlock = true;
    }, 10);
    this.isImportModalVisible = true;
  }

  handleImportModalCancel() {
    this.isImportBlock = true;
    this.isImportModalVisible = false;
  }

  importTranslations() {
    const fileBrowser = this.fileInput.nativeElement;
    if (fileBrowser.files && fileBrowser.files[0]) {
      this.isRequestProcessing = true;
      const formData: FormData = new FormData();
      formData.append('file', fileBrowser.files[0], fileBrowser.files[0].filename);
      this.langService.importTranslations(this.currentLangId, formData, this.isImportTerms, this.isReplace)
        .subscribe((data: any) => {
          this.filterTermLangList();
          this.isImportTerms = false;
          this.isReplace = false;
          this.isRequestProcessing = false;
          this.isImportModalVisible = false;
        }, error => {
          this.isRequestProcessing = false;
          this.tokenService.checkErrorAll(error.status);
          if (this.tokenService.validateToken()) {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('import.failed'));
          }
        });
    } else {
      this.notification.create(Constants.WARNING, this.utilService.getTranslation(Constants.WARNING_TITLE), this.utilService.getTranslation('choose.file'));
    }
    this.fileNameView = '';
  }

  checkReplace() {
    this.isReplace = false;
  }

  exportFile() {
    if (this.exportType === 'propertiesUnicode') {
      this.exportType = 'properties';
      this.unicode = true;
    }
    if (this.exportType === 'stringUnicode') {
      this.exportType = 'strings';
      this.unicode = true;
    }
    this.langService.export(this.currentLangId, this.exportType, this.unicode).subscribe((data: Blob) => {
      const re: string = this.barInfo.projectName.replace(/\s/gi, '_');
      const blob: Blob = new Blob([data], { type: 'application/octet-stream' });
      saveAs(blob, re + '_' + this.barInfo.languageDefinition + '.' + this.exportType);
      this.exportType = 'json';
      this.unicode = false;
      this.isImportModalVisible = false;
      setTimeout(data => {
        this.isImportBlock = true;
      }, 100);
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.export.file'));
      }
    });
  }

  changeShowImportBlock(state: boolean) {
    this.isImportBlock = state;
  }

  fileEvent(file: HTMLInputElement) {
    this.fileNameView = file.value;
  }

  showDeleteLangModal() {
    this.isDeletingVisible = true;
    this.isSettingsModalVisible = false;
  }

  showFlushLangModal() {
    this.isFlushingVisible = true;
    this.isSettingsModalVisible = false;
  }

  handleAlertModalsClose() {
    this.isDeletingVisible = false;
    this.isFlushingVisible = false;
  }

  deleteLang() {
    this.projectService.deleteProjectLang(this.currentLangId).subscribe((data: any) => {
      this.router.navigateByUrl('/projects/' + this.currentProjectId + '/langs');
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        if (error.status === 400) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('cannot.delete.def.lang'));
        } else {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('cannot.delete.lang'));
        }
      }
    });
  }

  flushTranslations() {
    this.isRequestProcessing = true;
    this.langService.flushAllLang(this.currentLangId).subscribe((data: any) => {
      this.filterTermLangList();
      this.isRequestProcessing = false;
      this.handleAlertModalsClose();
      this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('info.translations.flushed'), '');
    }, error => {
      this.isRequestProcessing = false;
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.flush'));
      }
    });
  }

  chooseAction(event: string) {
    switch (event) {
      case 'selectNone': {
        this.selectNone(); break;
      }
      case 'selectAll': {
        this.selectAll(); break;
      }
      case 'autoTranslateSelected': {
        this.autoTranslateSelected(); break;
      }
    }
  }

  autoTranslateSelected() {
    if (this.countSelectedTranslations() > 0) {
      this.termLangList.forEach(a => {
        if (a.selected) {
          a.isRequestProcessing = true;
        }
      });
      this.langService.autoTranslateTermLangList(this.currentLangId, this.termLangList, this.referenceLangId).subscribe((data: any) => {
        this.filterTermLangList();
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        this.termLangList.forEach(a => {
          if (a.selected) {
            a.isRequestProcessing = false;
          }
        });
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.translate.list'));
        }
      });
    }
  }

  countSelectedTranslations() {
    let count: number = 0;
    if (!this.termLangList) return 0;
    this.termLangList.forEach(a => {
      if (a.selected) {
        count++;
      }
    });
    return count;
  }

  selectNone() {
    this.termLangList.forEach(a => {
      a.selected = false;
    });
  }

  selectAll() {
    this.termLangList.forEach(a => {
      a.selected = true;
    });
  }

  showAutoModal() {
    this.isAutoModalVisible = true;
  }

  closeAuto() {
    this.isAutoModalVisible = false;
  }

  getSearch() {
    return this.searchValue != '' ? '&search=' + this.searchValue : '';
  }

  getRef() {
    return this.referenceLangId ? '&ref=' + this.referenceLangId : '';
  }

}
