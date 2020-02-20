import { IntegrationFile } from './integration-file.model';

export class IntegrationProject {
    integrationFiles: IntegrationFile[];
    integrationFilesCount: number;
    projectId: number;
    projectName: string;
    selected: boolean;
}