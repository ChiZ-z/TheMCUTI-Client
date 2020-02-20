import { Component, OnInit, Input } from '@angular/core';
import { UserService, ContributorService, UtilService, UserLang, TokenService, EnumHelper, Constants, DataService } from 'src/app/core';
import { NzNotificationService } from 'ng-zorro-antd';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'tmc-user-lang-card',
  templateUrl: './user-lang-card.component.html',
  styleUrls: ['./user-lang-card.component.css']
})
export class UserLangCardComponent implements OnInit {

  //Modal visibility variables
  private isEditLangModalVisible: boolean = false;

  //Forms
  private editLangForm: FormGroup;

  //Additional variables
  private enum: EnumHelper = new EnumHelper();

  @Input() userLang: UserLang;

  constructor(
    private userService: UserService,
    private notification: NzNotificationService,
    private contributorService: ContributorService,
    private tokenService: TokenService,
    private utilService: UtilService,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.editLangForm = new FormGroup({
      'level': new FormControl(this.userLang.level, [
        Validators.required,
        Validators.pattern('[\\da-zA-Zа-яА-Я.,\\-\\s<>:;?!()]{1,200}')
      ])
    });
  }

  emitReloadFilter() {
    //this.dataService.reloadProfile('true');
    this.dataService.reloadInfo('true');
  }

  deleteLang() {
    this.userService.deleteLang(this.userLang).subscribe((data: any) => {
      this.emitReloadFilter();
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.delete.lang'));
      }
    });
  }

  showEditModal() {
    this.isEditLangModalVisible = true;
  }

  closeEditModal() {
    this.isEditLangModalVisible = false;
  }

  editLang() {
    for (const i in this.editLangForm.controls) {
      this.editLangForm.controls[i].markAsDirty();
      this.editLangForm.controls[i].updateValueAndValidity();
    }
    if (this.editLangForm.valid) {
      this.userLang.level = this.editLangForm.get('level').value;
      this.userService.updateUserLang(this.userLang).subscribe((data: any) => {
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('label.updated'), '');
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.update.user.lang'));
        }
      });
      this.isEditLangModalVisible = false;
    }
  }
}
