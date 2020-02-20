export class IntegrationItem {
    id: number;
    title: string;
    owner: string;
    key: string;
    path: string;
    type: string;
    isLeaf: boolean;
    integrationItems: IntegrationItem[];
}
