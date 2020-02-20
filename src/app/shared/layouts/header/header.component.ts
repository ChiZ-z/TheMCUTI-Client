import { Component, OnInit, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { TokenService, User, UserService, UtilService, SearchService, Constants, DataService } from 'src/app/core';
import { NzNotificationService } from 'ng-zorro-antd';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'tmc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  //User variables
  private user: User;
  private isOAuth2: boolean = false;
  private headerImage: any = '';

  //Search variables
  private searchValue: string = '';
  private isRequestProcessing: boolean = false;

  private unsibscribe = new Subject<void>();

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private router: Router,
    private searchService: SearchService,
    private notification: NzNotificationService,
    private utilService: UtilService,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.dataService.reloadUser$.pipe(takeUntil(this.unsibscribe)).subscribe(value => {
      this.getUserForHeader();
    });
    this.getUserForHeader();
  }

  ngOnDestroy() {
    this.unsibscribe.next();
    this.unsibscribe.complete();
  }

  isAuthenticated() {
    return this.tokenService.validateToken();
  }

  getUserForHeader() {
    if (this.tokenService.validateToken()) {
      this.userService.getUser().subscribe((data: User) => {
        if (data.provider == "github"){
          this.isOAuth2 = true;
        }
        this.user = data;
        this.user.imageToShow = '';
        if (this.user.profilePhoto != '') {
          this.getImageFromService();
        }
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.user'));
        }
      });
    }
  }

  logout() {
    this.tokenService.deleteTokens();
    this.router.navigateByUrl('/login');
  }

  createImageFromBlob(image: Blob) {
    const reader: FileReader = new FileReader();
    reader.addEventListener('load', () => {
      this.headerImage = reader.result;
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  getImageFromService() {
    this.userService.getImage(this.user.profilePhoto).subscribe((data: Blob) => {
      this.createImageFromBlob(data);
    }, error => {
      this.user.profilePhoto = '';
    });
  }

  getFullName() {
    let fullName: string = this.user.firstName + ' ' + this.user.lastName;
    if (fullName.length > 35) {
      fullName = fullName.substr(0, 35);
      fullName += '...'
    }
    return fullName;
  }

  getTitle(){
    let fullName: string = this.user.firstName + ' ' + this.user.lastName;
    if (fullName.length > 35) {
      return fullName;
    }
    return '';
  }

  checkURI(value: string) {
    return this.router.url.includes(value);
  }
}
