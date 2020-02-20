import { Project } from './project.model';
import { User } from './user.model';
import { ProjectLang } from './project-lang.model';

export class IntegrationFile {
    id: number;
    sha: string;
    linkToFile: string;
    project: Project;
    user: User;
    projectLang: ProjectLang;
    selected: boolean;
    provider: boolean;
    owner: string;
    repositoryName: string;
    branchName: string;
    pathToFile: string;
}
