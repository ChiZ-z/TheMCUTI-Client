import { User } from './user.model';
import { ProjectContributor } from './project-contributor.model';
import { ProjectLang } from './project-lang.model';
import { Term } from './term.model';
import { PageParams } from './page-params.model';
import { Constants } from './constants.enum';

export class Project {
    id: number;
    projectName: string;
    description: string;
    createdDate: Date;
    lastUpdate: Date;
    author: User;
    contributors: ProjectContributor[];
    projectLangs: ProjectLang[];
    terms: Term[];
    searchedTerms: Term[];
    termsCount: number;
    searchedTermsCount: number;
    pagesCount: number;
    processing: boolean;
    progress: number;
    translationsCount: number;
    pageParams: PageParams;
    role: Constants;
}