import { BaseEntity } from 'typeorm';
export declare class NonceModel extends BaseEntity {
    nonce: string;
    createdAt: Date;
    expiresAt: number;
}
