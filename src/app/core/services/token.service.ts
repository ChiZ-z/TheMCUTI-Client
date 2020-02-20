import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { Tokens, Constants } from '../models';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

@Injectable()
export class TokenService {

  private authenticationUrl = environment.name + '/auth';
  private tokenString = "Token";
  private refreshString = "Refresh";
  private provider = "Provider";
  private githubAccessToken = "AccessGithub";
  private gitlabAccessToken = "AccessGitlab";
  private bitbucketAccessToken = "AccessBitbucket";

  constructor(private http: HttpClient, private router: Router) {
  }

  public createNewTokens() {
    return this.http.get<Tokens>(this.authenticationUrl + '/refresh-token?access=' + this.getAccess() + '&refresh=' + this.getRefresh()).pipe(tap((tokens: Tokens) => {
      this.storeTokens(tokens);
    }));
  }

  storeGithubAccessToken(token: string) {
    localStorage.setItem(this.githubAccessToken, token);
  }

  storeGitlabAccessToken(token: string) {
    localStorage.setItem(this.gitlabAccessToken, token);
  }

  storeBitbucketAccessToken(token: string) {
    localStorage.setItem(this.bitbucketAccessToken, token);
  }

  storeOauth2Token(oauth2: string) {
    this.setItem(this.provider, this.getItemFromToken(this.provider, oauth2));
    this.setAccess(this.getItemFromToken(this.tokenString, oauth2));
    this.setRefresh(this.getItemFromToken(this.refreshString, oauth2));
  }

  storeJwtToken(jwt: string) {
    localStorage.setItem(this.tokenString, jwt);
  }

  storeTokens(tokens: Tokens) {
    localStorage.setItem(this.tokenString, tokens.Token);
    localStorage.setItem(this.refreshString, tokens.Refresh);
  }

  deleteTokensOauth2Tokens() {
    this.removeItem(this.githubAccessToken);
    this.removeItem(this.gitlabAccessToken);
    this.removeItem(this.bitbucketAccessToken);
    this.removeItem(this.provider);
  }

  deleteTokens() {
    this.removeItem(this.tokenString);
    this.removeItem(this.refreshString);
    this.removeItem(this.githubAccessToken);
    this.removeItem(this.gitlabAccessToken);
    this.removeItem(this.bitbucketAccessToken);
    this.removeItem(this.provider);
  }

  setAccess(value: string) {
    localStorage.setItem(this.tokenString, value);
  }

  setRefresh(value: string) {
    localStorage.setItem(this.refreshString, value);
  }

  getRefresh() {
    return localStorage.getItem(this.refreshString);
  }

  getAccess() {
    return localStorage.getItem(this.tokenString);
  }

  getProviderFromGithubAccess() {
    let isGithub = false;
    if (this.getItemFromToken(this.provider, this.getGithubAccessToken()) != null) {
      isGithub = true;
    }
    return isGithub;
  }

  getProviderFromGitlabAccess() {
    let isGitlab = false;
    if (this.getItemFromToken(this.provider, this.getGitlabAccessToken()) != null) {
      isGitlab = true;
    }
    return isGitlab;
  }

  getProviderFromBitbucketAccess() {
    let isBitbucket = false;
    if (this.getItemFromToken(this.provider, this.getBitbucketAccessToken()) != null) {
      isBitbucket = true;
    }
    return isBitbucket;
  }

  getGithubAccessToken() {
    return localStorage.getItem(this.githubAccessToken);
  }

  getGitlabAccessToken() {
    return localStorage.getItem(this.gitlabAccessToken);
  }

  getBitbucketAccessToken() {
    return localStorage.getItem(this.bitbucketAccessToken);
  }

  setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  getItem(key: string) {
    return localStorage.getItem(key);
  }

  removeItem(key: string) {
    return localStorage.removeItem(key);
  }

  checkErrorAll(status: number) {
    if (status === 420) {
      this.deleteTokens();
      this.router.navigateByUrl('/login');
    } else if (status === 403) {
      this.router.navigateByUrl('/forbidden', { skipLocationChange: true });
    } else if (status === 404) {
      this.router.navigateByUrl('/not-found', { skipLocationChange: true });
    }
  }

  checkErrorWithout403(status: number) {
    if (status === 420) {
      this.deleteTokens();
      this.router.navigateByUrl('/login');
    } else if (status === 404) {
      this.router.navigateByUrl('/not-found', { skipLocationChange: true });
    }
  }

  checkErrorWithout404(status: number) {
    if (status === 420) {
      this.deleteTokens();
      this.router.navigateByUrl('/login');
    } else if (status === 403) {
      this.router.navigateByUrl('/forbidden', { skipLocationChange: true });
    }
  }

  getUserId(): string {
    return this.getItemFromLocalStorageToken('userId', 'Token');
  }

  getUserName(): string {
    return this.getItemFromLocalStorageToken('sub', 'Token');
  }

  getItemFromToken(itemValue: string, token: string): string {
    let val = null;
    try {
      JSON.parse(atob(token.split('.')[1]), (key, value) => {
        if (key === itemValue) {
          val = value;
        }
      })
    } catch (Error) {
    }
    return val;
  }

  getItemFromLocalStorageToken(itemValue: string, token: string): string {
    let val = null;
    try {
      JSON.parse(atob(this.getItem(token).split('.')[1]), (key, value) => {
        if (key === itemValue) {
          val = value;
        }
      })
    } catch (Error) {
      this.deleteTokens();
      // this.router.navigateByUrl('/login');
    }
    //this.deleteTokens();
    return val;
  }

  validateToken(): boolean {
    return !(!this.getUserName() || !this.getUserId());
  }

  // validateToken(): boolean {
  // return !(!this.getUserName() || !this.getUserId());
  // }

}
