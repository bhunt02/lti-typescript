import { BaseEntity } from 'typeorm';
import { DeepLinkingSettings, IMSContext, IMSGradeEndpoint, IMSLaunchPresentation, IMSNamesRoles, IMSResourceLink, LISClaim } from '../utils/types';
export declare class ContextTokenModel extends BaseEntity {
    contextId: string;
    user: string;
    roles: string[];
    path: string;
    targetLinkUri: string;
    resource: IMSResourceLink;
    context?: IMSContext;
    custom?: Record<string, string>;
    launchPresentation: IMSLaunchPresentation;
    messageType: string;
    version: string;
    deepLinkingSettings?: DeepLinkingSettings;
    lis?: LISClaim;
    endpoint?: IMSGradeEndpoint;
    namesRoles?: IMSNamesRoles;
    createdAt: Date;
    expiresAt: number;
}
