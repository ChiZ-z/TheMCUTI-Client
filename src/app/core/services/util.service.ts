import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { User, TermLang, ProjectLang, Lang, Constants } from '../models';
import { ClipboardService } from 'ngx-clipboard';
import { NzNotificationService } from 'ng-zorro-antd';
import { I18nService } from './i18n.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable()
export class UtilService {

  private utilUrl = environment.name + '/util';

  constructor(
    private userService: UserService,
    private clipService: ClipboardService,
    private notification: NzNotificationService,
    private i18nService: I18nService,
    private http: HttpClient
  ) { }

  getCountTitleSufix(count: number) {
    if (count % 10 == 1 && count % 100 != 11) {
      return '1';
    } else if (count % 10 >= 2 && count % 10 <= 4 && !(count % 100 >= 11 && count % 100 <= 19)) {
      return '2';
    } else {
      return '3';
    }
  }

  createImageFromBlob(image: Blob, user: User) {
    const reader: FileReader = new FileReader();
    reader.addEventListener("load", () => {
      user.imageToShow = reader.result;
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  getImageFromService(user: User) {
    this.userService.getImage(user.profilePhoto).subscribe((data: Blob) => {
      this.createImageFromBlob(data, user);
    }, error => {
      user.profilePhoto = '';
    });
  }


  copyJSON(term: TermLang) {
    this.clipService.copyFromContent('"' + term.term.termValue.replace(/["]/gi, '\\"') + '":"' + term.value.replace(/["]/gi, '\\"') + '"');
    this.notification.create(Constants.SUCCESS, this.getTranslation('notification.copied'), '');
  }

  copyProperties(term: TermLang) {
    this.clipService.copyFromContent(term.term.termValue + '=' + term.value);
    this.notification.create(Constants.SUCCESS, this.getTranslation('notification.copied'), '');
  }

  copyString(string: string) {
    this.clipService.copyFromContent(string);
    this.notification.create(Constants.SUCCESS, this.getTranslation('notification.copied'), '');
  }

  getTranslation(value: string): string {
    return this.i18nService.getTranslation(value);
  }

  sortLangList(langList: Lang[]) {
    langList.sort((a, b) => {
      if (this.getTranslation(a.langName) > this.getTranslation(b.langName)) {
        return 1;
      }
      if (this.getTranslation(a.langName) < this.getTranslation(b.langName)) {
        return -1;
      }
      return 0;
    });
  }

  sortProjectLangList(langList: ProjectLang[]) {
    langList.sort((a, b) => {
      if (this.getTranslation(a.lang.langName) > this.getTranslation(b.lang.langName)) {
        return 1;
      }
      if (this.getTranslation(a.lang.langName) < this.getTranslation(b.lang.langName)) {
        return -1;
      }
      return 0;
    });
  }

  checkItemsPerPage(item: string) {
    if (!localStorage.getItem(item)) {
      localStorage.setItem(item, '10');
    }
    if (!/\d/.test(localStorage.getItem(item))) {
      localStorage.setItem(item, '10');
    }
  }

  public getApplicationVersion() {
    return this.http.get<JSON>(this.utilUrl + '/version');
  }

}
