import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class I18nService {

  constructor(private translateService: TranslateService) { }

  getTranslation(string: string): string {
    let res: string;
    this.translateService.get(string).subscribe((data: string) => res = data);
    return res;
  }

}
