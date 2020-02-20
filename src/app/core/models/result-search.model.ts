import { SearchItem } from './search-item.model';
import { PageParams } from './page-params.model';

export class ResultSearch {
    searchItems: SearchItem[];
    pageParams: PageParams;
    translationCount: number;
    termsCount: number;
}