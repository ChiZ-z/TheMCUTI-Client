import { User } from './user.model';
import { Group } from './group.model';
import { Followers } from './followers.model';
import { Constants } from './constants.enum';
import { PageParams } from './page-params.model';
import { Category } from './category.model';
import { Lang } from './lang.model';

export class Glossary {
    id: number;
    glossaryName: string;
    description: number;
    author: User;
    groupItems: Group[];
    followers: Followers[];
    glossaryType: Constants;
    parent: Glossary;
    pageParams: PageParams;
    groupCount: number;
    wordsCount: number;
    followersCount: number;
    creationDate: string;
    followerRole: Constants;
    categories: Category[];
    categoriesCount: number;
    lang: Lang;
}