import {BaseEntity} from 'typeorm';

export declare class StateModel extends BaseEntity {
    state: string;
    query: any;
    createdAt: Date;
    expiresAt: number;
}
