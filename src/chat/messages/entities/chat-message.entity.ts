// src/chat/entities/message.entity.ts
import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {User} from "../../../user/entities/user.entity";
import {BaseTable} from "../../../common/entity/base-table.entity";
import {ChatRoom} from "../../chat-room/entities/chat-room.entity";

export enum MessageType { SYSTEM, TEXT, IMAGE, FILE }

export enum FileKind { IMAGE, FILE }

@Entity()
export class ChatMessage extends BaseTable {
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: string; // bigint → string

  @ManyToOne(
    () => ChatRoom,
    room => room.messages,
    {onDelete: 'CASCADE', eager: false})
  room: ChatRoom;

  @ManyToOne(() => User, {onDelete: 'CASCADE', eager: false, createForeignKeyConstraints: false})
  author: User | null;

  @Column({type: 'enum', enum: MessageType, default: MessageType.TEXT})
  type: MessageType;

  @Column({type: 'text', nullable: true})
  content: string | null;
}
