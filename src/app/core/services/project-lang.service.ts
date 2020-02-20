import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TermLang, ProjectLang, Constants } from '../models';
import { environment } from 'src/environments/environment';
import { Progress } from '../models/progress.model';

@Injectable()
export class ProjectLangService {

    private termLangUrl = environment.name + '/term-lang';
    private projectLangUrl = environment.name + '/project-lang';

    constructor(private http: HttpClient) { }

    public updateTermLangValue(termLangId: number, newValue: string) {
        return this.http.put<TermLang>(this.termLangUrl + '/' + termLangId + '/update', newValue);
    }

    public getProgress(id: number) {
        return this.http.get<Progress>(this.projectLangUrl + '/' + id + '/progress');
    }

    public filterTermLangs(id: number, searchValue: string, searchParam: Constants, sortValue: Constants, filter: Constants, page: number, size: number, refId: number) {
        let ref: string = '';
        if (refId) {
            ref = '&referenceProjectLangId=' + refId;
        }
        return this.http.get<ProjectLang>(this.projectLangUrl + '/' + id + '?searchValue=' + searchValue + '&searchParam=' + searchParam +
            '&sortValue=' + sortValue + '&filterValue=' + filter + '&page=' + page + '&size=' + size + ref);
    }

    public fuzzy(termLangId: number, status: boolean) {
        return this.http.put(this.termLangUrl + '/' + termLangId + '/fuzzy?fuzzy=' + status, status);
    }

    public export(id: number, format: string, checkboxUnicode: boolean) {
        return this.http.get(this.projectLangUrl + '/' + id + '/export?type=' + format + '&unicode=' + checkboxUnicode, { responseType: 'blob' });
    }

    public importTranslations(id: number, data: FormData, merge: boolean, replace: boolean) {
        return this.http.post<ProjectLang>(this.projectLangUrl + '/' + id + '/import-translations?merge=' + merge + '&replace=' + replace, data);
    }

    public flushAllLang(id: number) {
        return this.http.post(this.projectLangUrl + '/' + id + '/flush-all', 1);
    }

    public getAllowedReferenceLanguages(id: number) {
        return this.http.get<ProjectLang[]>(this.projectLangUrl + '/' + id + '/referenceLang');
    }

    public autoTranslateTermLang(langId: number, termLangId: number, fromId?: number) {
        let from = '';
        if (fromId) {
            from = '?from=' + fromId;
        }
        return this.http.post<TermLang>(this.projectLangUrl + '/' + langId + '/auto-translate/' + termLangId + from, 1);
    }

    public autoTranslateTermLangList(langId: number, termLangs: TermLang[], fromId?: number) {
        let from = '';
        if (fromId) {
            from = '?from=' + fromId;
        }
        return this.http.post<TermLang[]>(this.projectLangUrl + '/' + langId + '/auto-translate-selected' + from, termLangs);
    }

    public dropFlag(id: number) {
        return this.http.put<TermLang>(this.termLangUrl + '/' + id + '/drop-flag', id);
    }
}
