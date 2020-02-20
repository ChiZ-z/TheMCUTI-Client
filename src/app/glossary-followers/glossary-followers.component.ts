import { Component, OnInit, OnDestroy } from '@angular/core';
import { Constants, EnumHelper, Followers, GlossaryService, TokenService, UtilService, DataService, Glossary } from '../core';
import { switchMap, takeUntil, debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PageParams } from '../core/models/page-params.model';
import { Router, ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'app-glossary-followers',
  templateUrl: './glossary-followers.component.html',
  styleUrls: ['./glossary-followers.component.css']
})
export class GlossaryFollowersComponent implements OnInit, OnDestroy {

  //Contributor variables
  private followersList: Followers[];
  private currentGlossaryId: number = -1;
  private currentUserRole: Constants;
  private enum: EnumHelper;

  //Pageable and alerts variables
  private currentPageSize: number = 0;
  private currentPage: number = 1;
  private isNoFollowers: boolean = false;
  private isNothingFound: boolean = false;

  //Filter variavles
  private isRequestProcessing: boolean = false;
  private sortValue: Constants = Constants.USERNAME;
  private sortViewValue: string = 'sort.username';
  private pageParams: PageParams;
  private searchValue: string = '';

  //Live search variables
  private searchVar = new Subject<string>();
  private liveSearchObservable$ = this.searchVar.asObservable();

  private unsubscribe: Subject<void> = new Subject();

  constructor(
    private glossaryService: GlossaryService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tokenService: TokenService,
    private utilService: UtilService,
    private notification: NzNotificationService,
    private dataService: DataService
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    if (this.tokenService.validateToken()) {
      this.utilService.checkItemsPerPage('iglf');
      this.currentPageSize = +localStorage.getItem('iglf');
      this.currentGlossaryId = +this.activatedRoute.parent.parent.parent.snapshot.paramMap.get('id');
      this.initFilterSubscription();
      this.activatedRoute.queryParams.subscribe((queryParam: any) => {
        queryParam['page'] ? this.currentPage = +queryParam['page'] : this.currentPage = 1;
        queryParam['search'] ? this.searchValue = queryParam['search'] : this.searchValue = '';
        this.filterFollowerList();
      });
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  ngOnDestroy() {
    this.currentGlossaryId = -1;
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  filterFollowerList() {
    this.searchVar.next(this.searchValue);
    this.router.navigateByUrl('/glossaries/' + this.currentGlossaryId + '/followers?page=' + this.currentPage + this.getSearch());
  }

  initFilterSubscription() {
    this.liveSearchObservable$.pipe(
      debounceTime(150),
      takeUntil(this.unsubscribe),
      switchMap((value: any) => {
        this.dropBeforeFilter();
        return this.glossaryService.filterFollowers(this.currentGlossaryId, this.sortValue, this.searchValue, this.currentPage - 1, this.currentPageSize);
      })).subscribe((data: Glossary) => {
        this.isRequestProcessing = false;
        this.followersList = data.followers;
        this.pageParams = data.pageParams;
        this.currentPage = data.pageParams.currentPage + 1;
        this.nothingFoundOrNoFollowers(data);
      }, error => {
        this.isRequestProcessing = false;
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.followers'));
        }
      });
  }

  nothingFoundOrNoFollowers(data: Glossary) {
    if (data.followers.length == 0 && this.searchValue != '') {
      this.isNothingFound = true;
      this.isNoFollowers = false;
    } else if (data.followers.length == 0 && this.searchValue == '') {
      this.isNothingFound = false;
      this.isNoFollowers = true;
    } else {
      this.isNothingFound = false;
      this.isNoFollowers = false;
    }
  }

  dropBeforeFilter() {
    this.isRequestProcessing = true;
    this.followersList = [];
    this.isNoFollowers = false;
    this.isNothingFound = false;
  }

  setSortValueAndView(value: Constants, view: string) {
    this.sortValue = value;
    this.sortViewValue = view;
    this.filterFollowerList();
  }

  pageIndexChange(event: number) {
    this.currentPage = event;
    this.router.navigateByUrl('/glossaries/' + this.currentGlossaryId + '/followers?page=' + this.currentPage + this.getSearch());
  }

  pageSizeChange(event: number) {
    this.currentPageSize = event;
    localStorage.setItem('iglf', '' + event);
    this.filterFollowerList();
  }

  getSearch() {
    return this.searchValue != '' ? '&search=' + this.searchValue : '';
  }

}
