import { Constants } from './constants.enum';

export interface IntegrationCardConfig {
    serviceName: string;
    bodyKey: string;
    logoURL: string;
    type: Constants;
    link: string;
}
