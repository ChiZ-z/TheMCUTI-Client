import { Component, OnInit, Input } from '@angular/core';
import { UserLang, User, TokenService, UserService, UtilService, Lang, ProjectService, EnumHelper, JobExperience, Constants, Contact, DataService } from 'src/app/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators, FormGroupName } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'tmc-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {

  //User variables
  private user: User;
  private username: string = '';

  //Alerts variables
  private noLangs: boolean = false;
  private noContacts: boolean = false;
  private noJobs: boolean = false;

  //Visibility variables
  private isAddLangModalVisible: boolean = false;
  private isAddExperienceModalVisible: boolean = false;
  private isAddContactModalVisible: boolean = false;

  //Forms
  private addLangForm: FormGroup;
  private addContactForm: FormGroup;
  private addExperienceForm: FormGroup;

  //Additional variables
  private langs: Lang[];
  private enum: EnumHelper;

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    private utilService: UtilService,
    private projectService: ProjectService,
    private dataService: DataService
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    this.dataService.doReloadInfo$.subscribe((data: any) => {
      if (this.username != '' && this.username) {
        this.getUserByUsername();
      } else {
        this.getUser();
      }
    });
    if (this.tokenService.validateToken()) {
      this.username = this.route.parent.parent.parent.snapshot.paramMap.get('username');
      if (this.username != '' && this.username) {
        this.getUserByUsername();
      } else {
        this.getUser();
      }
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  emitReloadProfile() {
    this.dataService.reloadProfile('true');
  }

  isCurrentUserProfile(): boolean {
    return +this.tokenService.getUserId() == this.user.id;
  }

  getUser() {
    this.user = new User();
    this.userService.getUser().subscribe((data: User) => {
      this.user = data;
      this.checkLabels();
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.user'));
      }
    });
    this.initForms();
  }

  getUserByUsername() {
    this.user = new User();
    this.userService.getUserByUsername(this.username).subscribe((data: User) => {
      this.user = data;
      this.checkLabels();
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.user'));
      }
    });
    this.initForms();
  }

  checkLabels() {
    if (this.user.langs.length > 0) {
      this.noLangs = false;
    } else {
      this.noLangs = true;
    }
    if (this.user.contacts.length > 0) {
      this.noContacts = false;
    } else {
      this.noContacts = true;
    }
    if (this.user.jobs.length > 0) {
      this.noJobs = false;
    } else {
      this.noJobs = true;
    }
  }

  initForms() {
    this.addLangForm = new FormGroup({
      'langId': new FormControl(null, Validators.required),
      'level': new FormControl(null, [
        Validators.required,
        Validators.pattern('[\\da-zA-Zа-яА-Я.,\\-\\s<>:;?!()]{1,200}')
      ])
    });
    this.addContactForm = new FormGroup({
      'type': new FormControl(null, Validators.required),
      'contactValue': new FormControl(null, [
        Validators.required,
        Validators.pattern('[+\\d@a-zA-Z_.\\-]{1,30}')
      ])
    });
    this.addExperienceForm = new FormGroup({
      'place': new FormControl(null, [
        Validators.required,
        Validators.pattern('[\\da-zA-Zа-яА-Я.,\\-\\s]{1,70}')
      ]),
      'position': new FormControl(null, [
        Validators.required,
        Validators.pattern('[\\da-zA-Zа-яА-Я.,\\-\\s]{1,70}')
      ]),
      'activity': new FormControl(null, [
        Validators.required,
        Validators.pattern('.{1,2000}')
      ]),
      'period': new FormControl(null, [
        Validators.required,
        Validators.pattern('[/\\da-zA-Zа-яА-Я.,\\-\\s]{1,70}')
      ]),
    });
  }

  showAddLangModal() {
    this.addLangForm.reset();
    this.projectService.getFreeUserLangs().subscribe((data: Lang[]) => {
      this.langs = data;
      this.utilService.sortLangList(this.langs);
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.langs'));
      }
    });
    this.isAddLangModalVisible = true;
  }

  closeAddLangModal() {
    this.isAddLangModalVisible = false;
  }

  addUserLang() {
    for (const i in this.addLangForm.controls) {
      this.addLangForm.controls[i].markAsDirty();
      this.addLangForm.controls[i].updateValueAndValidity();
    }
    if (this.addLangForm.valid) {
      const id: number = this.addLangForm.get('langId').value;
      const level: string = this.addLangForm.get('level').value;
      this.userService.addLang(id, level).subscribe((data: UserLang) => {
        this.user.langs.push(data);
        this.emitReloadProfile();
        this.noLangs = false;
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          if (error.status == 400) {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.user.lang.exists'));
          } else {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.add.user.lang'));
          }
        }
      });
      this.isAddLangModalVisible = false;
    }
  }

  showAddContactModal() {
    this.addContactForm.reset();
    this.isAddContactModalVisible = true;
  }

  closeAddContactModal() {
    this.isAddContactModalVisible = false;
  }

  addUserContact() {
    for (const i in this.addContactForm.controls) {
      this.addContactForm.controls[i].markAsDirty();
      this.addContactForm.controls[i].updateValueAndValidity();
    }
    if (this.addContactForm.valid) {
      const type: Constants = this.addContactForm.get('type').value;
      const value: string = this.addContactForm.get('contactValue').value;
      this.userService.addContact(type, value).subscribe((data: Contact) => {
        this.user.contacts.push(data);
        this.emitReloadProfile();
        this.noContacts = false;
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.add.contact'));
        }
      });
      this.isAddContactModalVisible = false;
    }
  }

  showAddExperienceModal() {
    this.addExperienceForm.reset();
    this.isAddExperienceModalVisible = true;
  }

  closeAddExperienceModal() {
    this.isAddExperienceModalVisible = false;
  }

  addExperience() {
    this.trimExperience();
    for (const i in this.addExperienceForm.controls) {
      this.addExperienceForm.controls[i].markAsDirty();
      this.addExperienceForm.controls[i].updateValueAndValidity();
    }
    if (this.addExperienceForm.valid) {
      const company: string = this.addExperienceForm.get('place').value;
      const period: string = this.addExperienceForm.get('period').value;
      const activity: string = this.addExperienceForm.get('activity').value;
      const position: string = this.addExperienceForm.get('position').value;
      const job: JobExperience = {
        id: null,
        workPlace: company,
        workingPeriod: period,
        activity: activity,
        position: position,
        activityError: false,
        periodError: false,
        placeError: false,
        positionError: false,
        buffer: ''
      }
      this.userService.addJob(job).subscribe((data: JobExperience) => {
        this.user.jobs.push(data);
        this.emitReloadProfile();
        this.noJobs = false;
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.add.experience'));
        }
      });
      this.isAddExperienceModalVisible = false;
    }
  }

  trimExperience() {
    let company: string = this.addExperienceForm.get('place').value;
    let period: string = this.addExperienceForm.get('period').value;
    let activity: string = this.addExperienceForm.get('activity').value;
    let position: string = this.addExperienceForm.get('position').value;
    this.addExperienceForm.setValue({
      'place': company ? company.trim() : '',
      'period': period ? period.trim() : '',
      'activity': activity ? activity.trim() : '',
      'position': position ? position.trim() : ''
    });
  }

}
