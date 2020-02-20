import { Component, OnInit, Input } from '@angular/core';
import { Project, ProjectLang, TokenService, UtilService } from 'src/app/core';

@Component({
  selector: 'tmc-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.css']
})
export class ProjectCardComponent implements OnInit {

  @Input() project: Project;
  private defaultLang: ProjectLang;
  private currentUserId: number = -1;

  constructor(
    private tokenService: TokenService,
    private utilService: UtilService
  ) { }

  ngOnInit() {
    let index;
    this.project.projectLangs.forEach(a => {
      if (a.default) {
        this.defaultLang = a;
        index = this.project.projectLangs.indexOf(a);
      }
    });
    this.project.projectLangs.splice(index, 1);
    this.currentUserId = +this.tokenService.getUserId();
  }

  getProjectProgress() {
    return Math.ceil(this.project.progress * 100);
  }

  getTermsCountTitle() {
    return 'label.terms.count.' + this.utilService.getCountTitleSufix(this.project.termsCount);
  }

  getContributorsTitle(){
    return 'label.contributors.count.' + this.utilService.getCountTitleSufix(this.project.contributors.length);
  }
}
