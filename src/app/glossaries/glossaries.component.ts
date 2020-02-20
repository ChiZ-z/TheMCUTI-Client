import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenService, DataService, Constants, EnumHelper, GlossaryService, UtilService, GlossariesInfo, Glossary, Glossaries, Lang, ProjectService } from '../core';
import { NzNotificationService } from 'ng-zorro-antd';
import { Subject } from 'rxjs';
import { takeUntil, switchMap, debounceTime } from 'rxjs/operators';
import { PageParams } from '../core/models/page-params.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'tmc-glossaries',
  templateUrl: './glossaries.component.html',
  styleUrls: ['./glossaries.component.css']
})
export class GlossariesComponent implements OnInit, OnDestroy {

  private currentTabIndex: number = 0;
  private glossaryType: Constants = Constants.MYGLOSSARIES;
  private infoItem: GlossariesInfo;

  private glossaryList: Glossary[];
  private langList: Lang[];

  //Filter variables
  private sortValue: Constants = Constants.CREATIONDATE;
  private sortViewValue: string = 'sort.creation.date';
  private searchValue: string = '';
  private isRequestProcessing: boolean = false;
  private filterViewValue: string = 'filter.all.glossaries';
  private filterValue: Constants = Constants.ALL;

  //Pageable variables
  private pageParams: PageParams;
  private currentPage: number = 1;
  private currentPageSize = 10;

  //Live search variables
  private searchVar = new Subject<string>();
  private liveSearchObservable$ = this.searchVar.asObservable();

  //Support
  private enum: EnumHelper;
  private addGlossaryForm: FormGroup;
  private isAddButtonShown: boolean = false;

  //Visibility variables
  private isAddGlossaryModalVisible: boolean = false;
  private isNothingFound: boolean = false;
  private isNoGlossaries: boolean = false;
  private isIndexChanging: boolean = false;

  private unsubscribe: Subject<void> = new Subject();

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private dataService: DataService,
    private glossaryService: GlossaryService,
    private utilService: UtilService,
    private notification: NzNotificationService,
    private activatedRoute: ActivatedRoute,
    private projectService: ProjectService
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    if (this.tokenService.validateToken()) {
      this.checkTabIndex();
      this.utilService.checkItemsPerPage('ipgp');
      this.currentPageSize = +localStorage.getItem('ipgp');
      this.initFilterSubscription();
      this.activatedRoute.queryParams.subscribe((queryParam: any) => {
        queryParam['page'] ? this.currentPage = +queryParam['page'] : this.currentPage = 1;
        queryParam['search'] ? this.searchValue = queryParam['search'] : this.searchValue = '';
        this.filterGlossariesList();
      });
      this.getLangs();
      this.initForms();
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  checkTabIndex() {
    if (this.router.url.includes('&type=my')) {
      this.glossaryType = Constants.MYGLOSSARIES;
      this.currentTabIndex = 0;
    } else if (this.router.url.includes('&type=added')) {
      this.glossaryType = Constants.ADDED;
      this.currentTabIndex = 1;
    } else if (this.router.url.includes('&type=market')) {
      this.glossaryType = Constants.MARKET;
      this.currentTabIndex = 2;
    }
  }

  activateRouterLink(glossaryType: Constants) {
    this.glossaryType = glossaryType;
    this.searchValue = '';
    this.currentPage = 1;
    this.filterValue = Constants.ALL;
    this.filterViewValue = 'filter.all.glossaries';
    if (glossaryType == Constants.MARKET) {
      this.sortValue = Constants.POPULARITY;
      this.sortViewValue = 'sort.popularity';
    } else {
      this.sortValue = Constants.CREATIONDATE;
      this.sortViewValue = 'sort.creation.date';
    }
    this.isIndexChanging = true;
    this.filterGlossariesList();
  }

  getInfo() {
    this.glossaryService.getGlossariesInfo(this.glossaryType).subscribe((data: GlossariesInfo) => {
      this.infoItem = data;
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

  filterGlossariesList() {
    this.searchVar.next(this.searchValue);
    this.router.navigateByUrl('/glossaries?page=' + this.currentPage + this.getUrlByType() + this.getSearch());
  }

  initFilterSubscription() {
    this.liveSearchObservable$.pipe(
      debounceTime(150),
      takeUntil(this.unsubscribe),
      switchMap((value: any) => {
        this.dropBeforeFilter();
        this.getInfo();
        this.checkButtonShown();
        return this.glossaryService.filterGlossaries(this.glossaryType, this.searchValue, this.filterValue, this.sortValue, this.currentPage - 1, this.currentPageSize);
      })).subscribe((data: Glossaries) => {
        this.isRequestProcessing = false;
        this.glossaryList = data.glossaries;
        this.pageParams = data.pageParams;
        this.currentPage = data.pageParams.currentPage + 1;
        this.nothingFoundOrNoGlossaries(data);
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.glossaries'));
        }
        this.isRequestProcessing = false;
      });
  }

  checkButtonShown() {
    this.isAddButtonShown = this.glossaryType == Constants.MYGLOSSARIES;
  }

  dropBeforeFilter() {
    this.isRequestProcessing = true;
    this.glossaryList = [];
    this.isNoGlossaries = false;
    this.isNothingFound = false;
    this.isIndexChanging = false;
  }

  nothingFoundOrNoGlossaries(data: Glossaries) {
    if (data.glossaries.length == 0 && (this.searchValue != '' || this.filterValue != Constants.ALL)) {
      this.isNothingFound = true;
      this.isNoGlossaries = false;
    } else if (data.glossaries.length == 0 && this.searchValue == '' && this.filterValue == Constants.ALL) {
      this.isNothingFound = false;
      this.isNoGlossaries = true;
    } else {
      this.isNothingFound = false;
      this.isNoGlossaries = false;
    }
  }

  setSortValueAndView(value: Constants, view: string) {
    this.sortValue = value;
    this.sortViewValue = view;
    this.filterGlossariesList();
  }

  setFilterValueAndView(value: Constants, view: string) {
    this.filterValue = value;
    this.filterViewValue = view;
    this.filterGlossariesList();
  }

  pageIndexChange(event: number) {
    this.currentPage = event;
    this.router.navigateByUrl('/glossaries?page=' + this.currentPage + this.getUrlByType() + this.getSearch());
  }

  pageSizeChange(event: number) {
    this.currentPageSize = event;
    localStorage.setItem('ipgp', '' + event);
    this.filterGlossariesList();
  }

  getSearch() {
    return this.searchValue != '' ? '&search=' + this.searchValue : '';
  }

  initForms() {
    this.addGlossaryForm = new FormGroup({
      'glossaryName': new FormControl(null, [Validators.required, Validators.pattern('^[a-zA-Zа-яА-Я0-9\\s]{3,60}$')]),
      'description': new FormControl(null, [Validators.required, Validators.pattern('[^\\^\{\\}\[\\]]{1,5000}')]),
      'type': new FormControl(null, [Validators.required]),
      'langId': new FormControl(null, [Validators.required])
    });
  }

  showAddGlossaryModal() {
    this.isAddGlossaryModalVisible = true;
  }

  closeAddGlossaryModal() {
    this.addGlossaryForm.reset();
    this.isAddGlossaryModalVisible = false;
  }

  createGlossary() {
    this.trimValues();
    for (const i in this.addGlossaryForm.controls) {
      this.addGlossaryForm.controls[i].markAsDirty();
      this.addGlossaryForm.controls[i].updateValueAndValidity();
    }
    if (this.addGlossaryForm.valid) {
      let glossary: Glossary = new Glossary();
      glossary.glossaryName = this.addGlossaryForm.get('glossaryName').value;
      glossary.description = this.addGlossaryForm.get('description').value;
      glossary.glossaryType = this.addGlossaryForm.get('type').value;
      const langId: number = +this.addGlossaryForm.get('langId').value;
      this.langList.forEach(lang => {
        if (lang.id == langId) {
          glossary.lang = lang;
        }
      });
      this.glossaryService.createGlossary(glossary).subscribe((data: Glossary) => {
        this.router.navigateByUrl("/glossaries/" + data.id);
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.add.glossary'));
        }
      });
    }
  }

  trimValues() {
    let name: string = this.addGlossaryForm.get('glossaryName').value;
    let description: string = this.addGlossaryForm.get('description').value;
    const type: number = this.addGlossaryForm.get('type').value;
    const langId: number = this.addGlossaryForm.get('langId').value;
    this.addGlossaryForm.setValue({
      'glossaryName': name ? name.trim() : '',
      'description': description ? description.trim() : '',
      'type': type,
      'langId': langId
    });
  }

  getUrlByType() {
    if (this.glossaryType == Constants.ADDED) {
      return '&type=added';
    } else if (this.glossaryType == Constants.MYGLOSSARIES) {
      return '&type=my';
    } else if (this.glossaryType == Constants.MARKET) {
      this.sortValue = Constants.POPULARITY;
      this.sortViewValue = 'sort.popularity';
      return '&type=market';
    }
  }

  getLangs() {
    this.projectService.getAllLangs().subscribe((data: Lang[]) => {
      this.langList = data;
      this.utilService.sortLangList(this.langList);
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.langs'));
      }
    });
  }

}
