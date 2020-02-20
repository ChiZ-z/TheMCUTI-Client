import { User } from './user.model';
import { Constants } from './constants.enum';

export interface ProjectContributor {
    id: number;
    contributor: User;
    project: number;
    role: Constants;
    projectName: string;
    selected: boolean;
}