import { Component, OnInit, OnDestroy } from '@angular/core';
import { Glossary, TokenService, UtilService, GlossaryService, DataService, Constants, EnumHelper, Group, Lang, ProjectService, Category, TranslationItem } from '../core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { PageParams } from '../core/models/page-params.model';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, switchMap, take } from 'rxjs/operators';
import { Location } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'tmc-glossary-groups',
  templateUrl: './glossary-groups.component.html',
  styleUrls: ['./glossary-groups.component.css']
})
export class GlossaryGroupsComponent implements OnInit, OnDestroy {
  private glossary: Glossary;
  private groupList: Group[];
  private langList: Lang[];
  private fullLangList: Lang[];
  private categoryList: Category[];
  private availableCategoryList: Category[];
  private currentGlossaryId: number = -1;
  private lang: Lang;
  private defaultLang: Lang;
  private currentUserRole: Constants;

  //Filter variables
  private sortValue: Constants = Constants.CREATIONDATE;
  private sortViewValue: string = 'sort.creation.date';
  private searchValue: string = '';
  private isRequestProcessing: boolean = false;
  private langView: string;

  //Pageable variables
  private pageParams: PageParams;
  private currentPage: number = 1;
  private currentPageSize = 10;

  //Live search variables
  private searchVar = new Subject<string>();
  private liveSearchObservable$ = this.searchVar.asObservable();

  //Support
  private enum: EnumHelper;
  private categoryIds: number[];
  private deleteCategoryItem: Category;
  private categoryInputValue: string = '';
  private categoryOptions: Category[];
  private isGlossaryInitialized: boolean = false;

  //Visible variables
  private isAddCategoryModalVisible: boolean = false;
  private isAddGroupModalVisible: boolean = false;
  private isDeleteCategoryModalVisible: boolean = false;
  private isNoCategories: boolean = false;

  //Forms
  private addCategoryForm: FormGroup;
  private groupForAdding: Group;

  private isNothingFound: boolean = false;
  private isNoGroups: boolean = false;

  private unsubscribe: Subject<void> = new Subject();

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private dataService: DataService,
    private glossaryService: GlossaryService,
    private utilService: UtilService,
    private notification: NzNotificationService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private projectService: ProjectService
  ) {
    this.groupList = [];
    this.enum = new EnumHelper();
    this.categoryList = [];
    this.availableCategoryList = [];
    this.categoryOptions = [];
    this.categoryIds = [];
    this.initGroupForAdding();
  }

  ngOnInit() {
    if (this.tokenService.validateToken()) {
      this.utilService.checkItemsPerPage('ipgp');
      this.currentPageSize = +localStorage.getItem('ipgp');
      this.currentGlossaryId = +this.activatedRoute.parent.parent.parent.snapshot.paramMap.get('id');
      this.dataService.doReloadGlossaryGroups$.pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        this.filterGlossary();
      });
      this.initFilterSubscription();
      this.activatedRoute.queryParams.subscribe((queryParam: any) => {
        queryParam['page'] ? this.currentPage = +queryParam['page'] : this.currentPage = 1;
        queryParam['search'] ? this.searchValue = queryParam['search'] : this.searchValue = '';
        queryParam['category'] ? this.createIdsArray(queryParam['category']) : this.categoryIds = [];
        this.filterGlossary();
      });
      this.initForms();
      this.getLangs();
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  filterGlossary() {
    this.searchVar.next(this.searchValue);
    this.router.navigateByUrl('/glossaries/' + this.currentGlossaryId + '/groups?page=' + this.currentPage + this.getSearch() + this.getCategory());
  }

  initFilterSubscription() {
    this.liveSearchObservable$.pipe(
      debounceTime(150),
      takeUntil(this.unsubscribe),
      switchMap((value: any) => {
        this.dropBeforeFilter();
        return this.glossaryService.filterGlossary(this.currentGlossaryId, this.searchValue, this.sortValue, this.lang, this.categoryIds, this.currentPage - 1, this.currentPageSize);
      })).subscribe((data: Glossary) => {
        this.glossary = data;
        if (!this.isGlossaryInitialized) {
          this.langView = data.lang ? data.lang.langName : 'label.any.lang';
          this.lang = data.lang;
          this.defaultLang = data.lang
        }
        this.isGlossaryInitialized = true;
        this.isRequestProcessing = false;
        this.groupList = data.groupItems;
        this.pageParams = data.pageParams;
        this.currentPage = data.pageParams.currentPage + 1;
        this.currentUserRole = data.followerRole;
        this.categoryList = data.categories;
        this.availableCategoryList = Object.assign([], this.categoryList);
        this.nothingFoundOrNoGroups(data);
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.glossaries'));
        }
        this.isRequestProcessing = false;
      });
  }

  nothingFoundOrNoGroups(data: Glossary) {
    if (data.groupItems.length == 0 && (this.searchValue != '' || this.categoryIds.length > 0)) {
      this.isNothingFound = true;
      this.isNoGroups = false;
    } else if (data.groupItems.length == 0 && this.searchValue == '' && this.categoryIds.length == 0) {
      this.isNothingFound = false;
      this.isNoGroups = true;
    } else {
      this.isNothingFound = false;
      this.isNoGroups = false;
    }
    this.noCategories(data.categories);
  }

  noCategories(data: Category[]) {
    if (data.length == 0) {
      this.isNoCategories = true;
    } else {
      this.isNoCategories = false;
    }
  }

  dropBeforeFilter() {
    this.isRequestProcessing = true;
    this.groupList = [];
    this.isNoGroups = false;
    this.isNothingFound = false;
  }

  setSortValueAndView(value: Constants, view: string) {
    this.sortValue = value;
    this.sortViewValue = view;
    this.filterGlossary();
  }

  setLang(lang: Lang) {
    this.langView = lang ? lang.langName : 'label.any.lang';
    this.lang = lang;
    this.filterGlossary();
  }

  pageIndexChange(event: number) {
    this.currentPage = event;
    this.router.navigateByUrl('/glossaries/' + this.currentGlossaryId + '/groups?page=' + this.currentPage + this.getSearch());
  }

  pageSizeChange(event: number) {
    this.currentPageSize = event;
    localStorage.setItem('ipgp', '' + event);
    this.filterGlossary();
  }

  createIdsArray(value: string) {
    let array: string[] = value.split(',');
    this.categoryIds = [];
    array.forEach(a => this.categoryIds.push(+a));
  }

  getSearch() {
    return this.searchValue != '' ? '&search=' + this.searchValue : '';
  }

  getCategory() {
    return this.categoryIds.length > 0 ? '&category=' + this.categoryIds : '';
  }

  getCountTitle(type: string, value: number) {
    return 'label.' + type + '.count.' + this.utilService.getCountTitleSufix(value ? value : 0);
  }

  getLangs() {
    this.projectService.getAllLangs().subscribe((data: Lang[]) => {
      this.langList = data;
      this.utilService.sortLangList(this.langList);
      this.fullLangList = Object.assign([], this.langList);
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.langs'));
      }
    });
  }

  initForms() {
    this.addCategoryForm = new FormGroup({
      'value': new FormControl(null, [Validators.required, Validators.maxLength(40)])
    });
  }

  trimCategoryValue() {
    let value: string = this.addCategoryForm.get('value').value;
    this.addCategoryForm.setValue({
      'value': value ? value.trim() : ''
    });
  }

  showAddCategoryModal() {
    this.isAddCategoryModalVisible = true;
  }

  closeAddCategoryModal() {
    this.addCategoryForm.reset();
    this.isAddCategoryModalVisible = false;
  }

  addCategory() {
    for (const i in this.addCategoryForm.controls) {
      this.addCategoryForm.controls[i].markAsDirty();
      this.addCategoryForm.controls[i].updateValueAndValidity();
    }
    if (this.addCategoryForm.valid) {
      this.trimCategoryValue();
      const categoryName: string = this.addCategoryForm.get('value').value;
      this.glossaryService.createCategory(this.currentGlossaryId, categoryName).subscribe((data: Category[]) => {
        this.categoryList = data;
        this.isAddCategoryModalVisible = false;
        this.noCategories(data);
        this.mergeCategoriesList();
        this.addCategoryForm.reset();
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          if (error.status == 400) {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.category.exists'));
          } else {
            this.isAddCategoryModalVisible = false;
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.add.category'));
          }
        }
      });
    }
  }

  selectCategory(category: Category) {
    if (this.categoryIds.indexOf(category.id) != -1) {
      this.categoryIds.splice(this.categoryIds.indexOf(category.id), 1)
    } else {
      this.categoryIds.push(category.id);
    }
    this.filterGlossary();
  }

  checkCategory(id: number) {
    return this.categoryIds.indexOf(id) != -1;
  }

  showDeleteCategoryModal(category: Category) {
    this.isDeleteCategoryModalVisible = true;
    this.deleteCategoryItem = category;
  }

  closeDeleteCategoryModal() {
    this.deleteCategoryItem = null;
    this.isDeleteCategoryModalVisible = false;
  }

  deleteCategory() {
    this.glossaryService.deleteCategory(this.deleteCategoryItem.id).subscribe((data: Category[]) => {
      this.categoryList.splice(this.categoryList.indexOf(this.deleteCategoryItem), 1);
      this.isDeleteCategoryModalVisible = false;
      this.noCategories(this.categoryList);
      this.filterGlossary();
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.isAddCategoryModalVisible = false;
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.delete.category'));
      }
    });
  }

  initGroupForAdding() {
    this.groupForAdding = new Group();
    this.groupForAdding.translationItems.push(new TranslationItem(true));
    this.groupForAdding.translationItems.push(new TranslationItem());
    this.groupForAdding.translationItems.forEach(a => {
      a.addForm = this.initTranslationForm(a.addForm);
      this.initLangChangeSubscription(a);
    });
    if (this.categoryList.length > 0) {
      this.mergeCategoriesList();
    }
  }

  mergeCategoriesList() {
    this.availableCategoryList = Object.assign([], this.categoryList);
    this.groupForAdding.categories.forEach(a => {
      this.availableCategoryList = this.availableCategoryList.filter(b => b.id != a.id);
    });
  }

  initLangChangeSubscription(form: TranslationItem) {
    form.addForm.get('langId').valueChanges.subscribe((data: any) => {
      this.langList = Object.assign([], this.fullLangList);
      this.langList = this.langList.filter(b => b.id != this.glossary.lang.id);
      this.checkLangList();
    });
  }

  checkLangList() {
    this.groupForAdding.translationItems.forEach(c => {
      const langId: number = +c.addForm.get('langId').value;
      if (langId) {
        this.langList = this.langList.filter(b => b.id != langId);
      }
    });
  }

  initTranslationForm(form: FormGroup) {
    form = new FormGroup({
      'langId': new FormControl(null, [Validators.required]),
      'translationValue': new FormControl(null, [Validators.required, Validators.maxLength(5000)])
    });
    return form;
  }

  showAddGroupModal() {
    this.groupForAdding.translationItems[0].addForm.setValue({
      'langId': -1,
      'translationValue': ''
    });
    if (this.glossary) {
      this.langList = this.langList.filter(b => b.id != this.glossary.lang.id);
    }
    this.groupForAdding.translationItems[0].lang = this.glossary.lang;
    this.isAddGroupModalVisible = true;
  }

  closeAddGroupModal() {
    this.isAddGroupModalVisible = false;
  }

  createGroup() {
    let isValid = true;
    for (const i in this.groupForAdding.translationItems) {
      for (const j in this.groupForAdding.translationItems[i].addForm.controls) {
        this.groupForAdding.translationItems[i].addForm.controls[j].markAsDirty();
        this.groupForAdding.translationItems[i].addForm.controls[j].updateValueAndValidity();
      }
      if (this.groupForAdding.translationItems[i].addForm.invalid) {
        isValid = false;
      }
    }
    if (isValid) {
      this.prepareGroup(this.groupForAdding);
      this.glossaryService.createGroup(this.groupForAdding, this.currentGlossaryId).subscribe((data: any) => {
        this.filterGlossary();
        this.isAddGroupModalVisible = false;
        this.initGroupForAdding();
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          // this.isAddGroupModalVisible = false;
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.add.group'));
        }
      });
    }
  }

  prepareGroup(group: Group) {
    group.translationItems.forEach(a => {
      a.translationItemValue = a.addForm.get('translationValue').value ? a.addForm.get('translationValue').value.trim() : '';
      const id: number = +a.addForm.get('langId').value;
      this.fullLangList.forEach(lang => {
        if (lang.id == id) {
          a.lang = lang;
        }
      });
      a.addForm = null;
    });
  }

  addTranslationItem() {
    let item: TranslationItem = new TranslationItem();
    item.addForm = this.initTranslationForm(item.addForm);
    this.initLangChangeSubscription(item);
    this.groupForAdding.translationItems.push(item);
  }

  addCategoryToGroup(category: Category) {
    this.groupForAdding.categories.push(category);
    this.availableCategoryList = this.availableCategoryList.filter(a => a.id != category.id);
  }

  deleteCategoryFromGroup(category: Category) {
    this.groupForAdding.categories = this.groupForAdding.categories.filter(a => a.categoryName != category.categoryName);
    // this.availableCategoryList.push(category);
  }

  deleteTranslationItem(item: TranslationItem) {
    this.groupForAdding.translationItems.splice(this.groupForAdding.translationItems.indexOf(item), 1);
    this.langList = Object.assign([], this.fullLangList);
    this.checkLangList();
  }

  onCategoryInput(value: string): void {
    this.categoryOptions = [];
    this.categoryOptions = value ? this.availableCategoryList
      .filter(a => a.categoryName.toLowerCase().indexOf(value.toLowerCase()) != -1 && this.groupForAdding.categories.indexOf(a) == -1) : [];
  }

  enterCategoryEvent() {
    let isCategoryFound: boolean = false;
    this.categoryList.forEach(category => {
      if (category.categoryName == this.categoryInputValue && this.groupForAdding.categories.indexOf(category) == -1) {
        this.groupForAdding.categories.push(category);
        isCategoryFound = true;
        this.categoryInputValue = '';
      }
    });
    if (!isCategoryFound) {
      let notEquals: boolean = true;
      this.groupForAdding.categories.forEach(category => {
        if (category.categoryName == this.categoryInputValue) {
          notEquals = false;
        }
      });
      if (notEquals && this.categoryInputValue) {
        let category: Category = new Category();
        category.categoryName = this.categoryInputValue.substr(0, 40);
        category.glossaryId = this.glossary.id;
        this.groupForAdding.categories.push(category);
      }
      this.categoryInputValue = '';
    }
  }

  chooseCategory(category: Category) {
    this.groupForAdding.categories.push(category);
  }
}
