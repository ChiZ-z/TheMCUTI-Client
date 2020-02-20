import { Lang } from './lang.model';
import { TranslationItem } from './translation-item.model';
import { Category } from './category.model';

export class Group {
    id: number;
    comment: string;
    defaultTranslationItem: TranslationItem;
    glossaryId: number;
    translationItems: TranslationItem[];
    categories: Category[];
    defaultEmpty: boolean;

    constructor(){
        this.categories = [];
        this.translationItems = [];
    }
}