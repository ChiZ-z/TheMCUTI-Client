import { Term } from './term.model';
import { Lang } from './lang.model';
import { User } from './user.model';

export interface TermLang {
    id: number;
    term: Term;
    lang: Lang;
    projectLangId: number;
    value: string;
    referenceValue: string;
    buffer: string;
    selected: boolean;
    status: number;
    flags: string[];
    modifier: User;
    modifiedDate: string;
    saveError: boolean;
    isRequestProcessing: boolean;

}