import { TermLang } from './term-lang.model';
import { Lang } from './lang.model';
import { PageParams } from './page-params.model';
import { Constants } from './constants.enum';

export interface ProjectLang {
    id: number;
    projectId: number;
    default: boolean;
    lang: Lang;
    projectName: string;
    termLangs: TermLang[];
    termsCount: number;
    translatedCount: number;
    pagesCount: number;
    pageParams: PageParams;
    role: Constants;
    countAutotranslated: number;
    countFuzzy: number;
    countChangeDefault: number;
    isDeleted: boolean;
}