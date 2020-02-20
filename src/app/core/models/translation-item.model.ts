import { Lang } from './lang.model';
import { FormGroup } from '@angular/forms';

export class TranslationItem {
    id: number;
    groupItemId: number;
    translationItemValue: string;
    lang: Lang;
    addForm: FormGroup;
    buffer: string;
    isLangPermanent: boolean;

    constructor(isPermanent?: boolean) {
        this.isLangPermanent = isPermanent ? isPermanent : false;
    }
}