import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Group, UtilService, Category, TranslationItem, GlossaryService, TokenService, Constants, EnumHelper, Lang, DataService } from 'src/app/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NzNotificationService } from 'ng-zorro-antd';
import { FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'tmc-group-card',
  templateUrl: './group-card.component.html',
  styleUrls: ['./group-card.component.css'],
  animations: [
    trigger('slideIn', [
      state('*', style({ 'overflow-y': 'hidden' })),
      state('void', style({ 'overflow-y': 'hidden' })),
      transition('* => void', [
        style({ height: '*' }),
        animate(90, style({ height: 0 }))
      ]),
      transition('void => *', [
        style({ height: '0' }),
        animate(250, style({ height: '*' }))
      ])
    ]
    )]
})
export class GroupCardComponent implements OnInit {

  @Input() group: Group;
  @Input() currentPage: number;
  @Input() glossaryId: number;
  @Input() currentUserRole: Constants;
  @Input() fullLangList: Lang[];
  @Input() fullCategoryList: Category[];
  @Input() defaultGlossaryLang: Lang;

  //Change categories variables
  private categoryOptions: Category[];
  private categoryInputValue: string = '';
  private groupForChange: Group;

  private isTranslationsShown: boolean = false;
  private enum: EnumHelper;
  private editItemId: number = -1;
  private langList: Lang[];

  //Modal variables
  private isAddTranslationModalVisible: boolean = false;
  private isUpdateGroupModalVisible: boolean = false;

  private addingTranslationItem: TranslationItem;

  private isFullText: boolean = false;
  private isFullDescription: boolean = false;

  constructor(
    private utilService: UtilService,
    private router: Router,
    private glossaryService: GlossaryService,
    private tokenService: TokenService,
    private notification: NzNotificationService,
    private dataService: DataService
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    if (this.currentUserRole == Constants.GL_AUTHOR || this.currentUserRole == Constants.GL_MODERATOR) {
      this.langList = Object.assign([], this.fullLangList);
      this.initAddingItem();
    }
  }

  getCountTitle(type: string, value: number) {
    return 'label.' + type + '.count.' + this.utilService.getCountTitleSufix(value ? value : 0);
  }

  goToCategory(category: Category) {
    this.router.navigateByUrl('/glossaries/' + this.glossaryId + '/groups?page=' + 1 + '&category=' + category.id);
  }

  getSliceValue(value: string, size: number, statement: boolean) {
    return statement ? value : (value.substr(0, size) + (value.length > size ? '...' : ''));
  }

  showTranslations() {
    this.isTranslationsShown = true;
  }

  hideTranslations() {
    this.isTranslationsShown = false;
  }

  copyValue(value: string) {
    this.utilService.copyString(value);
  }

  deleteTranslation(translation: TranslationItem) {
    this.glossaryService.deleteTranslation(this.group.id, translation.id).subscribe((data: any) => {
      this.group.translationItems.splice(this.group.translationItems.indexOf(translation), 1);
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.delete.translation'));
      }
    });
  }

  chooseTranslationsForUpdate(translation: TranslationItem) {
    translation.buffer = translation.translationItemValue;
    this.editItemId = translation.id;
  }

  updateTranslationValue(translation: TranslationItem) {
    this.editItemId = -1;
    translation.buffer = translation.buffer.trim();
    if (translation.buffer != '' && translation.buffer != translation.translationItemValue) {
      translation.translationItemValue = translation.buffer;
      translation.buffer = '';
      this.glossaryService.updateTranslation(translation).subscribe((data: any) => {
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('label.updated'), '');
        this.group.translationItems.forEach(translation => {
          if (this.group.defaultTranslationItem.id == translation.id) {
            this.group.defaultTranslationItem.translationItemValue = translation.translationItemValue;
          }
        });
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.update.translation'));
        }
      });
    } else if (translation.translationItemValue == '') {
      this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.translation.empty'));
    }
  }

  initAddingItem() {
    this.addingTranslationItem = new TranslationItem();
    this.addingTranslationItem.addForm = this.initTranslationForm(this.addingTranslationItem.addForm);
    this.initLangChangeSubscription(this.addingTranslationItem);
    this.filterLangList(this.addingTranslationItem);
    this.group.translationItems.forEach(a => {
      this.filterLangList(a);
    });
  }

  initTranslationForm(form: FormGroup) {
    form = new FormGroup({
      'langId': new FormControl(null, [Validators.required]),
      'translationValue': new FormControl(null, [Validators.required, Validators.maxLength(5000)])
    });
    return form;
  }

  initLangChangeSubscription(form: TranslationItem) {
    form.addForm.get('langId').valueChanges.subscribe((data: any) => {
      this.langList = Object.assign([], this.fullLangList);
      this.filterLangList(this.addingTranslationItem);
      this.group.translationItems.forEach(a => {
        this.filterLangList(a);
      });
    });
  }

  filterLangList(item: TranslationItem) {
    let langId: number;
    if (item.addForm) {
      langId = +item.addForm.get('langId').value;

    } else {
      langId = item.lang.id;
    }
    if (langId) {
      this.langList = this.langList.filter(b => b.id != langId);
    }
  }

  showAddTranslationModal() {
    this.isAddTranslationModalVisible = true;
  }

  closeAddTranslationModal() {
    this.isAddTranslationModalVisible = false;
  }

  addTranslation() {
    for (const j in this.addingTranslationItem.addForm.controls) {
      this.addingTranslationItem.addForm.controls[j].markAsDirty();
      this.addingTranslationItem.addForm.controls[j].updateValueAndValidity();
    }
    if (this.addingTranslationItem.addForm.valid) {
      this.addingTranslationItem.translationItemValue = this.addingTranslationItem.addForm.get('translationValue').value;
      const langId: number = +this.addingTranslationItem.addForm.get('langId').value;
      this.fullLangList.forEach(lang => {
        if (lang.id == langId) {
          this.addingTranslationItem.lang = lang;
        }
      });
      this.addingTranslationItem.addForm = null;
      this.addingTranslationItem.groupItemId = this.group.id;
      this.glossaryService.addTranslation(this.group.id, this.addingTranslationItem).subscribe((data: any) => {
        this.group.translationItems.push(data);
        this.initAddingItem();
        this.isAddTranslationModalVisible = false;
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.add.translation'));
        }
      });
    }
  }

  showUpdateGroupModal() {
    this.categoryInputValue = '';
    this.groupForChange = new Group();
    this.groupForChange.id = this.group.id;
    this.groupForChange.categories = Object.assign([], this.group.categories);
    this.groupForChange.comment = this.group.comment;
    this.isUpdateGroupModalVisible = true;
  }

  closeUpdateGroupModal() {
    this.isUpdateGroupModalVisible = false;
  }

  onCategoryInput(value: string): void {
    this.categoryOptions = [];
    this.categoryOptions = value ? this.fullCategoryList
      .filter(a => a.categoryName.toLowerCase().indexOf(value.toLowerCase()) != -1 && this.indexOf(a, this.groupForChange.categories) == -1) : [];
  }

  indexOf(category: Category, categoryList: Category[]): number {
    let index: number = -1;
    let returnIndex: number = -1;
    categoryList.forEach(a => {
      index++;
      if (a.id == category.id) {
        returnIndex = index;
      }
    });
    return returnIndex;
  }

  enterCategoryEvent() {
    let isCategoryFound: boolean = false;
    this.fullCategoryList.forEach(category => {
      if (category.categoryName == this.categoryInputValue && this.groupForChange.categories.indexOf(category) == -1) {
        this.groupForChange.categories.push(category);
        isCategoryFound = true;
        this.categoryInputValue = '';
      }
    });
    if (!isCategoryFound) {
      let notEquals: boolean = true;
      this.groupForChange.categories.forEach(category => {
        if (category.categoryName == this.categoryInputValue) {
          notEquals = false;
        }
      });
      if (notEquals) {
        let category: Category = new Category();
        category.categoryName = this.categoryInputValue.substr(0, 40);
        category.glossaryId = this.glossaryId;
        this.groupForChange.categories.push(category);
      }
      this.categoryInputValue = '';
    }
  }

  chooseCategory(category: Category) {
    this.groupForChange.categories.push(category);
  }

  deleteCategoryFromGroup(category) {
    this.groupForChange.categories = this.groupForChange.categories.filter(a => a.id != category.id);
  }

  updateGroup() {
    this.glossaryService.updateGroup(this.groupForChange).subscribe((data: Group) => {
      this.group.categories = data.categories;
      this.group.comment = data.comment;
      this.isUpdateGroupModalVisible = false;
      this.group.categories.forEach(a => {
        if (this.indexOf(a, this.fullCategoryList) == -1) {
          this.fullCategoryList.push(a);
        }
      });
      this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('label.updated'), '');
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.update.group'));
      }
    });
  }

  showMore() {
    this.isFullText = !this.isFullText;
  }

  showMoreDescription() {
    this.isFullDescription = !this.isFullDescription;
  }

  deleteGroup() {
    this.glossaryService.deleteGroup(this.group.id).subscribe((data: any) => {
      this.dataService.reloadGlossaryGroups('true');
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.delete.group'));
      }
    });
  }
}
