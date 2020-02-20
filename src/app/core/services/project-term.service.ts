import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TermLang, TermComment, Term } from '../models';

@Injectable()
export class ProjectTermService {

    private termUrl = environment.name + '/terms';
    private projectsUrl = environment.name + '/projects';

    constructor(private http: HttpClient) { }

    public getTermTranslations(id: number) {
        return this.http.get<TermLang[]>(this.termUrl + '/' + id + '/translations');
    }


    public getTermComments(id: number) {
        return this.http.get<TermComment[]>(this.termUrl + '/' + id + '/get-comments');
    }

    public addTermComment(id: number, text: string) {
        return this.http.post<TermComment>(this.termUrl + '/' + id + '/add-comment', text);
    }

    public deleteTermComment(comment: TermComment) {
        return this.http.post(this.termUrl + '/delete-comment', comment);
    }

    public deleteTerm(id: number, projId: number) {
        return this.http.post<Term[]>(this.projectsUrl + '/' + projId + '/delete/' + id + '/term', id);
    }

    public updateTermValue(term: Term) {
        return this.http.put<Term>(this.termUrl + '/' + term.id + '/update', term.termValue);
    }

    public deleteSelected(id: number, terms: Term[]) {
        return this.http.post(this.projectsUrl + '/' + id + '/delete-selected/term', terms);
    }

}
