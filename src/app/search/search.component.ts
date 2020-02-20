import { Component, OnInit, OnDestroy } from '@angular/core';
import { Constants, SearchService, TokenService, SearchItem, ResultSearch, UtilService } from '../core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { PageParams } from '../core/models/page-params.model';
import { NzNotificationService } from 'ng-zorro-antd';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'tmc-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {

  //search variables
  private searchValue: string = '';
  private searchListType: Constants = Constants.ALL;

  //page variables
  private currentPage: number = 1;
  private currentPageSize: number = 1;
  private paginationInfo: PageParams;

  private searchItemList: SearchItem[];
  private resultSearch: ResultSearch;
  private isRequestProcessing: boolean = false;
  private isNothingFound: boolean = false;
  private isNoSearch: boolean = false;

  //Live search variables
  private searchVar = new Subject<string>();
  private liveSearchObservable$ = this.searchVar.asObservable();

  private unsubscribe: Subject<void> = new Subject();

  constructor(
    private searchService: SearchService,
    private tokenService: TokenService,
    private activateRoute: ActivatedRoute,
    private notification: NzNotificationService,
    private router: Router,
    private utilService: UtilService
  ) {
    this.searchItemList = [];
  }

  ngOnInit() {
    if (this.tokenService.validateToken()) {
      this.utilService.checkItemsPerPage('ipsp');
      this.currentPageSize = +localStorage.getItem('ipsp');
      this.activateRoute.queryParams.subscribe((queryParam: any) => {
        queryParam['page'] ? this.currentPage = +queryParam['page'] : this.currentPage = 1;
        queryParam['search'] ? this.searchValue = queryParam['search'] : this.searchValue = '';
        this.search();
      });
      this.initFilterSubscription();
      this.search();
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  search() {
    this.searchVar.next(this.searchValue);
    this.router.navigateByUrl('/search?page=' + this.currentPage + this.getSearch());
  }

  initFilterSubscription() {
    this.liveSearchObservable$.pipe(
      debounceTime(150),
      takeUntil(this.unsubscribe),
      switchMap((value: any) => {
        this.dropBeforeSearch();
        return this.searchService.search(this.searchValue, this.searchListType, this.currentPage - 1, this.currentPageSize);
      })).subscribe((data: ResultSearch) => {
        if (this.checkData(data)) {
          this.resultSearch = data;
          this.searchItemList = data.searchItems;
          this.searchItemList.length == 0 ? this.isNothingFound = true : this.isNothingFound = false;
          this.paginationInfo = data.pageParams;
        } 
        else {
          if (this.searchValue) {
            this.isNothingFound = true;
          } else {
            this.isNoSearch = true;
          }
        }
        this.isRequestProcessing = false;
      }, error => {
        this.isRequestProcessing = false;
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.search'));
        }
      });
  }

  dropBeforeSearch(){
    this.isRequestProcessing = true;
    this.isNoSearch = false;
    this.isNothingFound = false;
    this.searchItemList = [];
  }

  checkData(data: ResultSearch): boolean {
    return data.searchItems != null;
  }

  setSearchListType(value: Constants) {
    this.searchListType = value;
    this.search();
  }

  getTermsAmountTitle() {
    return 'label.terms.count.' + this.utilService.getCountTitleSufix(this.resultSearch.termsCount);
  }

  pageIndexChange(event: number) {
    this.currentPage = event;
    this.router.navigateByUrl('/search?page=' + this.currentPage + this.getSearch());
  }

  pageSizeChange(event: number) {
    this.currentPageSize = event;
    localStorage.setItem('ipsp', '' + event);
    this.search();
  }

  getSearch() {
    return this.searchValue != '' ? '&search=' + this.searchValue : '';
  }
}
