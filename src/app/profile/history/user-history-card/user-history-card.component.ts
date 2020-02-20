import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { EnumHelper, UtilService, HistoryService, TokenService, History, Constants, Timings } from 'src/app/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import * as jsdiff from 'diff'

@Component({
  selector: 'tmc-user-history-card',
  templateUrl: './user-history-card.component.html',
  styleUrls: ['./user-history-card.component.css'],
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
export class UserHistoryCardComponent implements OnInit {

  @Input() history: History;
  private enum: EnumHelper;
  private isDropShown: boolean = false;
  private isRequestProcessing: boolean = false;

  private importedEvents: History[];
  private differenceArray: string[];

  constructor(
    private router: Router,
    private utilService: UtilService,
    private historyService: HistoryService,
    private tokenService: TokenService,
    private notification: NzNotificationService
  ) {
    this.enum = new EnumHelper();
    this.importedEvents = [];
  }

  ngOnInit() {
    this.history.user.imageToShow = '';
    this.utilService.getImageFromService(this.history.user);
    if (this.checkShowDiffer()) {
      if (this.history.currentValue == null) {
        this.history.currentValue = '';
      }
      if (this.history.newValue == null) {
        this.history.newValue = '';
      }
      this.differenceArray = jsdiff.diffChars(this.history.currentValue, this.history.newValue);
    }
  }

  checkTermAction() {
    const currentReg = new RegExp('(TERM)$', 'g');
    return currentReg.test(this.history.action);
  }

  checkDeleteAction() {
    const currentReg = new RegExp('(DELETE)', 'g');
    return currentReg.test(this.history.action);
  }

  checkFlushAction() {
    const currentReg = new RegExp('(FLUSH)', 'g');
    return currentReg.test(this.history.action);
  }

  checkProjectLandAction() {
    return this.history.action == Constants.ADD_PROJECT_LANG || this.history.action == Constants.DELETE_PROJECT_LANG || this.history.action == Constants.FLUSH_PROJECT_LANG;
  }

  checkContributorAction() {
    const currentReg = new RegExp('(CONTRIBUTOR)', 'g');
    return currentReg.test(this.history.action);
  }

  checkImportAction() {
    return this.history.action == Constants.IMPORT_TRANSLATIONS;
  }

  checkCreateProject() {
    return this.history.action == Constants.ADD_PROJECT;
  }

  checkImportActions() {
    return this.history.action == Constants.IMPORT_TRANSLATIONS || this.history.action == Constants.IMPORT_TERMS;
  }

  checkTermLangAction() {
    return this.history.action == Constants.EDIT || this.history.action == Constants.TRANSLATE || this.history.action == Constants.AUTO_TRANSLATE;
  }

  goToTerm() {
    this.router.navigateByUrl('/projects/' + this.history.project.id + '/terms?page=1&search=' + this.history.termLang.term.termValue);
  }

  searchTerm() {
    if (this.history.action == Constants.ADD_TERM) {
      this.router.navigateByUrl('/projects/' + this.history.project.id + '/terms?page=1&search=' + this.history.newValue);
    }
  }

  getBorderClass() {
    if (this.checkDeleteAction() || this.checkFlushAction()) {
      return 'delete-border';
    }
    if (this.checkImportActions()) {
      return 'import-border';
    }
    if(this.history.disabled) {
      return 'disabled-border';
    }
  }

  checkShowDiffer() {
    return this.checkTermLangAction() || this.history.action == Constants.EDIT_TERM;
  }

  hideImportedValues() {
    this.isDropShown = false;
    this.importedEvents = [];
  }

  showImportedValues() {
    this.isRequestProcessing = true;
    this.isDropShown = true;
    this.historyService.getChildHistoryEvents(this.history.project.id, this.history.id).subscribe((data: History[]) => {
      this.importedEvents = data;
      this.isRequestProcessing = false;
      this.importedEvents.forEach(a => {
        if (a.currentValue == null) {
          a.currentValue = '';
        }
        if (a.newValue == null) {
          a.newValue = '';
        }
        a.differenceArray = jsdiff.diffChars(a.currentValue, a.newValue);
      });
    }, error => {
      this.isRequestProcessing = false;
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.imported.values'));
      }
    });
  }

  getTimeTitle() {
    const difference: number = new Date().getTime() - new Date(this.history.date).getTime();
    switch (true) {
      case difference < Timings.MINUTE_TIME: {
        return this.utilService.getTranslation('label.less.than.minute.ago');
      }
      case difference < Timings.HOUR_TIME: {
        return Math.floor(difference / Timings.MINUTE_TIME) + ' ' + this.utilService.getTranslation('label.minute.ago.' +
          this.utilService.getCountTitleSufix(Math.floor(difference / Timings.MINUTE_TIME)))
      }
      case difference < Timings.DAY_TIME: {
        return Math.floor(difference / Timings.HOUR_TIME) + ' ' + this.utilService.getTranslation('label.hour.ago.' +
          this.utilService.getCountTitleSufix(Math.floor(difference / Timings.HOUR_TIME)))
      }
      case difference < Timings.MONTH_TIME: {
        return Math.floor(difference / Timings.DAY_TIME) + ' ' + this.utilService.getTranslation('label.day.ago.' +
          this.utilService.getCountTitleSufix(Math.floor(difference / Timings.DAY_TIME)))
      }
      case difference < Timings.YEAR_TIME: {
        return Math.floor(difference / Timings.MONTH_TIME) + ' ' + this.utilService.getTranslation('label.month.ago.' +
          this.utilService.getCountTitleSufix(Math.floor(difference / Timings.MONTH_TIME)))
      }
      default: {
        return this.utilService.getTranslation('label.more.than.year.ago');
      }
    }
  }
  
  goToLang() {
    if (!this.history.projectLang.isDeleted) {
      this.router.navigateByUrl('/projects/' + this.history.project.id + '/langs/' + this.history.projectLang.id + '?page=1');
    }
  }

}
