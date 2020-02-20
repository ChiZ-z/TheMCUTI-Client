import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ResultSearch, Constants } from '../models';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SearchService {

    private searchUrl = environment.name + '/search';

    constructor(private http: HttpClient) { }

    public search(searchValue: string, searchListType: Constants, page: number, size: number) {
        return this.http.get<ResultSearch>(this.searchUrl + '?searchValue=' + searchValue + '&searchListType=' + searchListType + '&page=' + page + '&size=' + size);
    }

    public shortSearch(searchValue: string) {
        return this.http.get<ResultSearch>(this.searchUrl + '/border?searchValue=' + searchValue + '&size=' + 7);
    }
}
