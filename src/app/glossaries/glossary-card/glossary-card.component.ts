import { Component, OnInit, Input } from '@angular/core';
import { Glossary, TokenService, UtilService, GlossaryService, EnumHelper, Constants } from 'src/app/core';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'tmc-glossary-card',
  templateUrl: './glossary-card.component.html',
  styleUrls: ['./glossary-card.component.css']
})
export class GlossaryCardComponent implements OnInit {
  @Input() glossary: Glossary;

  private currentUserId: number;
  private enum: EnumHelper;
  private role: Constants;

  private isUnsubscribeModalVisible: boolean = false;

  constructor(
    private tokenService: TokenService,
    private utilService: UtilService,
    private glossaryService: GlossaryService,
    private notification: NzNotificationService
  ) {
    this.currentUserId = +this.tokenService.getUserId();
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    this.role = this.glossary.followerRole;
    this.utilService.getImageFromService(this.glossary.author);
  }

  getCountTitle(type: string, value: number) {
    return 'label.' + type + '.count.' + this.utilService.getCountTitleSufix(value ? value : 0);
  }

  subscribe() {
    this.glossaryService.subsribe(this.glossary.id).subscribe((data: Glossary) => {
      this.role = data.followerRole;
      this.glossary.followersCount = data.followersCount;
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.subscribe'));
      }
    });
  }

  showUnsubscribeModal() {
    this.isUnsubscribeModalVisible = true;
  }

  closeUnsubscribeModal() {
    this.isUnsubscribeModalVisible = false;
  }

  unsubscribe() {
    this.isUnsubscribeModalVisible = false;
    this.glossaryService.unsubsribe(this.glossary.id).subscribe((data: Glossary) => {
      this.role = data.followerRole;
      this.glossary.followersCount = data.followersCount;
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.unsubscribe'));
      }
    });
  }

}
