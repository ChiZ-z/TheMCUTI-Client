import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Constants, History, ResultHistory } from '../models';

@Injectable()
export class HistoryService {

  private historyUrl = environment.name + '/history';

  constructor(private http: HttpClient) { }

  // public getProjectHistoryByWeek(type: Constants[], projectId: number, contributorId: number, page: number, size: number) {
  //   return this.http.get<ResultHistory>(this.historyUrl + '/' + projectId + '/week?statTypes=' + type + (contributorId != -1 ? '&contributorId=' + contributorId : '') +
  //     '&page=' + page + '&size=' + size);
  // }

  // public getProjectHistoryByMonth(type: Constants[], projectId: number, contributorId: number, page: number, size: number) {
  //   return this.http.get<ResultHistory>(this.historyUrl + '/' + projectId + '/month?statTypes=' + type + (contributorId != -1 ? '&contributorId=' + contributorId : '') +
  //     '&page=' + page + '&size=' + size);
  // }

  public getProjectHistory(type: Constants[], start: Date, end: Date, projectId: number, contributorId: number, page: number, size: number) {
    return this.http.get<ResultHistory>(this.historyUrl + '/' + projectId + '/filter?start=' + start + '&end=' + end + '&statTypes=' +
      type + (contributorId != -1 ? '&contributorId=' + contributorId : '') + '&page=' + page + '&size=' + size);
  }

  public getUserHistory(type: Constants[], start: Date, end: Date, projectId: number, page: number, size: number) {
    return this.http.get<ResultHistory>(this.historyUrl + '/filter?start=' + start + '&end=' + end + '&statTypes=' +
      type + (projectId != -1 ? '&projectId=' + projectId : '') + '&page=' + page + '&size=' + size);
  }

  public getChildHistoryEvents(projectId: number, historyId: number) {
    return this.http.get<History[]>(this.historyUrl + '/' + projectId + '/event/' + historyId);
  }

  public getTermLangHistory(projectId: number, termId: number) {
    return this.http.get<History[]>(this.historyUrl + '/' + projectId + '/translation/' + termId);
  }

}
