import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, take, filter } from 'rxjs/operators';

import { TokenService } from '../services';
import { Tokens } from '../models';
import { environment } from 'src/environments/environment';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
    private loginUrl: string = environment.name + '/auth/login';
    private registrationUrl: string = environment.name + '/auth/registration';
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private tokenService: TokenService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const headers = {};
        request.headers.keys().forEach(key => {
            headers[key] = request.headers.get(key);
        });
        let myHeaders = new HttpHeaders();
        const accessToken = this.tokenService.getAccess();
        const refreshToken = this.tokenService.getRefresh();
        if (request.url !== this.loginUrl && request.url !== this.registrationUrl && accessToken != '' && refreshToken != '') {
            myHeaders = myHeaders.set('Auth', 'Token ' + this.tokenService.getAccess());
            myHeaders = myHeaders.set('AuthRef', 'Refresh ' + this.tokenService.getRefresh());
        }
        return next.handle(request.clone({ headers: myHeaders })).pipe(catchError(error => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                return this.handle401Error(request, next);
            } if (error instanceof HttpErrorResponse && error.status === 420) {
                this.tokenService.checkErrorAll(error.status)
            }
            return throwError(error);
        }));
    }

    private addToken(request: HttpRequest<any>, token: Tokens) {
        this.tokenService.storeTokens(token);
        return request.clone({
            setHeaders: {
                'Auth': 'Token ' + token.Token,
                'AuthRef': 'Refresh ' + token.Refresh
            }
        });
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);
            return this.tokenService.createNewTokens().pipe(
                switchMap((token: Tokens) => {
                    this.isRefreshing = false;
                    this.refreshTokenSubject.next(token);
                    return next.handle(this.addToken(request, token));
                }));
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token != null),
                take(1),
                switchMap((jwt: Tokens) => {
                    return next.handle(this.addToken(request, jwt));
                }));
        }
    }
}