import { User } from './user.model';
import { Project } from './project.model';
import { TermLang } from './term-lang.model';
import { Lang } from './lang.model';
import { Constants } from './constants.enum';
import { ProjectLang } from './project-lang.model';
import { Term } from './term.model';

export interface History {
    id: number;
    user: User;
    project: Project;
    contributor: User;
    termLang: TermLang;
    projectLang: ProjectLang;
    term: Term;
    date: string;
    currentValue: string;
    newValue: string;
    refValue: string;
    action: Constants;
    differenceArray: string[];
    disabled: boolean;
}