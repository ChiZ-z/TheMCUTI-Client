import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProjectContributor, User, Project, ResultStat, Constants } from '../models';
import { environment } from 'src/environments/environment';

@Injectable()
export class ContributorService {

    private projectsUrl = environment.name + '/projects';
    private contributorsUrl = environment.name + '/contributors';

    constructor(private http: HttpClient) { }

    public addContributorToProject(id: number, username: string, role: Constants) {
        return this.http.post<ProjectContributor>(this.projectsUrl + '/' + id + '/add/contributor?role=' + role, username)
    }

    public deleteContributorFromProject(id: number) {
        return this.http.post(this.projectsUrl + '/delete/' + id + '/contributor', id);
    }

    public deleteSelectedContributorsFromProject(contributors: ProjectContributor[]) {
        return this.http.post(this.projectsUrl + '/delete-selected/contributor', contributors);
    }

    public update(id: number, role: Constants) {
        return this.http.put(this.contributorsUrl + '/' + + id + '/update', role);
    }

    public notify(id: number, message: string, contr: ProjectContributor) {
        return this.http.post(this.projectsUrl + '/' + id + '/notify-contributor?message=' + message, contr);
    }

    public notifyAll(id: number, message: string) {
        return this.http.post(this.projectsUrl + '/' + id + '/notify-all', message);
    }

    public notifySelected(id: number, contrs: ProjectContributor[], message: string) {
        return this.http.post(this.projectsUrl + '/' + id + '/notify-selected?message=' + message, contrs);
    }

    public getContributorStats(id: number, projectId: number) {
        return this.http.get<ResultStat>(this.contributorsUrl + '/' + id + '/project/' + projectId + '/stats');
    }

    public getAllProjectUsers(id: number) {
        return this.http.get<User[]>(this.contributorsUrl + '/all/' + id);
    }
}
