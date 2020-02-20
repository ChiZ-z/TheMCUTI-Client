import { Component, OnInit, HostListener } from '@angular/core';
import { SearchService, ResultSearch, Constants, EnumHelper, TokenService, UtilService } from 'src/app/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'tmc-header-search',
  templateUrl: './header-search.component.html',
  styleUrls: ['./header-search.component.css']
})
export class HeaderSearchComponent implements OnInit {

  //Search variables
  private isRequestProcessing: boolean = false;
  private resultSearch: ResultSearch;
  private isNothingFound: boolean = false;

  //Search params and value
  private searchValue: string = '';
  private searchParam: Constants = Constants.ALL;

  //Visibility variables
  private showDropBlock: boolean = false;
  private isMouseOnDrop: boolean = false;
  private isFocus: boolean = false;
  private showSeeAllTitle: boolean = false;

  //Support variables
  private enum: EnumHelper;

  //Live search variables
  private searchVar = new Subject<string>();
  private liveSearchObservable$ = this.searchVar.asObservable();

  constructor(
    private searchService: SearchService,
    private tokenService: TokenService,
    private utilService: UtilService,
    private notification: NzNotificationService,
    private router: Router
  ) {
    this.enum = new EnumHelper();
    this.resultSearch = new ResultSearch();
  }

  ngOnInit() {
    this.liveSearchObservable$.pipe(
      switchMap((value: any) => {
        this.dropBeforeSearch();
        return this.searchService.shortSearch(this.searchValue);
      })).subscribe((data: ResultSearch) => {
        this.isRequestProcessing = false;
        this.showSeeAllTitle = true;
        this.resultSearch.searchItems = data.searchItems;
        if (!this.resultSearch.searchItems || this.resultSearch.searchItems.length == 0) {
          this.isNothingFound = true;
        } else {
          this.isNothingFound = false;
        }
      }, error => {
        this.showDropBlock = false;
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.search'));
        }
      });
  }

  showDrop() {
    this.isFocus = true;
    this.showDropBlock = true;
  }

  hideDrop() {
    this.isFocus = false;
    if (!this.isMouseOnDrop) {
      this.showDropBlock = false;
    }
  }

  mouseOnDrop() {
    this.isMouseOnDrop = true;
  }

  mouseOutOfDrop() {
    this.isMouseOnDrop = false;
  }

  liveSearch() {
    this.searchVar.next(this.searchValue);
  }

  dropBeforeSearch() {
    this.resultSearch.searchItems = [];
    this.showSeeAllTitle = false;
    this.isNothingFound = false;
    this.isRequestProcessing = true;
  }

  countTermItems() {
    let count: number = 0;
    if (this.resultSearch && this.resultSearch.searchItems) {
      this.resultSearch.searchItems.forEach(item => {
        if (item.category == Constants.TERMS) {
          count++;
        }
      });
    }
    return count;
  }

  countTranslationItems() {
    let count: number = 0;
    if (this.resultSearch && this.resultSearch.searchItems) {
      this.resultSearch.searchItems.forEach(item => {
        if (item.category == Constants.TRANSLATIONS) {
          count++;
        }
      });
    }
    return count;
  }

  goToFullSearch() {
    if (this.searchValue != '') {
      this.router.navigateByUrl('/search?page=1&search=' + this.searchValue);
      this.searchValue = '';
    }
  }

  clickedInside($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();
  }

  @HostListener('document:click', ['$event']) clickedOutside($event) {
    if (!this.isFocus) {
      this.showDropBlock = false;
    }
  }

  dropSearchValue() {
    this.searchValue = '';
  }
}
