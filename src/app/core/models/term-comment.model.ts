import { User } from './user.model';

export interface TermComment {
    id: number;
    text: string;
    author: User;
    creationDate: string;
    termId: number;
}