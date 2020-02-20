import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Locals, EnumHelper, DataService, UtilService, ProjectService } from 'src/app/core';
import { en_US, ru_RU, NzI18nService, NzI18nInterface } from 'ng-zorro-antd';

@Component({
  selector: 'tmc-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  private enum: EnumHelper;
  private version: string = '2.0.0';

  constructor(
    private translate: TranslateService,
    private nzTranslation: NzI18nService,
    private dataService: DataService,
    private utilService: UtilService
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    if (!localStorage.getItem('lang')) {
      localStorage.setItem('lang', Locals.EN);
      this.translate.setDefaultLang(Locals.EN);
      this.nzTranslation.setLocale(this.getNzLang(Locals.EN));
    }
    else {
      this.translate.setDefaultLang(localStorage.getItem('lang'));
      this.nzTranslation.setLocale(this.getNzLang(localStorage.getItem('lang')));
    }
    this.utilService.getApplicationVersion().subscribe((data: JSON) => {
     this.version = data['version'];
    }, error => {
      this.version = '2.0.0';
    });
  }

  switchLanguage(language: Locals) {
    this.nzTranslation.setLocale(this.getNzLang(language));
    this.translate.use(language);
    localStorage.setItem('lang', language);
    this.emitActions();
  }

  getNzLang(locale) {
    if (locale == Locals.EN) {
      return en_US;
    }
    if (locale == Locals.RU) {
      return ru_RU;
    }
  }

  getLang() {
    return localStorage.getItem('lang');
  }

  emitActions() {
    this.dataService.remakeChart('true');
  }
}
