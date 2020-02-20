import { Lang } from './lang.model';

export interface UserLang {
    id: number;
    lang: Lang;
    level: string;
    experience: string;
    saveError: boolean;
    buffer: string;
}