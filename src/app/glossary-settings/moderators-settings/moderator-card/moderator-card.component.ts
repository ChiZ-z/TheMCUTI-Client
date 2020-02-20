import { Component, OnInit, Input } from '@angular/core';
import { User, Constants, UtilService, EnumHelper } from 'src/app/core';

@Component({
  selector: 'tmc-moderator-card',
  templateUrl: './moderator-card.component.html',
  styleUrls: ['./moderator-card.component.css']
})
export class ModeratorCardComponent implements OnInit {

  @Input() moderator: User;
  @Input() role: Constants;

  private enum: EnumHelper;

  constructor(
    private utilService: UtilService
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    if (this.moderator) {
      this.moderator.imageToShow = '';
      this.utilService.getImageFromService(this.moderator);
    }
  }

}
