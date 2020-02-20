import { Component, OnInit, Input } from '@angular/core';
import { ProjectLang, UtilService, ProjectService, TokenService, Constants, EnumHelper, DataService } from 'src/app/core';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'tmc-lang-card',
  templateUrl: './lang-card.component.html',
  styleUrls: ['./lang-card.component.css']
})
export class LangCardComponent implements OnInit {

  @Input() lang: ProjectLang;
  @Input() role: Constants;
  @Input() projectId: number;

  private enum: EnumHelper;

  constructor(
    private utilService: UtilService,
    private notification: NzNotificationService,
    private tokenService: TokenService,
    private projectsService: ProjectService,
    private dataService: DataService
  ) { 
    this.enum = new EnumHelper();
  }

  ngOnInit() {
  }

  getLanguageProgress() {
    return Math.ceil(this.lang.translatedCount / this.lang.termsCount * 100);
  }

  deleteLang() {
    this.projectsService.deleteProjectLang(this.lang.id).subscribe((data: any) => {
      this.dataService.refilterProjectLangs('true');
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        if (error.status === 400) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('cannot.delete.def.lang'));
        } else {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('cannot.delete.lang'));
        }
      }
    });
  }

  percentsFormat = (percent: number) => `${percent}%`;
}
