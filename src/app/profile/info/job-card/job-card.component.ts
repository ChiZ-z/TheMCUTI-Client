import { Component, OnInit, Input } from '@angular/core';
import { UserService, ContributorService, UtilService, JobExperience, TokenService, Constants, DataService } from 'src/app/core';
import { NzNotificationService } from 'ng-zorro-antd';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'tmc-job-card',
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.css']
})
export class JobCardComponent implements OnInit {

  //Modal visibility variables
  private isEditExperienceModalVisible: boolean = false;

  //Forms
  private updateExperienceForm: FormGroup;

  @Input() jobExperience: JobExperience;

  constructor(
    private userService: UserService,
    private notification: NzNotificationService,
    private contributorService: ContributorService,
    private tokenService: TokenService,
    private utilService: UtilService,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.updateExperienceForm = new FormGroup({
      'place': new FormControl(this.jobExperience.workPlace, [
        Validators.required,
        Validators.pattern('[\\da-zA-Zа-яА-Я.,\\-\\s]{1,70}')
      ]),
      'position': new FormControl(this.jobExperience.position, [
        Validators.required,
        Validators.pattern('[\\da-zA-Zа-яА-Я.,\\-\\s]{1,70}')
      ]),
      'activity': new FormControl(this.jobExperience.activity, [
        Validators.required,
        Validators.pattern('.{1,2000}')
      ]),
      'period': new FormControl(this.jobExperience.workingPeriod, [
        Validators.required,
        Validators.pattern('[/\\da-zA-Zа-яА-Я.,\\-\\s]{1,70}')
      ]),
    });
  }

  emitReloadFilter() {
   // this.dataService.reloadProfile('true');
    this.dataService.reloadInfo('true');
  }

  deleteExperience() {
    this.userService.deleteJob(this.jobExperience).subscribe((data: any) => {
      this.emitReloadFilter();
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.delete.experience'));
      }
    });
  }

  showEditModal() {
    this.isEditExperienceModalVisible = true;
  }

  closeEditModal() {
    this.isEditExperienceModalVisible = false;
  }

  editExperience() {
    for (const i in this.updateExperienceForm.controls) {
      this.updateExperienceForm.controls[i].markAsDirty();
      this.updateExperienceForm.controls[i].updateValueAndValidity();
    }
    if (this.updateExperienceForm.valid) {
      this.jobExperience.workPlace = this.updateExperienceForm.get('place').value;
      this.jobExperience.workingPeriod = this.updateExperienceForm.get('period').value;
      this.jobExperience.position = this.updateExperienceForm.get('position').value;
      this.jobExperience.activity = this.updateExperienceForm.get('activity').value;
      this.userService.updateUserJob(this.jobExperience).subscribe((data: any) => {
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('label.updated'), '');
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.update.experience'));
        }
      });
      this.isEditExperienceModalVisible = false;
    }
  }
}
