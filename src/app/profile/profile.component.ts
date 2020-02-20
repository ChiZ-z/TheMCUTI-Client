import { Component, OnInit } from '@angular/core';
import { User, TokenService, UserService, UtilService, Constants, DataService } from '../core';
import { Tokens } from 'src/app/core';
import { Route } from '@angular/compiler/src/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'tmc-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  //User variables
  private user: User;
  private imageToShow: boolean;
  private starArray: number[];
  private currentTabIndex: number = 0;
  private username: string = '';

  //Forms
  private changeForm: FormGroup;
  private editNamesForm: FormGroup;
  private editUsernameForm: FormGroup;
  private editEmailForm: FormGroup;

  //Modals variables
  private isChangePasswordModalVisible: boolean = false;
  private isEditNamesModalVisible: boolean = false;
  private isEditUsernameModalVisible: boolean = false;
  private isEditEmailModalVisible: boolean = false;
  private isUploadModalVisible: boolean = false;
  private isDropModalVisible: boolean = false;

  //Info visible variables
  private emailExists: boolean = false;
  private emailFree: boolean = false;
  private usernameExists: boolean = false;
  private usernameFree: boolean = false;
  private isUploadProcessing: boolean = false;
  private passwordsNotEquals: boolean = false;
  private incorrectOldPass: boolean = false;

  //Image upload variables
  private showUpload: boolean = false;
  private imageChangedEvent: any = '';
  private croppedImage: any = '';
  private isImageLoaded: boolean = false;

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private notification: NzNotificationService,
    private router: Router,
    private utilService: UtilService,
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    this.router.events.subscribe((data: any) => {
      if (this.router.url.includes('info')) {
        this.currentTabIndex = 0;
      } else if (this.router.url.includes('statistics')) {
        this.currentTabIndex = 1;
      } else if (this.router.url.includes('history')) {
        this.currentTabIndex = 2;
      } else {
        this.currentTabIndex = 3;
      }
    });
  }

  showUploadText() {
    this.showUpload = true;
  }

  hideUploadText() {
    this.showUpload = false;
  }

  ngOnInit() {
    this.dataService.doReloadProfile$.subscribe((data: any) => {
      this.getUser();
    });
    if (this.tokenService.validateToken()) {
      this.user = new User();
      this.route.params.subscribe((data: any) => this.username = data['username']);
      if (this.username != '' && this.username) {
        this.getUserByUsername();
      } else {
        this.getUser();
      }
      this.initForms();
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  getUserByUsername() {
    this.userService.getUserByUsername(this.username).subscribe((data: User) => {
      this.user = data;
      if (this.user) {
        this.user.imageToShow = '';
        this.utilService.getImageFromService(this.user);
      }
      this.createStarArray();
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.user'));
      }
    });
  }

  getUser() {
    this.userService.getUser().subscribe((data: User) => {
      this.user = data;
      if (this.user) {
        this.user.imageToShow = '';
        this.utilService.getImageFromService(this.user);
      }
      this.createStarArray();
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.user'));
      }
    });
  }

  isCurrentUserProfile(): boolean {
    return +this.tokenService.getUserId() == this.user.id;
  }

  initForms() {
    this.changeForm = new FormGroup({
      'oldPassword': new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z\\d\\._]{6,27}$')
      ]),
      'newPassword': new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z\\d\\._]{6,27}$')
      ]),
      'repeatPassword': new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z\\d\\._]{6,27}$')
      ]),
    });
    this.editNamesForm = new FormGroup({
      'name': new FormControl(this.user.firstName, [
        Validators.required,
        Validators.pattern('^[a-zA-Zа-яА-Я]{4,27}')
      ]),
      'surname': new FormControl(this.user.lastName, [
        Validators.required,
        Validators.pattern('^[a-zA-Zа-яА-Я]{4,27}')
      ])
    });
    this.editEmailForm = new FormGroup({
      'email': new FormControl(null, [
        Validators.required,
        Validators.pattern('^([\\w\\-\\.]+)@((\\[([0-9]{1,3}\\.){3}[0-9]{1,3}\\])|(([\\w\-]+\\.)+)([a-zA-Z]{2,4}))$')
      ])
    });
    this.editUsernameForm = new FormGroup({
      'username': new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z\\d\\._]{4,27}$')
      ])
    });
  }

  activateRouterLink(link: string) {
    if (this.username != '' && this.username) {
      this.router.navigateByUrl('/profile/' + this.username + link);
    }
    else {
      this.router.navigateByUrl('/profile' + link);
    }
  }

  getUserRating() {
    if (!this.user.resultStat) return 0;
    return Math.ceil(this.user.resultStat.rating * 100);
  }

  createStarArray() {
    this.starArray = [];
    for (let i = 0; i < 5; i++) {
      if (i < Math.ceil(this.getUserRating() / 20)) {
        this.starArray.push(1);
      } else {
        this.starArray.push(0);
      }
    }
  }

  showChangePasswordModal() {
    this.changeForm.reset();
    this.isChangePasswordModalVisible = true;
  }

  closeChangeModal() {
    this.isChangePasswordModalVisible = false;
  }

  changePassword() {
    for (const i in this.changeForm.controls) {
      this.changeForm.controls[i].markAsDirty();
      this.changeForm.controls[i].updateValueAndValidity();
    }
    if (this.changeForm.valid) {
      this.passwordsNotEquals = false;
      this.incorrectOldPass = false;
      const oldPass: string = this.changeForm.get('oldPassword').value;
      const newPass: string = this.changeForm.get('newPassword').value;
      const repeatPass: string = this.changeForm.get('repeatPassword').value;
      if (newPass != repeatPass) {
        this.passwordsNotEquals = true;
      } else {
        this.user.password = newPass;
        this.user.oldPassword = oldPass;
        this.user.repeatPassword = repeatPass;
        this.userService.changePassword(this.user).subscribe((data: any) => {
          this.isChangePasswordModalVisible = false;
          this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('password.changed'), '');
        }, error => {
          this.tokenService.checkErrorAll(error.status);
          if (this.tokenService.validateToken()) {
            if (error.status == 422) {
              this.incorrectOldPass = true;
            } else {
              this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.change.password'));
            }
          }
        });
      }
    }
  }

  showEditNamesModal() {
    this.editNamesForm.setValue({
      'name': this.user.firstName,
      'surname': this.user.lastName
    });
    this.isEditNamesModalVisible = true;
  }

  closeEditNamesModal() {
    this.isEditNamesModalVisible = false;
  }

  editNames() {
    for (const i in this.editNamesForm.controls) {
      this.editNamesForm.controls[i].markAsDirty();
      this.editNamesForm.controls[i].updateValueAndValidity();
    }
    if (this.editNamesForm.valid) {
      this.user.firstName = this.editNamesForm.get('name').value;
      this.user.lastName = this.editNamesForm.get('surname').value;
      this.userService.updateUser(this.user).subscribe((data: any) => {
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('label.updated'), '');
        this.isEditNamesModalVisible = false;
        this.dataService.reloadUserForHeader('true');
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.update.user'));
        }
      });
    }
  }

  showEditEmailModal() {
    this.editEmailForm.setValue({
      'email': this.user.email
    });
    this.editEmailForm.get('email').valueChanges.subscribe((data: any) => {
      const email: string = this.editEmailForm.get('email').value;
      if (this.user.email != email && this.editEmailForm.get('email').valid) {
        this.userService.checkEmail(email).subscribe((data: boolean) => {
          this.emailFree = data;
          this.emailExists = !data;
        });
      } else {
        this.emailFree = false;
        this.emailExists = false;
      }
    });
    this.isEditEmailModalVisible = true;
  }

  closeEditEmailModal() {
    this.isEditEmailModalVisible = false;
  }

  editEmail() {
    this.emailExists = false;
    for (const i in this.editEmailForm.controls) {
      this.editEmailForm.controls[i].markAsDirty();
      this.editEmailForm.controls[i].updateValueAndValidity();
    }
    const email: string = this.editEmailForm.get('email').value;
    if (email == this.user.email) {
      this.isEditEmailModalVisible = false;
    }
    if (this.editEmailForm.valid) {
      this.userService.updateEmail(email).subscribe((data: any) => {
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('label.updated'), '');
        this.user.email = email;
        this.isEditEmailModalVisible = false;
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          if (error.status == 400) {
            this.emailExists = true;
          } else {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.update.email'));
          }
        }
      });
    }
  }

  showEditUsernameModal() {
    this.editUsernameForm.setValue({
      'username': this.user.username
    });
    this.editUsernameForm.get('username').valueChanges.subscribe((data: any) => {
      const name: string = this.editUsernameForm.get('username').value;
      if (this.user.username != name && this.editUsernameForm.get('username').valid) {
        this.userService.checkUsername(name).subscribe((data: boolean) => {
          this.usernameFree = data;
          this.usernameExists = !data;
        });
      } else {
        this.usernameFree = false;
        this.usernameExists = false;
      }
    });
    this.isEditUsernameModalVisible = true;
  }

  closeEditUsernameModal() {
    this.isEditUsernameModalVisible = false;
  }

  editUsername() {
    this.usernameExists = false;
    for (const i in this.editUsernameForm.controls) {
      this.editUsernameForm.controls[i].markAsDirty();
      this.editUsernameForm.controls[i].updateValueAndValidity();
    }
    const name: string = this.editUsernameForm.get('username').value;
    if (name == this.user.username) {
      this.isEditUsernameModalVisible = false;
    }
    if (this.editUsernameForm.valid) {
      this.userService.updateUsername(name).subscribe((data: Tokens) => {
        const a: string = JSON.stringify(data);
        JSON.parse(a, (key, value) => {
          if (key === 'Token') {
            this.tokenService.setAccess(value);
          }
          if (key === 'Refresh') {
            this.tokenService.setRefresh(value);
          }
        });
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('label.updated'), '');
        this.user.username = name;
        this.isEditUsernameModalVisible = false;
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          if (error.status == 400) {
            this.usernameExists = true;
          } else {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.update.username'));
          }
        }
      });
    }
  }

  showUploadImageModal() {
    this.isUploadModalVisible = true;
  }

  closeUploadImageModal() {
    this.imageChangedEvent = '';
    this.croppedImage = '';
    this.isUploadModalVisible = false;
  }

  uploadImage() {
    if (this.isImageLoaded) {
      this.isUploadProcessing = true;
      this.user.avatar = this.croppedImage;
      this.userService.updateAvatar(+this.tokenService.getUserId(), this.user).subscribe((data: User) => {
        this.user = data;
        if (data.profilePhoto && data.profilePhoto != null) this.utilService.getImageFromService(this.user);
        this.isUploadModalVisible = false;
        this.dataService.reloadUserForHeader('true');
        this.isUploadProcessing = false;
      }, error => {
        this.isUploadProcessing = false;
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.upload.image'));
        }
      });
    } else {
      this.notification.create(Constants.WARNING, this.utilService.getTranslation(Constants.WARNING_TITLE), this.utilService.getTranslation('choose.file'));
    }
    this.imageChangedEvent = '';
    this.croppedImage = '';
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded() {
    this.isImageLoaded = true;
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    this.isImageLoaded = false;
  }

  showDropImageModal() {
    this.isDropModalVisible = true;
  }

  closeDropModal() {
    this.isDropModalVisible = false;
  }

  dropProfileImage() {
    this.userService.dropImage().subscribe((data: any) => {
      this.dataService.reloadUserForHeader('true');
      this.user.profilePhoto = '';
      this.user.imageToShow = '';
      this.isDropModalVisible = false;
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.delete.photo'));
      }
    });
  }

}
