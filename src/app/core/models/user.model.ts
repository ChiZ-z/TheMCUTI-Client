import { Contact } from './contact.model';
import { UserLang } from './user-lang.model';
import { JobExperience } from './job-experience.model';
import { ResultStat } from './result-stat.model';

export class User {
    id: number;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    mailingAccess: boolean;
    oldPassword: string;
    activationCode: string;
    profilePhoto: string;
    repeatPassword: string;
    contacts: Contact[];
    langs: UserLang[];
    jobs: JobExperience[];
    resultStat: ResultStat;
    avatar: string;
    imageToShow: any;
    provider: string;
}
