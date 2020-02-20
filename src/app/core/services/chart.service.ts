
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User, ChartItem, Constants } from '../models';
@Injectable()
export class ChartService {

    private userUrl = environment.name + '/user';
    private statisticUrl = environment.name + '/statistic'
    constructor(private http: HttpClient) { }

    public getUser() {
        return this.http.get<User>(this.userUrl + '/profile');
    }

    // public getStatsByWeek(type: Constants) {
    //     return this.http.get<ChartItem>(this.statisticUrl + '/week?type=' + type);
    // }

    // public getStatsByMonth(type: Constants) {
    //     return this.http.get<ChartItem>(this.statisticUrl + '/month?type=' + type);
    // }

    // public getStatsByYear(type: Constants) {
    //     return this.http.get<ChartItem>(this.statisticUrl + '/year?type=' + type);
    // }

    // public getStatsByRandomPeriod(type: Constants, start: Date, end: Date) {
    //     return this.http.get<ChartItem>(this.statisticUrl + '/period?start=' + start + '&end=' + end + '&type=' + type);
    // }

    public getStats( projectId: number, contributorId: number, start: Date, end: Date, type: Constants) {
        return this.http.get<ChartItem>(this.statisticUrl + '?start=' + start + '&end=' + end + '&type=' + type +
            '&projectId=' + (projectId == -1 ? '' : projectId) + '&contributorId=' + (contributorId == -1 ? '' : contributorId));
    }
}