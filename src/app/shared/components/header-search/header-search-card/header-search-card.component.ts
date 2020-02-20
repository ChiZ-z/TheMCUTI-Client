import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SearchItem, EnumHelper, Constants } from 'src/app/core';
import { Router } from '@angular/router';

@Component({
  selector: 'tmc-header-search-card',
  templateUrl: './header-search-card.component.html',
  styleUrls: ['./header-search-card.component.css']
})
export class HeaderSearchCardComponent implements OnInit {

  @Input() searchItem: SearchItem;
  @Input() searchValue: string = '';
  @Output() dropSearchValue: EventEmitter<any>;

  //Suppport variables
  private enum: EnumHelper;

  //Visibility variables
  private isShowArrow: boolean = false;

  constructor(private router: Router) {
    this.enum = new EnumHelper();
    this.dropSearchValue = new EventEmitter<any>();
  }

  ngOnInit() {
  }

  getBorderClass() {
    if (this.searchItem.category == Constants.TERMS) {
      return 'terms-border';
    }
    if (this.searchItem.category == Constants.TRANSLATIONS) {
      return 'translations-border';
    }
  }

  getActionClass() {
    if (this.searchItem.category == Constants.TERMS) {
      return 'action-term';
    }
    if (this.searchItem.category == Constants.TRANSLATIONS) {
      return 'action-translation';
    }
  }

  showArrow() {
    this.isShowArrow = true;
  }

  hideArrow() {
    this.isShowArrow = false;
  }

  goToLink() {
    if (this.searchItem.category == Constants.TERMS) {
      this.router.navigateByUrl('/projects/' + this.searchItem.projectId + '/terms?search=' + this.searchValue);
    }
    if (this.searchItem.category == Constants.TRANSLATIONS) {
      this.router.navigateByUrl('/projects/' + this.searchItem.projectId + '/langs/' + this.searchItem.projectLangId + '?search=' + this.searchValue);
    }
    this.dropSearchValue.emit('true');
  }

}
