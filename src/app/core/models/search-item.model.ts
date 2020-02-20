import { Constants } from './constants.enum';

export class SearchItem {
    category: Constants;
    projectName: string;
    translatedCount: number;
    translatedAll: number;
    translation: string;
    term: string;
    lang: string;
    searchedValue: string;
    projectId: number;
    projectLangId: number;
    langIcon: string;
}