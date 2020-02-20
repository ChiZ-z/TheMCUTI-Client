import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { ProjectService, UtilService, ResultStat, TokenService, Constants, EnumHelper, Project, DataService } from '../core';
import { Progress } from '../core/models/progress.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'tmc-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit, OnDestroy {

  //Project variables
  private currentProjectId: number = -1;
  private currentTabIndex: number = 1;
  private currentUserRole: Constants;
  private barInfo: Progress;
  private enum: EnumHelper;

  //Modals variables
  private isStatsModalVisible: boolean = false;
  private isSettingsModalVisible: boolean = false;
  private isDeletingProjectVisible: boolean = false;
  private isDeletingLangVisible: boolean = false;
  private isFlushingVisible: boolean = false;

  //Info and support variables
  private showSucceedUpdate: boolean = false;
  private showNameExist: boolean = false;
  private incorrectProjectName: boolean = false;
  private incorrectProjectDescription: boolean = false;
  private isNameEditing: boolean = false;
  private isDescriptionEditing: boolean = false;
  private bufferNameValue: string = '';
  private bufferDescriptionValue: string = '';

  constructor(
    private projectService: ProjectService,
    private utilService: UtilService,
    private tokenService: TokenService,
    private notification: NzNotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {
    this.enum = new EnumHelper();
  }

  private unsubscribe: Subject<void> = new Subject();

  ngOnDestroy() {
    this.currentProjectId = -1;
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngOnInit() {
    this.dataService.doReloadProjectInfo$.pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        if (this.currentProjectId != -1) {
          this.getDataForInfoBar();
        }
      });
    if (this.tokenService.validateToken()) {
      this.checkTabIndex();
      this.route.params.pipe(takeUntil(this.unsubscribe))
        .subscribe((data: any) => this.currentProjectId = data['id']);
      this.router.events.pipe(takeUntil(this.unsubscribe))
        .subscribe((a: any) => {
          this.checkTabIndex();
        });
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  checkTabIndex() {
    if (this.router.url.includes('langs')) {
      this.currentTabIndex = 0;
    } else if (this.router.url.includes('terms')) {
      this.currentTabIndex = 1;
    } else if (this.router.url.includes('contributors')) {
      this.currentTabIndex = 2;
    } else if (this.router.url.includes('statistics')) {
      this.currentTabIndex = 3;
    } else {
      this.currentTabIndex = 4;
    }
  }

  getDataForInfoBar() {
    if (this.currentProjectId != -1) {
      this.projectService.getProjectProgress(this.currentProjectId).subscribe((data: Progress) => {
        this.barInfo = data;
        this.currentUserRole = data.role;
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken() && error.status != 404 && error.status != 403) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.load.data'));
        }
      });
    }
  }

  getTermsCountTitle() {
    return 'label.terms.count.' + this.utilService.getCountTitleSufix(this.barInfo.termsCount);
  }

  getCurrentProjectProgress() {
    return Math.ceil(this.barInfo.progress * 100);
  }

  activateRouterLink(link: string, isPageAdding: boolean) {
    this.router.navigateByUrl('/projects/' + this.currentProjectId + '/' + link + (isPageAdding ? '?page=1' : ''));
  }

  // showStatsModal() {
  //   this.projectService.getUserStats(this.currentProjectId).subscribe((data: ResultStat) => {
  //     this.userProjectStats = data;
  //     this.isStatsModalVisible = true;
  //   }, error => {
  //     this.tokenService.checkErrorAll(error.status);
  //     if (this.tokenService.validateToken()) {
  //       this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.stats'));
  //     }
  //   });
  // }

  // handleStatsModalClose() {
  //   this.isStatsModalVisible = false;
  // }

  showSettingsModal() {
    this.isSettingsModalVisible = true;
  }

  handleSettingsModalClose() {
    this.isSettingsModalVisible = false;
    this.showSucceedUpdate = false;
    this.isNameEditing = false;
    this.isDescriptionEditing = false;
  }

  showNameEditing() {
    this.isNameEditing = true;
    this.bufferNameValue = this.barInfo.projectName;
  }

  saveProjectName() {
    if (this.currentProjectId != -1) {
      const projectName: string = this.bufferNameValue.trim();
      const description: string = this.barInfo.description;
      this.projectService.updateProject(this.currentProjectId, projectName, description).subscribe((data: Project) => {
        this.barInfo.projectName = data.projectName;
        this.barInfo.description = data.description;
        this.isNameEditing = false;
        this.showSuccess();
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          if (error.status == 421) {
            this.showExistError();
          } if (error.status == 400) {
            this.showInvalidNameError();
          } else {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.update.project.name'));
          }
        }
      });
    }
  }

  showDescriptionEditing() {
    this.isDescriptionEditing = true;
    this.bufferDescriptionValue = this.barInfo.description;
  }

  saveProjectDescription() {
    if (this.currentProjectId != -1) {
      const projectName: string = this.barInfo.projectName;
      const description: string = this.bufferDescriptionValue.trim();
      this.projectService.updateProject(this.currentProjectId, projectName, description).subscribe((data: Project) => {
        this.barInfo.projectName = data.projectName;
        this.barInfo.description = data.description;
        this.isDescriptionEditing = false;
        this.showSuccess();
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (error.status == 400) {
          this.showInvalidDescriptionError();
        } else if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.update.description'));
        }
      });
    }
  }

  cancelDescriptionEditing() {
    this.isDescriptionEditing = false;
  }

  cancelNameEditing() {
    this.isNameEditing = false;
  }

  showSuccess() {
    this.showSucceedUpdate = true;
    this.showNameExist = false;
    this.incorrectProjectName = false;
    this.incorrectProjectDescription = false;
  }

  showExistError() {
    this.showSucceedUpdate = false;
    this.showNameExist = true;
    this.incorrectProjectName = false;
    this.incorrectProjectDescription = false;
  }

  showInvalidNameError() {
    this.showSucceedUpdate = false;
    this.showNameExist = false;
    this.incorrectProjectName = true;
    this.incorrectProjectDescription = false;
  }

  showInvalidDescriptionError() {
    this.showSucceedUpdate = false;
    this.showNameExist = false;
    this.incorrectProjectName = false;
    this.incorrectProjectDescription = true;
  }

  showDeleteProjectModal() {
    this.isDeletingProjectVisible = true;
    this.isSettingsModalVisible = false;
  }

  showFlushProjectModal() {
    this.isFlushingVisible = true;
    this.isSettingsModalVisible = false;
  }

  handleAlertModalsClose() {
    this.isDeletingLangVisible = false;
    this.isDeletingProjectVisible = false;
    this.isFlushingVisible = false;
    this.showSucceedUpdate = false;
  }

  handleDeleteProjectModalOk() {
    if (this.currentProjectId != -1) {
      this.projectService.deleteProject(this.currentProjectId).subscribe((data: any) => {
        this.isDeletingProjectVisible = false;
        this.router.navigateByUrl('/projects');
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.delete.project'));
        }
      });
    }
  }

  handleFlushProjectModalOk() {
    if (this.currentProjectId != -1) {
      this.projectService.flush(this.currentProjectId).subscribe((data: any) => {
        this.handleAlertModalsClose();
        this.getDataForInfoBar();
        if (this.router.url.includes('langs')) {
          this.dataService.refilterProjectLangs('true');
        } else if (this.router.url.includes('terms')) {
          this.dataService.refilterProjectTerms('true');
        }
        this.notification.create(Constants.SUCCESS, this.utilService.getTranslation('info.project.flushed'), '');
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.flush.project'));
        }
      });
    }
  }
}
