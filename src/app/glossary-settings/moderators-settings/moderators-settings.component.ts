import { Component, OnInit } from '@angular/core';
import { GlossaryService, TokenService, UtilService, DataService, EnumHelper, Glossary, Constants } from 'src/app/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { FormGroup, FormGroupName, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'tmc-moderators-settings',
  templateUrl: './moderators-settings.component.html',
  styleUrls: ['./moderators-settings.component.css']
})
export class ModeratorsSettingsComponent implements OnInit {

  private glossary: Glossary;
  private currentGlossaryId: number = -1;
  private enum: EnumHelper;

  private isAddModeratorBlock: boolean = false;
  private isMessageSending: boolean = false;
  private addModeratorForm: FormGroup;

  constructor(
    private glossaryService: GlossaryService,
    private tokenService: TokenService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private utilService: UtilService,
    private notification: NzNotificationService,
    private dataService: DataService
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    if (this.tokenService.validateToken()) {
      this.currentGlossaryId = +this.activatedRoute.parent.parent.parent.parent.snapshot.paramMap.get('id');
      this.getGlossary();
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  getGlossary() {
    this.glossaryService.getGlossaryForSettings(this.currentGlossaryId).subscribe((data: Glossary) => {
      this.glossary = data;
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.glossary.settings'));
      }
    });
  }

  showAddModerator() {
    this.isAddModeratorBlock = true;
    this.addModeratorForm = new FormGroup({
      'firstName': new FormControl(null, Validators.required),
      'email': new FormControl(null, Validators.required)
    });
  }

  closeAddForm() {
    this.isAddModeratorBlock = false;
  }

  sendInvite() {
    let firstName: string = this.addModeratorForm.get('firstName').value;
    let email: string = this.addModeratorForm.get('email').value;
    this.addModeratorForm.setValue({
      'firstName': firstName ? firstName.trim() : '',
      'email': email ? email.trim() : ''
    });
    for (const i in this.addModeratorForm.controls) {
      this.addModeratorForm.controls[i].markAsDirty();
      this.addModeratorForm.controls[i].updateValueAndValidity();
    }
    if (this.addModeratorForm.valid) {
      firstName = this.addModeratorForm.get('firstName').value;
      email = this.addModeratorForm.get('email').value;
      this.isMessageSending = true;
      this.glossaryService.sendInvitation(this.currentGlossaryId, firstName, email).subscribe((data: any) => {
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('label.invitation.sent'), '');
        this.isMessageSending = false;
        this.isAddModeratorBlock = false;
      }, error => {
        this.isMessageSending = false;
        // this.isAddModeratorBlock = false;
        this.tokenService.checkErrorWithout404(error.status);
        if (this.tokenService.validateToken()) {
          if (error.status == 404) {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.user.not.found'));
          } else if (error.status == 421) {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.invitation.sent'));
          } else if (error.status == 422) {
            this.notification.create(Constants.WARNING, this.utilService.getTranslation(Constants.WARNING_TITLE), this.utilService.getTranslation('warning.moderator.exists'));
          } else {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.send.invitation'));
          }
        }
      });
    }
  }

}
