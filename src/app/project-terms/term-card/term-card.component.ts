import { Component, OnInit, Input } from '@angular/core';
import { Term, ProjectTermService, UtilService, User, UserService, TermLang, ProjectLangService, TokenService, TermComment, Constants, EnumHelper, DataService } from 'src/app/core';
import { ClipboardService } from 'ngx-clipboard';
import { NzNotificationService } from 'ng-zorro-antd';
import { I18nService } from 'src/app/core/services/i18n.service';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  selector: 'tmc-term-card',
  templateUrl: './term-card.component.html',
  styleUrls: ['./term-card.component.css'],
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
export class TermCardComponent implements OnInit {

  @Input() term: Term;
  @Input() langsCount: number;
  @Input() currentProjectId: number;
  @Input() userRole: Constants;

  private isCommentShown: boolean = false;
  private isTranslationsShown: boolean = false;
  private currentEditTermId: number = -1;
  private isTermEditing: boolean = false;
  private newTermLangValue: string = '';
  private currentUser: User;
  private commentValue: string = '';
  private enum: EnumHelper;

  constructor(
    private termService: ProjectTermService,
    private utilService: UtilService,
    private userService: UserService,
    private projectLangService: ProjectLangService,
    private tokenService: TokenService,
    private clipService: ClipboardService,
    private notification: NzNotificationService,
    protected i18nService: I18nService,
    private dataService: DataService
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
  }

  selectTerm() {
    this.term.selected = !this.term.selected;
  }

  showTermTranslations() {
    this.isCommentShown = false;
    if (!this.isTranslationsShown) {
      this.termService.getTermTranslations(this.term.id).subscribe((data: TermLang[]) => {
        this.term.translations = data;
        this.term.translations.forEach(a => {
          if (a.modifier.profilePhoto) {
            a.modifier.imageToShow = '';
            this.utilService.getImageFromService(a.modifier);
          }
        });
        this.isTranslationsShown = !this.isTranslationsShown;
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE),
            this.utilService.getTranslation('error.cannot.get.term.translations'));
        }
      });
    } else {
      this.term.translations = [];
      this.isTranslationsShown = !this.isTranslationsShown;
    }
  }

  showTermComments() {
    this.isTranslationsShown = false;
    if (!this.isCommentShown) {
      this.getUserForComment();
      this.termService.getTermComments(this.term.id).subscribe((data: TermComment[]) => {
        this.term.comments = data;
        this.term.comments.forEach(a => {
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
      this.term.comments = [];
      this.isCommentShown = !this.isCommentShown;
    }
  }

  emitActionToReloadTerms() {
    this.dataService.refilterProjectTerms('true');
  }

  emitActionToReloadProgress() {
    this.dataService.reloadProjectInfo('true');
  }

  deleteTerm() {
    this.termService.deleteTerm(this.term.id, this.currentProjectId).subscribe((data: any) => {
      this.emitActionToReloadTerms();
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.delete.term'));
      }
    });
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

  chooseTermLangIdToUpdate(termLang: TermLang) {
    this.currentEditTermId = termLang.id;
    termLang.buffer = termLang.value;
  }

  updateTermLangValue(term: TermLang) {
    this.currentEditTermId = -1;
    term.buffer = term.buffer.trim();
    if (term.buffer != term.value) {
      term.value = term.buffer;
      term.buffer = '';
      this.projectLangService.updateTermLangValue(term.id, term.value)
        .subscribe((data: TermLang) => {
          term.flags = data.flags;
          if (term.modifier.id != data.modifier.id) {
            term.modifier = data.modifier;
            this.utilService.getImageFromService(data.modifier);
          }
          term.modifiedDate = data.modifiedDate;
          term.saveError = false;
          this.emitActionToReloadProgress();
          this.updateTermInfo();
        }, error => {
          this.tokenService.checkErrorAll(error.status);
          term.saveError = true;
        });
    }
  }

  updateTermInfo() {
    let count = 0;
    if (this.term.translations) {
      this.term.translations.forEach(a => {
        if (a.value != '') {
          count++;
        }
      });
      this.term.translatedCount = count;
    }
  }

  addComment() {
    this.commentValue = this.commentValue.trim();
    if (this.commentValue != '') {
      this.termService.addTermComment(this.term.id, this.commentValue).subscribe((data: TermComment) => {
        this.term.commentsCount++;
        this.commentValue = '';
        this.term.comments.splice(0, 0, data);
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
      this.term.commentsCount--;
      const index: number = this.term.comments.indexOf(comment);
      if (index != -1) {
        this.term.comments.splice(index, 1);
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

  editTermValue() {
    this.isTermEditing = true;
    this.term.buffer = this.term.termValue;
  }

  updateTermValue() {
    this.isTermEditing = false;
    this.term.buffer = this.term.buffer.trim();
    if ((this.term.buffer != this.term.termValue || this.term.saveError) && this.term.buffer) {
      const buf: string = this.term.termValue;
      this.term.termValue = this.term.buffer;
      this.termService.updateTermValue(this.term).subscribe((data: any) => {
        this.term.saveError = false;
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (error.status == 400) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.term.exists'));
          this.term.termValue = buf;
        } else if (error.status == 424) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.term.value.too.long'));
          this.term.saveError = true;
        } else {
          this.term.saveError = true;
        }
      });
    } else if (this.term.buffer == '') {
      this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.term.empty'));
    }
  }
}
