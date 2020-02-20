import { TermLang } from './term-lang.model';
import { TermComment } from './term-comment.model';

export interface Term {
    id: number;
    projectId: number;
    termValue: string;
    translations: TermLang[];
    buffer: string;
    selected: boolean;
    saveError: boolean;
    comments: TermComment[];
    showComments: boolean;
    showTranslations: boolean;
    commentsCount: number;
    translatedCount: number;
    referenceValue: string;
}