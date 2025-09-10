import {CreateDateColumn, DeleteDateColumn, UpdateDateColumn, VersionColumn} from 'typeorm';
import { Exclude } from 'class-transformer';

export class BaseTable {
    @CreateDateColumn()
    @Exclude()
    createdAt: Date;

    @UpdateDateColumn()
    @Exclude()
    updatedAt: Date;

    @DeleteDateColumn()
    @Exclude()
    deletedAt: Date;

    @VersionColumn()
    @Exclude()
    version: number;
}