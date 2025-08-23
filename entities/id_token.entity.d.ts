import { BaseEntity } from 'typeorm';
import { PlatformInfoType, UserInfoType } from '../utils/types';
import { PlatformModel } from './platform.entity';
export declare class IdTokenModel extends BaseEntity {
    iss: string;
    user: string;
    userInfo: UserInfoType;
    platformInfo: PlatformInfoType;
    clientId: string;
    platformId: string;
    deploymentId: string;
    createdAt: Date;
    expiresAt: number;
    platform: PlatformModel;
}
