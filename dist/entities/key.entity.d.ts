import {EncryptedEntity} from '../utils/types';
import {PlatformModel} from './platform.entity';

export declare class KeyModel extends EncryptedEntity {
    kid: string;
    platformUrl: string;
    clientId: string;
    iv: string;
    data: string;
}
export declare class PublicKeyModel extends KeyModel {
    platform: PlatformModel;
}
export declare class PrivateKeyModel extends KeyModel {
    platform: PlatformModel;
}
