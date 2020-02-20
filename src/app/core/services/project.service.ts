import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Project, Lang, ResultStat, ProjectLang, User, Constants } from '../models';
import { Projects } from '../models/projects.model';
import { Progress } from '../models/progress.model';
import { Observable } from 'rxjs';

@Injectable()
export class ProjectService {

    private projectsUrl = environment.name + '/projects';
    private langUrl = environment.name + '/lang';
    private userUrl = environment.name + '/user';

    constructor(private http: HttpClient) { }

    public getProjects() {
        return this.http.get<Project[]>(this.projectsUrl);
    }

    public getProjectById(id: number) {
        return this.http.get<Project>(this.projectsUrl + '/' + id);
    }

    public filterUserProjects(searchValue: string, searchParam: Constants, sortValue: Constants, projectListType: Constants, page: number, size: number): Observable<Projects> {
        return this.http.get<Projects>(this.projectsUrl + '/?searchValue=' + searchValue +
            '&searchParam=' + searchParam + '&sortValue=' + sortValue + '&projectListType=' + projectListType + '&page=' + page + '&size=' + size);
    }

    public getAllLangs() {
        return this.http.get<Lang[]>(this.langUrl);
    }

    public getFreeLangs(currentProjectId) {
        return this.http.post<Lang[]>(this.langUrl + '/' + currentProjectId, currentProjectId);
    }

    public getFreeUserLangs() {
        return this.http.get<Lang[]>(this.langUrl + '/user-langs');
    }

    public addProject(project: Project, langId: number) {
        return this.http.post<Project>(this.projectsUrl + '/add?lang_id=' + langId, project);
    }

    public getProjectProgress(id: number) {
        return this.http.get<Progress>(this.projectsUrl + '/' + id + '/progress')
    }

    public getUserStats(id: number) {
        return this.http.get<ResultStat>(this.userUrl + '/stats/project/' + id);
    }

    public updateProject(id: number, name: string, description: string) {
        return this.http.put<Project>(this.projectsUrl + '/' + id + '/update?newName=' + name + '&newDescription=' + description, id);
    }

    public filterProjectLangs(id: number, searchValue: string, sortValue: Constants, page: number, size: number) {
        const locale = localStorage.getItem('lang');
        return this.http.get<Project>(this.projectsUrl + '/' + id + '/langs?searchValue=' + searchValue +
            '&sortValue=' + sortValue + '&page=' + page + '&size=' + size + '&locale=' + locale);
    }

    public addProjectLang(id: number, lang: number) {
        return this.http.post<Project>(this.projectsUrl + '/' + id + '/language/add?lang_id=' + lang, lang);
    }

    public deleteProjectLang(id: number) {
        return this.http.post(this.projectsUrl + '/language/' + id + '/delete', id);
    }

    public filterProjectTerms(id: number, searchValue: string, sortValue: Constants, page: number, size: number) {
        return this.http.get<Project>(this.projectsUrl + '/' + id + '/terms?searchValue=' + searchValue +
            '&sortValue=' + sortValue + '&page=' + page + '&size=' + size);
    }

    public addTerm(projectId: number, value: string, page: number) {
        const size = localStorage.getItem('ipt');
        return this.http.post<Project>(this.projectsUrl + '/' + projectId + '/add/term?size=' + size + '&page=' + page, value);
    }

    public filterProjectContributors(id: number, searchVal: string, role: Constants, sortValue: Constants, page: number, size: number) {
        return this.http.get<Project>(this.projectsUrl + '/' + id + '/contributors?searchValue=' + searchVal +
            '&sortValue=' + sortValue + '&page=' + page + '&size=' + size + (role? '&contributorRole=' + role : ''));
    }

    public flush(id: number) {
        return this.http.delete<Project>(this.projectsUrl + '/' + id + '/flush-project');
    }

    public deleteProject(id: number) {
        return this.http.delete(this.projectsUrl + '/' + id + '/delete');
    }

    public addAllTermsFromFile(id: number, value: boolean, replace: boolean, importLangId: number, data: FormData) {
        let imp: string = '';
        if (value) {
            imp = '&projLangId=' + importLangId;
        }
        return this.http.post<Project>(this.projectsUrl + '/' + id + '/import-terms?import_values='
            + value + '&replace=' + replace + imp, data);
    }

    public getFreeContributors(id: number, searchUsername: string) {
        return this.http.get<User[]>(this.projectsUrl + '/' + id + '/get-contributors' + '?searchUsername=' + searchUsername)
    }

    public getAllUserProjects() {
        return this.http.get<Project[]>(this.projectsUrl + '/all-projects');
    }

    public getProjectStats(id: number) {
        return this.http.get<ResultStat>(this.projectsUrl + '/' + id + '/full-stats');
    }

    public getCreationDate(id: number) {
        return this.http.get<string>(this.projectsUrl + '/' + id + '/creation-date');
    }
}
