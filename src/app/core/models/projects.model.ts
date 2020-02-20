import { Project } from './project.model';
import { Progress } from './progress.model';
import { PageParams } from './page-params.model';

export class Projects {
    projectList: Project[];
    progress: Progress;
    pageParams: PageParams;
}