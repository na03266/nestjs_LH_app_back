// src/chat/entities/message.entity.ts
import {Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Room} from "../../room/entities/chat-room.entity";
import {User} from "../../../user/entities/user.entity";
import {BaseTable} from "../../../common/entity/base-table.entity";

export enum MessageType { TEXT = 'text', ATTACHMENT = 'attachment', SYSTEM = 'system' }
export enum FileKind { IMAGE = 'image', FILE = 'file' }
export enum StorageKind { LOCAL = 'local', S3 = 's3' }
export enum MemberRole  { ADMIN = 'admin', MEMBER = 'member' }

@Entity('messages')
@Index('idx_messages_room_id_id', ['room', 'id'])
export class Message extends BaseTable{
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: string; // bigint → string

  @ManyToOne(() => Room, {onDelete: 'CASCADE', eager: false})
  room: Room;

  @ManyToOne(() => User, {onDelete: 'CASCADE', eager: false, createForeignKeyConstraints: false})
  author: User | null;

  @Column({type: 'enum', enum: MessageType, default: MessageType.TEXT})
  type: MessageType;

  @Column({type: 'text', nullable: true})
  content: string | null;
}
