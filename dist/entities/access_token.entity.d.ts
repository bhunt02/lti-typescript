import {EncryptedEntity} from '../utils/types';
import {PlatformModel} from './platform.entity';

export declare class AccessTokenModel extends EncryptedEntity {
    platformUrl: string;
    clientId: string;
    scopes: string;
    iv: string;
    data: string;
    createdAt: Date;
    expiresAt: number;
    platform: PlatformModel;
}
