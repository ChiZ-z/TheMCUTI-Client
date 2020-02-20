import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { TermLang, UtilService, ProjectLangService, TokenService, EnumHelper, Constants, DataService, HistoryService, History, UserService, User, TermComment, ProjectTermService } from 'src/app/core';
import { NzNotificationService } from 'ng-zorro-antd';
import { trigger, state, transition, style, animate } from '@angular/animations';
import * as jsdiff from 'diff'

@Component({
  selector: 'tmc-translation-card',
  templateUrl: './translation-card.component.html',
  styleUrls: ['./translation-card.component.css'],
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
export class TranslationCardComponent implements OnInit {

  //Support variables
  private isEditing: boolean = false;
  private enum: EnumHelper;
  private historyList: History[];
  private currentUser: User;
  private commentValue: string = '';

  //Visibility variables
  private isHistoryVisible: boolean = false;
  private isRequestProcessing: boolean = false;
  private isCommentShown: boolean = false;

  @Input() translation: TermLang;
  @Input() currentLangId: number;
  @Input() referenceId: number;

  constructor(
    private utilService: UtilService,
    private notification: NzNotificationService,
    private langService: ProjectLangService,
    private tokenService: TokenService,
    private dataService: DataService,
    private historyService: HistoryService,
    private userService: UserService,
    private termService: ProjectTermService
  ) {
    this.enum = new EnumHelper();
    this.historyList = [];
  }

  ngOnInit() {
    if (this.translation.modifier.profilePhoto) {
      this.translation.modifier.imageToShow = '';
      this.utilService.getImageFromService(this.translation.modifier);
    }
    this.translation.buffer = '';
  }

  emitActionToReloadProgress() {
    this.dataService.reloadLangProgress('true');
  }

  checkFlag(flag: string): boolean {
    return this.translation.flags.indexOf(flag) != -1 ? true : false;
  }

  dropFlag(flag: string) {
    let index = this.translation.flags.indexOf(flag);
    if (index != -1) {
      this.translation.flags.splice(index, 1);
    }
  }

  chooseUpdate() {
    this.isEditing = true;
    this.translation.buffer = this.translation.value;
  }

  updateTranslationsValue() {
    this.translation.buffer = this.translation.buffer.trim();
    if (this.translation.buffer != this.translation.value || this.translation.saveError) {
      this.translation.value = this.translation.buffer;
      this.translation.buffer = '';
      this.translation.isRequestProcessing = true;
      this.langService.updateTermLangValue(this.translation.id, this.translation.value).subscribe((data: TermLang) => {
        this.translation.flags = data.flags;
        if (this.translation.modifier.id != data.modifier.id) {
          this.translation.modifier = data.modifier;
          this.utilService.getImageFromService(data.modifier);
        }
        this.translation.modifiedDate = data.modifiedDate;
        this.translation.saveError = false;
        this.translation.isRequestProcessing = false;
        this.emitActionToReloadProgress();
      }, error => {
        this.translation.isRequestProcessing = false;
        this.tokenService.checkErrorAll(error.status);
        this.translation.saveError = true;
      });
    }
    this.isEditing = false;
  }

  fuzzy() {
    if (this.translation.value != '') {
      const status: boolean = !this.checkFlag(this.enum.constants.FUZZY);
      this.langService.fuzzy(this.translation.id, status).subscribe((data: any) => {
        if (status == true) this.translation.flags.push(this.enum.constants.FUZZY);
        else this.dropFlag(this.enum.constants.FUZZY);
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.mark.fuzzy'));
        }
      });
    }
    else {
      this.notification.create(Constants.WARNING, this.utilService.getTranslation(Constants.WARNING_TITLE), this.utilService.getTranslation('cannot.mark.fuzzy'));
    }
  }

  getFuzzyTitle() {
    return this.checkFlag(this.enum.constants.FUZZY) ? 'unmark.fuzzy' : 'mark.fuzzy';
  }

  autoTranslate() {
    if (this.translation.term.referenceValue != '' && this.translation.term.referenceValue != null) {
      this.translation.isRequestProcessing = true;
      this.langService.autoTranslateTermLang(this.currentLangId, this.translation.id, this.referenceId)
        .subscribe((data: TermLang) => {
          this.translation.value = data.value;
          this.translation.flags = data.flags;
          this.translation.modifiedDate = data.modifiedDate;
          if (this.translation.modifier.id != data.modifier.id) {
            this.translation.modifier = data.modifier;
            this.utilService.getImageFromService(data.modifier);
          }
          this.emitActionToReloadProgress();
          this.translation.isRequestProcessing = false;
        }, error => {
          this.tokenService.checkErrorAll(error.status);
          this.translation.isRequestProcessing = false;
          if (this.tokenService.validateToken()) {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.auto.translate'));
          }
        });
    }
    else {
      this.notification.create(Constants.WARNING, this.utilService.getTranslation(Constants.WARNING_TITLE), this.utilService.getTranslation('info.ref.empty'));
    }
  }

  selectTranslation() {
    this.translation.selected = !this.translation.selected;
  }

  showTranslationHistory() {
    this.isCommentShown = false;
    this.historyList = [];
    this.isRequestProcessing = true;
    this.historyService.getTermLangHistory(this.translation.term.projectId, this.translation.id).subscribe((data: History[]) => {
      this.isHistoryVisible = true;
      this.historyList = data;
      this.historyList.forEach(a => {
        if (a.currentValue == null) {
          a.currentValue = '';
        }
        if (a.newValue == null) {
          a.newValue = '';
        }
        a.differenceArray = jsdiff.diffChars(a.currentValue, a.newValue);
      });
      this.isRequestProcessing = false;
    }, error => {
      this.isRequestProcessing = false;
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.translation.history'));
      }
    });
  }

  hideTranslationHistory() {
    this.isHistoryVisible = false;
  }

  restoreValue(hist: History) {
    this.langService.updateTermLangValue(this.translation.id, hist.newValue).subscribe((data: TermLang) => {
      this.translation.flags = data.flags;
      this.translation.value = hist.newValue;
      if (this.translation.modifier.id != data.modifier.id) {
        this.translation.modifier = data.modifier;
        this.utilService.getImageFromService(data.modifier);
      }
      this.translation.modifiedDate = data.modifiedDate;
      this.translation.saveError = false;
      this.translation.isRequestProcessing = false;
      this.emitActionToReloadProgress();
    }, error => {
      this.translation.isRequestProcessing = false;
      this.tokenService.checkErrorAll(error.status);
      this.translation.saveError = true;
    });
  }

  showTermComments() {
    this.isHistoryVisible = false;
    if (!this.isCommentShown) {
      this.getUserForComment();
      this.termService.getTermComments(this.translation.term.id).subscribe((data: TermComment[]) => {
        this.translation.term.comments = data;
        this.translation.term.comments.forEach(a => {
          if (a.author.profilePhoto) {
            a.author.imageToShow = '';
            this.utilService.getImageFromService(a.author);
          }
        });
        this.isCommentShown = !this.isCommentShown;
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE),
            this.utilService.getTranslation('error.cannot.get.term.comments'));
        }
      });
    } else {
      this.translation.term.comments = [];
      this.isCommentShown = !this.isCommentShown;
    }
  }

  getUserForComment() {
    this.userService.getUser().subscribe((data: User) => {
      this.currentUser = data;
      this.currentUser.imageToShow = '';
      this.utilService.getImageFromService(data);
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      this.currentUser = new User();
    });
  }

  addComment() {
    this.commentValue = this.commentValue.trim();
    if (this.commentValue != '') {
      this.termService.addTermComment(this.translation.term.id, this.commentValue).subscribe((data: TermComment) => {
        this.translation.term.commentsCount++;
        this.commentValue = '';
        this.translation.term.comments.splice(0, 0, data);
        if (data.author.profilePhoto) {
          this.utilService.getImageFromService(data.author);
        }
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.add.comment'));
        }
      });
    }
  }

  deleteComment(comment: TermComment) {
    this.termService.deleteTermComment(comment).subscribe((data: any) => {
      this.translation.term.commentsCount--;
      const index: number = this.translation.term.comments.indexOf(comment);
      if (index != -1) {
        this.translation.term.comments.splice(index, 1);
      }
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.delete.comment'));
      }
    });
  }

  checkDeleteRights(comment: TermComment) {
    return +this.tokenService.getUserId() == comment.author.id;
  }

  showDropFlagAlert(template: TemplateRef<{}>) {
    this.notification.template(template, { nzDuration: 20000 });
  }

  dropDefFlag() {
    this.langService.dropFlag(this.translation.id).subscribe((data: TermLang) => {
      this.translation.flags = data.flags;
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.drop.flag'));
      }
    });
    this.notification.remove();
  }

}
