import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@Entity('device_tokens')
export class DeviceToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mbNo: number;

  @Column()
  token: string;

  @Column({type: 'varchar', length: 16})
  platform: 'ios' | 'android' | 'web';

  @Column({nullable: true})
  deviceId: string;

  @Column({nullable: true})
  appVersion: string;

  @Column({default: true})
  optIn: boolean;

  @Column({type: 'datetime', nullable: true})
  lastSeenAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}