import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { User, UserLang, JobExperience, Contact, Constants } from '../models';
import { Observable } from 'rxjs';

@Injectable()
export class UserService {

    private authenticationUrl = environment.name + '/auth';
    private userUrl = environment.name + '/user';
    private imageUrl = environment.name + '/image';

    constructor(private http: HttpClient) { }

    public login(user: User) {
        return this.http.post<JSON>(this.authenticationUrl + '/login', user);
    }

    public registration(user: User) {
        return this.http.post<JSON>(this.authenticationUrl + '/registration', user);
    }

    public getUser() {
        return this.http.get<User>(this.userUrl + '/profile');
    }

    public getImage(href: string): Observable<Blob> {
        return this.http.get(this.imageUrl + '?href=' + href, { responseType: 'blob' });
    }

    public getUserByUsername(name: string) {
        return this.http.get<User>(this.userUrl + '/page/' + name);
    }

    public updateUser(editUser: User) {
        return this.http.put(this.userUrl + '/update', editUser);
    }

    public checkUsername(username: string) {
        return this.http.get<boolean>(this.authenticationUrl + '/check-username?username=' + username);
    }

    public checkEmail(email: string) {
        return this.http.get<boolean>(this.authenticationUrl + '/check-email?email=' + email);
    }

    public checkPassword(pass: string) {
        return this.http.get<number>(this.authenticationUrl + '/check-password?password=' + pass);
    }

    public updateUserLang(newVal: UserLang) {
        return this.http.post<UserLang>(this.userUrl + '/edit/userlang', newVal);
    }

    public updateUserJob(newVal: JobExperience) {
        return this.http.post<JobExperience>(this.userUrl + '/edit/job', newVal);
    }

    public updateUserContact(newVal: Contact) {
        return this.http.post<Contact>(this.userUrl + '/edit/contact', newVal);
    }

    public deleteLang(lang: UserLang) {
        return this.http.post(this.userUrl + '/delete/userlang', lang);
    }

    public deleteJob(job: JobExperience) {
        return this.http.post(this.userUrl + '/delete/job', job);
    }

    public deleteContact(contact: Contact) {
        return this.http.post(this.userUrl + '/delete/contact', contact);
    }

    public addContact(type: Constants, value: string) {
        return this.http.post<Contact>(this.userUrl + '/add/contact?type=' + type, value);
    }

    public addJob(job: JobExperience) {
        job.id = null;
        return this.http.post<JobExperience>(this.userUrl + '/add/job', job);
    }

    public addLang(id: number, value: string) {
        return this.http.post<UserLang>(this.userUrl + '/add/userlang?lang_id=' + id, value);
    }

    public changePassword(user: User) {
        return this.http.post(this.userUrl + '/change-pass', user);
    }

    public dropImage() {
        return this.http.delete(this.userUrl + '/drop-avatar');
    }

    public updateEmail(email: string) {
        return this.http.post(this.userUrl + '/update-email', email);
    }

    public updateUsername(username: string) {
        return this.http.post(this.userUrl + '/update-username', username);
    }

    public updateAvatar(id: number, editUser: User) {
        return this.http.post<User>(this.userUrl + '/' + id + '/avatar', editUser);
    }

    public getRegistrationDate() {
        return this.http.get<string>(this.userUrl + '/creation-date');
    }

    public socialLogin(URL: string){
      return this.http.get(URL);
    }
}
