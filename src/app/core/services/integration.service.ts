import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Project, Constants } from '../models';
import { IntegrationItem } from '../models/integration-item.model';
import { TokenService } from './token.service';
import { IntegrationProject } from '../models/integration-project.model';
import { IntegrationProjects } from '../models/integration-projects.model';

@Injectable()
export class IntegrationService {

  private integrationUrl = environment.name + '/integration';

  constructor(private http: HttpClient,
    private tokenService: TokenService) {
  }

  public getProjectsForIntegration() {
    return this.http.get<Project[]>(this.integrationUrl);
  }

  public getGithubFiles(searchValue: string) {
    return this.http.get<IntegrationProjects>(this.integrationUrl + '/github/files?searchValue=' + searchValue);
  }

  public getGithubRepositories() {
    return this.http.get<IntegrationItem[]>(this.integrationUrl + '/github/repositories?accessToken=' + this.tokenService.getItemFromToken("Token",this.tokenService.getGithubAccessToken()));
  }

  public getGithubBranches(owner: string, repositoryName: string, branchName: string, integrationItem: IntegrationItem) {
    return this.http.post<IntegrationItem[]>(this.integrationUrl + '/github/files?accessToken=' + this.tokenService.getItemFromToken("Token",this.tokenService.getGithubAccessToken()) +
      '&owner=' + owner + '&repositoryName=' + repositoryName + '&branchName=' + branchName, integrationItem);
  }

  public addGithubIntegrationFile(projectId: number, langId: number, owner: string, repositoryName: string, branchName: string, integrationItem: IntegrationItem) {
    return this.http.post<IntegrationItem>(this.integrationUrl + '/github/files/add/' + projectId + '/' + langId
      + '?accessToken=' + this.tokenService.getItemFromToken("Token",this.tokenService.getGithubAccessToken()) + '&owner=' + owner +
      '&repositoryName=' + repositoryName + '&branchName=' + branchName, integrationItem);
  }

  public applyGithubAction(integrationAction: Constants, replace: boolean, integrationProjects: IntegrationProject[]) {
    return this.http.post<IntegrationItem>(this.integrationUrl + '/github/action?accessToken=' +
      this.tokenService.getItemFromToken("Token",this.tokenService.getGithubAccessToken()) + '&replace=' + replace + '&integrationAction=' + integrationAction, integrationProjects);
  }

}
