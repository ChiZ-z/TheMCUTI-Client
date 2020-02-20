import { Component, OnInit, Input } from '@angular/core';
import { ProjectContributor, UserService, User, ContributorService, ResultStat, UtilService, TokenService, Constants, EnumHelper, DataService } from 'src/app/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'tmc-contributor-card',
  templateUrl: './contributor-card.component.html',
  styleUrls: ['./contributor-card.component.css'],
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
export class ContributorCardComponent implements OnInit {

  @Input() contributor: ProjectContributor;
  @Input() currentUserRole: Constants;

  //Support variables
  private currentProjectId: number;
  private showStats: boolean = false;
  private stats: ResultStat;
  private enum: EnumHelper;

  //Forms and modals variables
  private notifyForm: FormGroup;
  private changeForm: FormGroup;
  private isMessageSending: boolean = false;
  private isChangeRoleVisible: boolean = false;
  private isNotifyVisible: boolean = false;

  constructor(
    private userService: UserService,
    private notification: NzNotificationService,
    private contributorService: ContributorService,
    private tokenService: TokenService,
    private route: ActivatedRoute,
    private utilService: UtilService,
    private dataService: DataService
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    this.currentProjectId = +this.route.parent.parent.parent.snapshot.paramMap.get('id');
    if (this.contributor) {
      this.contributor.contributor.imageToShow = '';
      this.utilService.getImageFromService(this.contributor.contributor);
    }
    this.initForm();
  }

  selectContributor() {
    this.contributor.selected = !this.contributor.selected;
  }

  showContributorStats() {
    this.showStats = !this.showStats;
    if (this.showStats) {
      this.contributorService.getContributorStats(this.contributor.contributor.id, this.currentProjectId).subscribe((data: ResultStat) => {
        this.stats = data;
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.contributor.stats'));
        }
      });
    }
  }

  emitActionToRefilterList() {
    this.dataService.refilterContributors('true');
  }

  deleteContributor() {
    this.contributorService.deleteContributorFromProject(this.contributor.id).subscribe((data: any) => {
      this.emitActionToRefilterList();
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.delete.contributor'));
      }
    });
  }

  showNotificationModal() {
    this.notifyForm.reset();
    this.isNotifyVisible = true;
  }

  initForm() {
    this.notifyForm = new FormGroup({
      'message': new FormControl(null,
        Validators.required)
    });
    this.changeForm = new FormGroup({
      'role': new FormControl(null,
        Validators.required)
    });
  }

  handleNotifyModalOk() {
    this.trimNotification();
    for (const i in this.notifyForm.controls) {
      this.notifyForm.controls[i].markAsDirty();
      this.notifyForm.controls[i].updateValueAndValidity();
    }
    if (this.notifyForm.valid) {
      const message: string = this.notifyForm.get('message').value;
      this.isMessageSending = true;
      this.contributorService.notify(this.currentProjectId, message, this.contributor).subscribe((data: any) => {
        this.isNotifyVisible = false;
        this.initForm();
        this.isMessageSending = false;
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('info.notification.sent'), '');
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.notify'));
        }
      });
    }
  }

  trimNotification() {
    let msg: string = this.notifyForm.get('message').value;
    this.notifyForm.setValue({
      'message': msg && msg.trim() ? msg : ''
    });
  }

  handleNotifyModalCancel() {
    this.isNotifyVisible = false;
  }

  showChangeModal() {
    this.changeForm.reset();
    this.isChangeRoleVisible = true;
  }

  handleChangeModalCancel() {
    this.isChangeRoleVisible = false;
  }

  handleChangeModalOk() {
    for (const i in this.changeForm.controls) {
      this.changeForm.controls[i].markAsDirty();
      this.changeForm.controls[i].updateValueAndValidity();
    }
    if (this.changeForm.valid) {
      const role: Constants = this.changeForm.get('role').value;
      this.contributorService.update(this.contributor.id, role).subscribe((data: any) => {
        this.contributor.role = role;
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('role.has.been.updated'), '');
        this.isChangeRoleVisible = false;
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.update.role'));
        }
      });
    }
  }
}
