import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Glossary, Constants, Glossaries, GlossaryInfo, Lang, GlossariesInfo, Category, Group, TranslationItem } from '../models';
import { Observable } from 'rxjs';

@Injectable()
export class GlossaryService {

    private glossaryUrl = environment.name + '/glossary';

    constructor(private http: HttpClient) { }

    public createGlossary(glossary: Glossary) {
        return this.http.post<Glossary>(this.glossaryUrl + '/create-glossary', glossary);
    }

    public filterGlossaries(glossaryType: Constants, searchValue: string, filterValue: Constants, sortValue: Constants, page: number, pageSize: number): Observable<Glossaries> {
        return this.http.get<Glossaries>(this.glossaryUrl + '?glossaryType=' + glossaryType + '&filterValue=' + filterValue +
            '&sortValue=' + sortValue + '&searchValue=' + searchValue + '&page=' + page + '&size=' + pageSize);
    }

    public filterGlossary(id: number, searchValue: string, sortValue: Constants, lang: Lang, categoryIds: number[], page: number, pageSize: number): Observable<Glossary> {
        return this.http.get<Glossary>(this.glossaryUrl + '/' + id + '/groups?sortValue='
            + sortValue + '&searchValue=' + searchValue + (lang ? '&langId=' + lang.id : '')
            + (categoryIds.length > 0 ? '&categoryIds=' + categoryIds : '') + '&page=' + page + '&size=' + pageSize);
    }

    public filterFollowers(id: number, sortValue: Constants, searchValue: string, page: number, pageSize: number): Observable<Glossary> {
        return this.http.get<Glossary>(this.glossaryUrl + '/' + id + '/followers?sortValue=' + sortValue
            + '&searchValue=' + searchValue + '&page=' + page + '&size=' + pageSize)
    }

    public getGlossaryInfo(id: number) {
        return this.http.get<GlossaryInfo>(this.glossaryUrl + '/' + id + '/info');
    }

    public getGlossariesInfo(type: Constants) {
        return this.http.get<GlossariesInfo>(this.glossaryUrl + '/info?glossaryType=' + type);
    }

    public subsribe(glossaryId: number) {
        return this.http.post<Glossary>(this.glossaryUrl + '/' + glossaryId + '/subscribe', 1);
    }

    public unsubsribe(glossaryId: number) {
        return this.http.post<Glossary>(this.glossaryUrl + '/' + glossaryId + '/unsubscribe', 1);
    }

    public createCategory(id: number, value: string) {
        return this.http.post<Category[]>(this.glossaryUrl + '/' + id + '/create-category', value);
    }

    public deleteCategory(id: number) {
        return this.http.delete(this.glossaryUrl + '/delete/' + id + '/category');
    }

    public createGroup(group: Group, id: number) {
        return this.http.post(this.glossaryUrl + '/' + id + '/create-group' + (group.comment ? '?comment=' + group.comment : ''), group);
    }

    public deleteTranslation(groupId: number, itemId: number) {
        return this.http.delete(this.glossaryUrl + '/delete/' + groupId + '/translation-item/' + itemId);
    }

    public updateTranslation(item: TranslationItem) {
        return this.http.put(this.glossaryUrl + '/update-translation-item/' + item.id, item);
    }

    public addTranslation(groupId: number, item: TranslationItem) {
        return this.http.post<TranslationItem>(this.glossaryUrl + '/' + groupId + '/create-translation', item);
    }

    public updateGroup(group: Group) {
        return this.http.put<Group>(this.glossaryUrl + '/update-group/' + group.id, group);
    }

    public sendInvitation(glossaryId: number, firstName: string, email: string) {
        return this.http.post(this.glossaryUrl + '/' + glossaryId + '/add-moderator?firstName=' + firstName + '&email=' + email, email);
    }

    public deleteGroup(id: number) {
        return this.http.delete(this.glossaryUrl + '/delete/' + id + '/group');
    }

    public getGlossaryForSettings(id: number) {
        return this.http.get<Glossary>(this.glossaryUrl + '/' + id + '/settings')
    }

    public updateGlossary(glossary: Glossary) {
        return this.http.put<Glossary>(this.glossaryUrl + '/' + glossary.id + '/update?newGlossaryName=' + glossary.glossaryName
            + '&newGlossaryDescription=' + glossary.description
            + '&newGlossaryType=' + glossary.glossaryType, 1);
    }

    public activateModerator(code: string) {
        return this.http.get(this.glossaryUrl + '/activate/' + code);
    }
}