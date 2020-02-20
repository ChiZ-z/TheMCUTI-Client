import {Component, OnInit} from '@angular/core';
import {I18nService} from '../core/services/i18n.service';
import {Project, ProjectService, Lang, UtilService, TokenService, EnumHelper, Constants, DataService} from '../core';
import {Progress} from '../core/models/progress.model';
import {PageParams} from '../core/models/page-params.model';
import {Subscription, Subject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {NzNotificationService} from 'ng-zorro-antd';
import {Projects} from '../core/models/projects.model';
import {switchMap, debounceTime} from 'rxjs/operators';

@Component({
  selector: 'tmc-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css', '../app.component.css']
})
export class ProjectsComponent implements OnInit {

  //Forms and visibility variables
  private addProjectForm: FormGroup;
  private isAddProjectModalVisible: boolean;
  private langList: Lang[];

  //Pageable and info variables
  private barInfo: Progress;
  private currentPage: number = 1;
  private currentPageSize: number = 1;
  private isNothingFound: boolean = false;
  private isNoProjects: boolean = false;
  private paginationInfo: PageParams;
  private projectList: Project[];
  private projectsFullProgress: number = 0;

  //Filter vatiables
  private isRequestProcessing: boolean = false;
  private searchParam: Constants = Constants.PROJECTNAME;
  private searchValue: string = '';
  private sortValue: Constants = Constants.PROJECTNAME;
  private sortViewValue: string = 'sort.name';
  private projectListType = Constants.ALL;

  //Support variables
  private enum: EnumHelper;
  private routeSubscription: Subscription;

  //Live search variables
  private searchVar = new Subject<string>();
  private liveSearchObservable$ = this.searchVar.asObservable();

  constructor(
    private i18nService: I18nService,
    private projectService: ProjectService,
    private activateRoute: ActivatedRoute,
    private notification: NzNotificationService,
    private tokenService: TokenService,
    private router: Router,
    private utilService: UtilService,
    private dataService: DataService
  ) {
    this.enum = new EnumHelper();
  }

  ngOnInit() {
    this.isAddProjectModalVisible = false;
    this.routeSubscription = this.activateRoute.queryParams.subscribe((queryParam: any) => {
      if (queryParam['OAuth2'] != null) {
        this.tokenService.storeOauth2Token(queryParam['OAuth2']);
        this.dataService.reloadUserForHeader('true');
      }
    });
    if (this.tokenService.validateToken()) {
      this.utilService.checkItemsPerPage('ippp');
      this.currentPageSize = +localStorage.getItem('ippp');
      this.routeSubscription = this.activateRoute.queryParams.subscribe((queryParam: any) => {
        queryParam['page'] ? this.currentPage = +queryParam['page'] : this.currentPage = 1;
        queryParam['search'] ? this.searchValue = queryParam['search'] : this.searchValue = '';
        this.filterProjectList();
      });
      this.initFilterSubscription();
      this.filterProjectList();
      this.initAddProjectForm();
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  filterProjectList() {
    this.searchVar.next(this.searchValue);
    this.router.navigateByUrl('/projects?page=' + this.currentPage + this.getSearch());
  }

  initFilterSubscription() {
    this.liveSearchObservable$.pipe(
      debounceTime(150),
      switchMap((value: any) => {
        this.dropBeforeFilter();
        return this.projectService.filterUserProjects(this.searchValue, this.searchParam, this.sortValue, this.projectListType, this.currentPage - 1, this.currentPageSize);
      })).subscribe((data: Projects) => {
      this.projectList = data.projectList;
      this.barInfo = data.progress;
      this.projectsFullProgress = data.progress.progress;
      this.paginationInfo = data.pageParams;
      this.currentPage = data.pageParams.currentPage + 1;
      this.isRequestProcessing = false;
      this.nothingFoundOrNoProjects();
    }, error => {
      this.isRequestProcessing = false;
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.projects'));
      }
    });
  }

  dropBeforeFilter() {
    this.isRequestProcessing = true;
    this.projectList = [];
    this.isNoProjects = false;
    this.isNothingFound = false;
  }

  getAllProjectsProgress() {
    return Math.ceil(this.projectsFullProgress * 100);
  }

  setSortValueAndView(value: Constants, view: string) {
    this.sortValue = value;
    this.sortViewValue = view;
    this.filterProjectList();
  }

  setProjectListType(type: Constants) {
    this.projectListType = type;
    if (this.currentPage != 1) {
      this.router.navigateByUrl('/projects?page=' + 1);
    } else {
      this.filterProjectList();
    }
  }

  getTranslation(value: string): string {
    return this.i18nService.getTranslation(value);
  }

  pageIndexChange(event: number) {
    this.currentPage = event;
    this.router.navigateByUrl('/projects?page=' + this.currentPage + this.getSearch());
  }

  pageSizeChange(event: number) {
    this.currentPageSize = event;
    localStorage.setItem('ippp', '' + event);
    this.filterProjectList();
  }

  getProjectsCountTitle() {
    return 'label.projects.count.' + this.utilService.getCountTitleSufix(this.barInfo.projectsCount);
  }

  getTermsCountTitle() {
    return 'label.terms.count.' + this.utilService.getCountTitleSufix(this.barInfo.termsCount);
  }

  showAddProjectModal() {
    this.addProjectForm.reset();
    this.isAddProjectModalVisible = true;
  }

  handleAddProjectModalOk() {
    this.trimValues();
    for (const i in this.addProjectForm.controls) {
      this.addProjectForm.controls[i].markAsDirty();
      this.addProjectForm.controls[i].updateValueAndValidity();
    }
    if (this.addProjectForm.valid) {
      this.createProject();
      this.isAddProjectModalVisible = false;
    }
  }

  trimValues() {
    let name: string = this.addProjectForm.get('projectName').value;
    let description: string = this.addProjectForm.get('projectDescription').value;
    const langId: number = this.addProjectForm.get('langId').value;
    this.addProjectForm.setValue({
      'projectName': name ? name.trim() : '',
      'projectDescription': description ? description.trim() : '',
      'langId': langId
    });
  }

  createProject(): void {
    let project: Project = new Project();
    project.projectName = this.addProjectForm.get('projectName').value;
    project.description = this.addProjectForm.get('projectDescription').value;
    const langId: number = this.addProjectForm.get('langId').value;
    this.projectService.addProject(project, langId)
      .subscribe((data: any) => {
        this.router.navigateByUrl('/projects/' + data.id)
      }, error => {
        this.tokenService.checkErrorAll(error.status);
        if (this.tokenService.validateToken()) {
          if (error.status === 400) {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.project.exists'));
          } else {
            this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.add.project'));
          }
        }
      });
  }

  handleAddProjectModalCancel() {
    this.isAddProjectModalVisible = false;
  }

  isAddProjectFormInvalid() {
    return this.addProjectForm.invalid;
  }

  initAddProjectForm() {
    this.addProjectForm = new FormGroup({
      'projectName': new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Zа-яА-Я0-9\\s]{3,120}$')]),
      'projectDescription': new FormControl(null, [
        Validators.required,
        Validators.pattern('[^\\^\\{\\}\\[\\]]{1,5000}')]),
      'langId': new FormControl(null, Validators.required)
    });
    this.projectService.getAllLangs().subscribe((data: Lang[]) => {
      this.langList = data;
      this.utilService.sortLangList(this.langList);
    }, error => {
      this.tokenService.checkErrorAll(error.status);
      if (this.tokenService.validateToken()) {
        this.notification.create(Constants.ERROR, this.utilService.getTranslation(Constants.ERROR_TITLE), this.utilService.getTranslation('error.cannot.get.langs'));
      }
    });
  }

  nothingFoundOrNoProjects() {
    if (this.searchValue != '' && this.projectList.length == 0) {
      this.isNothingFound = true;
      this.isNoProjects = false;
    } else if (this.searchValue == '' && this.projectList.length == 0) {
      this.isNothingFound = false;
      this.isNoProjects = true;
    } else {
      this.isNothingFound = false;
      this.isNoProjects = false;
    }
  }

  getSearch() {
    return this.searchValue != '' ? '&search=' + this.searchValue : '';
  }
}
