import { Component, OnInit } from '@angular/core';
import { GlossaryService, Glossary, TokenService, Constants, UtilService, EnumHelper, DataService } from 'src/app/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'tmc-main-settings',
  templateUrl: './main-settings.component.html',
  styleUrls: ['./main-settings.component.css']
})
export class MainSettingsComponent implements OnInit {

  private glossary: Glossary;
  private currentGlossaryId: number = -1;
  private enum: EnumHelper;

  //visibility variables
  private isNameEditing: boolean = false;
  private isDescriptionEditing: boolean = false;
  private isTypeEditing: boolean = false;

  //forms
  private nameEditingForm: FormGroup;
  private descriptionEditingForm: FormGroup;
  private typeEditingForm: FormGroup;

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

  showEditNameForm() {
    this.isNameEditing = true;
    this.nameEditingForm = new FormGroup({
      'glossaryName': new FormControl(this.glossary.glossaryName, [Validators.required, Validators.pattern('^[a-zA-Zа-яА-Я0-9\\s]{3,60}$')])
    });
  }

  showEditDescriptionForm() {
    this.isDescriptionEditing = true;
    this.descriptionEditingForm = new FormGroup({
      'description': new FormControl(this.glossary.description, [Validators.required, Validators.pattern('[^\\^\{\\}\[\\]]{1,5000}')])
    });
  }

  showEditTypeForm() {
    this.isTypeEditing = true;
    this.typeEditingForm = new FormGroup({
      'type': new FormControl(this.glossary.glossaryType, [Validators.required])
    });
  }

  cancelNameEditing() {
    this.isNameEditing = false;
  }

  saveName() {
    let name: string = this.nameEditingForm.get('glossaryName').value;
    this.nameEditingForm.setValue({
      'glossaryName': name ? name.trim() : ''
    });
    for (const i in this.nameEditingForm.controls) {
      this.nameEditingForm.controls[i].markAsDirty();
      this.nameEditingForm.controls[i].updateValueAndValidity();
    }
    if (this.nameEditingForm.valid) {
      this.glossary.glossaryName = this.nameEditingForm.get('glossaryName').value;
      this.glossaryService.updateGlossary(this.glossary).subscribe((data: Glossary) => {
        this.glossary = data;
        this.isNameEditing = false;
        this.dataService.reloadSettings('true');
        this.dataService.reloadGlossaryInfo('true');
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('label.updated'), '');
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE),
            this.utilService.getTranslation('error.cannot.update.glossary.name'));
        }
      });
    }
  }

  cancelDescriptionEditing() {
    this.isDescriptionEditing = false;
  }

  saveDescription() {
    let description: string = this.descriptionEditingForm.get('description').value;
    this.descriptionEditingForm.setValue({
      'description': description ? description.trim() : ''
    });
    for (const i in this.descriptionEditingForm.controls) {
      this.descriptionEditingForm.controls[i].markAsDirty();
      this.descriptionEditingForm.controls[i].updateValueAndValidity();
    }
    if (this.descriptionEditingForm.valid) {
      this.glossary.description = this.descriptionEditingForm.get('description').value;
      this.glossaryService.updateGlossary(this.glossary).subscribe((data: Glossary) => {
        this.glossary = data;
        this.isDescriptionEditing = false;
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('label.updated'), '');
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE),
            this.utilService.getTranslation('error.cannot.update.glossary.name'));
        }
      });
    }
  }

  cancelTypeEditing() {
    this.isTypeEditing = false;
  }

  saveType() {
    let type: string = this.typeEditingForm.get('type').value;
    this.typeEditingForm.setValue({
      'type': type ? type.trim() : ''
    });
    for (const i in this.typeEditingForm.controls) {
      this.typeEditingForm.controls[i].markAsDirty();
      this.typeEditingForm.controls[i].updateValueAndValidity();
    }
    if (this.typeEditingForm.valid) {
      this.glossary.glossaryType = this.typeEditingForm.get('type').value;
      this.glossaryService.updateGlossary(this.glossary).subscribe((data: Glossary) => {
        this.glossary = data;
        this.isTypeEditing = false;
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('label.updated'), '');
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE),
            this.utilService.getTranslation('error.cannot.update.glossary.type'));
        }
      });
    }
  }

}
