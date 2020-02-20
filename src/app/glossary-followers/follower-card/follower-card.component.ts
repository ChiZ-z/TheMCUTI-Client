import { Component, OnInit, Input } from '@angular/core';
import { Followers, UserService, UtilService, EnumHelper, GlossaryService, TokenService, Constants } from 'src/app/core';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'tmc-follower-card',
  templateUrl: './follower-card.component.html',
  styleUrls: ['./follower-card.component.css']
})
export class FollowerCardComponent implements OnInit {

  @Input() follower: Followers;
  @Input() glossaryId: number;

  private enum: EnumHelper;

  private isSendInvitationModalVisible: boolean = false;
  private isMessageSending: boolean = false;

  constructor(
    private utilService: UtilService,
    private glossaryService: GlossaryService,
    private tokenService: TokenService,
    private notification: NzNotificationService
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    if (this.follower.user) {
      this.follower.user.imageToShow = '';
      this.utilService.getImageFromService(this.follower.user);
    }
  }

  showSendInvitationModal() {
    this.isSendInvitationModalVisible = true;
  }

  closeSendInvitationModal() {
    this.isSendInvitationModalVisible = false;
  }

  sendInvitation() {
    this.isMessageSending = true;
    this.glossaryService.sendInvitation(this.glossaryId, this.follower.user.firstName, this.follower.user.email).subscribe((data: any) => {
      this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('label.invitation.sent'), '');
      this.isSendInvitationModalVisible = false;
    }, error => {
      this.isMessageSending = false;
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.send.invitation'));
      }
    });
  }
}
