import { Constants } from './constants.enum';

export interface Progress {
    termsCount: number;
    translationsCount: number;
    contributorsCount: number;
    projectsCount: number;
    progress: number;
    projectName: string;
    description: string;
    role: Constants;
    languageName: string;
    languageDefinition: string;
}