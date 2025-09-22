// src/chat/entities/message.entity.ts
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import {Room} from "../../room/entities/room.entity";
import {User} from "../../../user/entities/user.entity";
import {MessageType} from "../../entities/chat.entity";

@Entity('messages')
@Index('idx_messages_room_id_id_desc', ['room', 'id'])
export class Message {
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: string; // bigint → string

  @ManyToOne(() => Room, {onDelete: 'CASCADE', eager: false})
  room: Room;

  @ManyToOne(() => User, {onDelete: 'CASCADE', eager: false, createForeignKeyConstraints: false})
  user: User | null;

  @Column({type: 'enum', enum: MessageType, default: MessageType.TEXT})
  type: MessageType;

  @Column({type: 'text', nullable: true})
  content: string | null;

  @CreateDateColumn({name: 'created_at',})
  createdAt: Date;

  // 추후 개발용 수정,
  @UpdateDateColumn({name: 'edited_at', nullable: true})
  editedAt: Date | null;

  @DeleteDateColumn({name: 'deleted_at', nullable: true})
  deletedAt: Date | null;
}
