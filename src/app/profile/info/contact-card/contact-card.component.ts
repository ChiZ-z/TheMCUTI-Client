import { Component, OnInit, Input } from '@angular/core';
import { UserService, ContributorService, UtilService, Contact, TokenService, Constants, DataService } from 'src/app/core';
import { NzNotificationService } from 'ng-zorro-antd';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'tmc-contact-card',
  templateUrl: './contact-card.component.html',
  styleUrls: ['./contact-card.component.css']
})
export class ContactCardComponent implements OnInit {

  //Modal visibility variables
  private isEditContactModalVisible: boolean = false;

  //Forms
  private editContactForm: FormGroup;

  @Input() contact: Contact;

  constructor(
    private userService: UserService,
    private notification: NzNotificationService,
    private contributorService: ContributorService,
    private tokenService: TokenService,
    private utilService: UtilService,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.editContactForm = new FormGroup({
      'contactValue': new FormControl(this.contact.contactValue, [
        Validators.required,
        Validators.pattern('[/+\\d@a-zA-Z_.\\-]{1,30}')
      ])
    });
  }

  emitReloadFilter() {
  //  this.dataService.reloadProfile('true');
    this.dataService.reloadInfo('true');
  }

  deleteContact() {
    this.userService.deleteContact(this.contact).subscribe((data: any) => {
      this.emitReloadFilter();
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.delete.contact'));
      }
    });
  }

  showEditModal() {
    this.isEditContactModalVisible = true;
  }

  closeEditModal() {
    this.isEditContactModalVisible = false;
  }

  editContact() {
    for (const i in this.editContactForm.controls) {
      this.editContactForm.controls[i].markAsDirty();
      this.editContactForm.controls[i].updateValueAndValidity();
    }
    if (this.editContactForm.valid) {
      this.contact.contactValue = this.editContactForm.get('contactValue').value;
      this.userService.updateUserContact(this.contact).subscribe((data: any) => {
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('label.updated'), '');
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.update.contact'));
        }
      });
      this.isEditContactModalVisible = false;
    }
  }
}
