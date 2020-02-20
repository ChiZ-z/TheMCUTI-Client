import { User } from './user.model';
import { Constants } from './constants.enum';

export class Followers {
    id: number;
    glossaryId: number;
    user: User;
    followerRole: Constants;
    activationCode: string;
}