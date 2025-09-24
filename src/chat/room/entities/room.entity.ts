// src/chat/entities/room.entity.ts
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import {User} from "../../../user/entities/user.entity";

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({length: 100})
  name: string;

  @ManyToOne(() => User, {
      createForeignKeyConstraints: false
    }
  )
  createdBy: User;

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @UpdateDateColumn({name: 'updated_at', nullable: true})
  updatedAt: Date | null;

  @DeleteDateColumn({name: 'deleted_at', nullable: true})
  deletedAt: Date | null;
}
