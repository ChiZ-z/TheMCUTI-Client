import { Component, OnInit, OnDestroy } from '@angular/core';
import { Glossary, GlossaryService, UtilService, TokenService, Constants, DataService } from '../core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-glossary-settings',
  templateUrl: './glossary-settings.component.html',
  styleUrls: ['./glossary-settings.component.css']
})
export class GlossarySettingsComponent implements OnInit, OnDestroy {

  private glossary: Glossary;
  private currentGlossaryId: number = -1;

  private unsubscribe: Subject<void> = new Subject();

  constructor(
    private glossaryService: GlossaryService,
    private tokenService: TokenService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private utilService: UtilService,
    private notification: NzNotificationService,
    private dataService: DataService
  ) { }

  ngOnInit() {
    if (this.tokenService.validateToken()) {
      this.currentGlossaryId = +this.activatedRoute.parent.parent.parent.snapshot.paramMap.get('id');
      this.dataService.doReloadSettings$.pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        this.getGlossary();
      });
      this.getGlossary();
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getGlossary() {
    this.glossaryService.getGlossaryForSettings(this.currentGlossaryId).subscribe((data: Glossary) => {
      this.glossary = data;
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.glossary.settings'));
      }
    });
  }

  checkUrl(value: string) {
    return this.router.url.includes(value);
  }

}
